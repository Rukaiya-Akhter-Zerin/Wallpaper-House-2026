use crate::error::Error;
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Display {
    pub id: u32,
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub is_primary: bool,
    pub x: i32,
    pub y: i32,
}

/// Get all connected displays.
#[command]
pub async fn get_displays() -> Result<Vec<Display>, Error> {
    #[cfg(target_os = "macos")]
    {
        get_displays_macos()
    }

    #[cfg(target_os = "windows")]
    {
        get_displays_windows()
    }

    #[cfg(target_os = "linux")]
    {
        get_displays_linux()
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        Ok(vec![Display {
            id: 0,
            name: "Primary".to_string(),
            width: 1920,
            height: 1080,
            is_primary: true,
            x: 0,
            y: 0,
        }])
    }
}

/// Set wallpaper for a specific display.
#[command]
pub async fn set_wallpaper_for_display(path: String, display_id: u32) -> Result<(), Error> {
    #[cfg(target_os = "macos")]
    {
        set_wallpaper_for_display_macos(&path, display_id)
    }

    #[cfg(target_os = "windows")]
    {
        // Windows doesn't have native per-monitor wallpaper via SystemParametersInfo.
        // We set it for all monitors as fallback.
        crate::commands::wallpaper::set_wallpaper(path).await
    }

    #[cfg(target_os = "linux")]
    {
        set_wallpaper_for_display_linux(&path, display_id)
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        Err(Error::Platform("Unsupported platform".to_string()))
    }
}

#[cfg(target_os = "macos")]
fn get_displays_macos() -> Result<Vec<Display>, Error> {
    use cocoa::base::{id, nil};
    use objc::class;
    use objc::msg_send;
    use objc::sel;
    use objc::sel_impl;

    let mut displays = Vec::new();

    unsafe {
        let screen_class = class!("NSScreen");
        let screens: id = msg_send![screen_class, screens];
        let count: usize = msg_send![screens, count];

        for i in 0..count {
            let screen: id = msg_send![screens, objectAtIndex: i];
            let frame: cocoa::foundation::NSRect = msg_send![screen, frame];
            let main_screen: id = msg_send![screen_class, mainScreen];
            let main_frame: cocoa::foundation::NSRect = msg_send![main_screen, frame];
            let is_primary = frame.origin.x == main_frame.origin.x
                && frame.origin.y == main_frame.origin.y;

            // Get display name from localized name
            let localized_name: id = msg_send![screen, localizedName];
            let name_cstr: *const i8 = msg_send![localized_name, UTF8String];
            let name = if name_cstr.is_null() {
                format!("Display {}", i)
            } else {
                std::ffi::CStr::from_ptr(name_cstr)
                    .to_string_lossy()
                    .into_owned()
            };

            displays.push(Display {
                id: i as u32,
                name,
                width: frame.size.width as u32,
                height: frame.size.height as u32,
                is_primary,
                x: frame.origin.x as i32,
                y: frame.origin.y as i32,
            });
        }
    }

    if displays.is_empty() {
        return Err(Error::DisplayNotFound(0));
    }

    Ok(displays)
}

#[cfg(target_os = "macos")]
fn set_wallpaper_for_display_macos(path: &str, display_id: u32) -> Result<(), Error> {
    use cocoa::base::{id, nil};
    use cocoa::foundation::NSString;
    use objc::class;
    use objc::msg_send;
    use objc::sel;
    use objc::sel_impl;

    unsafe {
        let screen_class = class!("NSScreen");
        let workspace_class = class!("NSWorkspace");
        let url_class = class!("NSURL");
        let screens: id = msg_send![screen_class, screens];
        let count: usize = msg_send![screens, count];

        if display_id as usize >= count {
            return Err(Error::DisplayNotFound(display_id));
        }

        let screen: id = msg_send![screens, objectAtIndex: display_id as usize];
        let workspace: id = msg_send![workspace_class, sharedWorkspace];
        let path_str = format!("file://{}", path);
        let ns_path: id = NSString::alloc(nil).init_str(&path_str);
        let url: id = msg_send![url_class, URLWithString: ns_path];
        let _: id = msg_send![workspace, setDesktopImageURL:url forScreen:screen options:nil error:nil];
    }

    Ok(())
}

#[cfg(target_os = "windows")]
fn get_displays_windows() -> Result<Vec<Display>, Error> {
    use std::ffi::OsString;
    use std::os::windows::ffi::OsStringExt;
    use windows::Win32::Graphics::Gdi::{
        EnumDisplayDevicesW, EnumDisplaySettingsW, DISPLAY_DEVICEW, DEVMODEW,
        ENUM_CURRENT_SETTINGS, DISPLAY_DEVICE_ACTIVE,
    };

    let mut displays = Vec::new();
    let mut device_index = 0u32;

    loop {
        let mut device = DISPLAY_DEVICEW::default();
        device.cb = std::mem::size_of::<DISPLAY_DEVICEW>() as u32;

        let success = unsafe { EnumDisplayDevicesW(None, device_index, &mut device, 0) };
        if !success.is_ok() {
            break;
        }

        if (device.StateFlags & DISPLAY_DEVICE_ACTIVE) != 0 {
            let name_raw = &device.DeviceName;
            let len = name_raw.iter().position(|&c| c == 0).unwrap_or(name_raw.len());
            let name = OsString::from_wide(&name_raw[..len])
                .to_string_lossy()
                .into_owned();

            let mut dev_mode = DEVMODEW::default();
            dev_mode.dmSize = std::mem::size_of::<DEVMODEW>() as u16;

            let settings_ok =
                unsafe { EnumDisplaySettingsW(Some(&device.DeviceName), ENUM_CURRENT_SETTINGS, &mut dev_mode) };

            let (width, height) = if settings_ok.is_ok() {
                (
                    dev_mode.dmPelsWidth,
                    dev_mode.dmPelsHeight,
                )
            } else {
                (1920, 1080)
            };

            let is_primary = (device.StateFlags & 0x4) != 0; // DISPLAY_DEVICE_PRIMARY_DEVICE

            displays.push(Display {
                id: device_index,
                name,
                width,
                height,
                is_primary,
                x: if settings_ok.is_ok() { dev_mode.dmPosition.x } else { 0 },
                y: if settings_ok.is_ok() { dev_mode.dmPosition.y } else { 0 },
            });
        }

        device_index += 1;
    }

    if displays.is_empty() {
        return Err(Error::DisplayNotFound(0));
    }

    Ok(displays)
}

#[cfg(target_os = "linux")]
fn get_displays_linux() -> Result<Vec<Display>, Error> {
    let output = std::process::Command::new("xrandr")
        .arg("--query")
        .output()
        .map_err(|e| Error::CommandFailed(format!("xrandr not available: {}", e)))?;

    if !output.status.success() {
        return Err(Error::CommandFailed("xrandr query failed".to_string()));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut displays = Vec::new();
    let mut id_counter = 0u32;

    for line in stdout.lines() {
        // Match lines like: "eDP-1 connected primary 1920x1080+0+0"
        // or "HDMI-1 connected 2560x1440+1920+0"
        if line.contains(" connected") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 3 {
                let name = parts[0].to_string();
                let is_primary = parts.contains(&"primary");

                // Find resolution+position like 1920x1080+0+0
                let res_part = parts.iter().find(|p| p.contains('x') && p.contains('+')).copied();
                let (width, height, x, y) = if let Some(res) = res_part {
                    let main_parts: Vec<&str> = res.split('+').collect();
                    let dims: Vec<&str> = main_parts[0].split('x').collect();
                    if dims.len() == 2 && main_parts.len() >= 3 {
                        (
                            dims[0].parse::<u32>().unwrap_or(1920),
                            dims[1].parse::<u32>().unwrap_or(1080),
                            main_parts[1].parse::<i32>().unwrap_or(0),
                            main_parts[2].parse::<i32>().unwrap_or(0),
                        )
                    } else {
                        (1920, 1080, 0, 0)
                    }
                } else {
                    (1920, 1080, 0, 0)
                };

                displays.push(Display {
                    id: id_counter,
                    name,
                    width,
                    height,
                    is_primary,
                    x,
                    y,
                });
                id_counter += 1;
            }
        }
    }

    if displays.is_empty() {
        // Return a default display if xrandr parsing fails
        displays.push(Display {
            id: 0,
            name: "Default".to_string(),
            width: 1920,
            height: 1080,
            is_primary: true,
            x: 0,
            y: 0,
        });
    }

    Ok(displays)
}

#[cfg(target_os = "linux")]
fn set_wallpaper_for_display_linux(path: &str, display_id: u32) -> Result<(), Error> {
    // For GNOME, we can't set per-monitor wallpapers easily.
    // Use gsettings to set for all monitors as fallback.
    let _ = display_id; // TODO: implement per-monitor on GNOME via dconf
    crate::commands::wallpaper::set_wallpaper(path)
}

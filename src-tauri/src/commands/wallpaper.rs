use crate::error::Error;
use std::path::Path;
use tauri::command;

/// Set the desktop wallpaper for the current platform.
#[command]
pub async fn set_wallpaper(path: String) -> Result<(), Error> {
    let path_buf = Path::new(&path);
    if !path_buf.exists() {
        return Err(Error::Io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            format!("File not found: {}", path),
        )));
    }

    #[cfg(target_os = "macos")]
    {
        set_wallpaper_macos(&path)?;
    }

    #[cfg(target_os = "windows")]
    {
        set_wallpaper_windows(&path)?;
    }

    #[cfg(target_os = "linux")]
    {
        set_wallpaper_linux(&path)?;
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        return Err(Error::Platform("Unsupported platform".to_string()));
    }

    Ok(())
}

/// Get the current wallpaper path.
#[command]
pub async fn get_current_wallpaper() -> Result<String, Error> {
    #[cfg(target_os = "macos")]
    {
        get_current_wallpaper_macos()
    }

    #[cfg(target_os = "windows")]
    {
        get_current_wallpaper_windows()
    }

    #[cfg(target_os = "linux")]
    {
        get_current_wallpaper_linux()
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        Err(Error::Platform("Unsupported platform".to_string()))
    }
}

#[cfg(target_os = "macos")]
fn set_wallpaper_macos(path: &str) -> Result<(), Error> {
    use cocoa::base::{id, nil};
    use cocoa::foundation::NSString;
    use objc::class;
    use objc::msg_send;
    use objc::sel;
    use objc::sel_impl;

    unsafe {
        let workspace_class = class!("NSWorkspace");
        let url_class = class!("NSURL");
        let workspace: id = msg_send![workspace_class, sharedWorkspace];
        let path_str = format!("file://{}", path);
        let ns_path = NSString::alloc(nil).init_str(&path_str);
        let url: id = msg_send![url_class, URLWithString: ns_path];
        let _: id = msg_send![workspace, setDesktopImageURL:url forScreen:nil options:nil error:nil];
    }
    Ok(())
}

#[cfg(target_os = "macos")]
fn get_current_wallpaper_macos() -> Result<String, Error> {
    use cocoa::base::{id, nil};
    use objc::class;
    use objc::msg_send;
    use objc::sel;
    use objc::sel_impl;

    unsafe {
        let workspace_class = class!("NSWorkspace");
        let screen_class = class!("NSScreen");
        let workspace: id = msg_send![workspace_class, sharedWorkspace];
        let screen: id = msg_send![screen_class, mainScreen];
        let url: id = msg_send![workspace, desktopImageURLForScreen:screen];
        if url == nil {
            return Err(Error::WallpaperNotFound);
        }
        let path_ns: id = msg_send![url, path];
        let cstr: *const i8 = msg_send![path_ns, UTF8String];
        if cstr.is_null() {
            return Err(Error::WallpaperNotFound);
        }
        Ok(std::ffi::CStr::from_ptr(cstr)
            .to_string_lossy()
            .into_owned())
    }
}

#[cfg(target_os = "windows")]
fn set_wallpaper_windows(path: &str) -> Result<(), Error> {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use windows::Win32::UI::WindowsAndMessaging::{
        SystemParametersInfoW, SPI_SETDESKWALLPAPER, SPIF_SENDCHANGE, SPIF_UPDATEINIFILE,
    };

    let wide: Vec<u16> = OsStr::new(path)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();

    let result = unsafe {
        SystemParametersInfoW(
            SPI_SETDESKWALLPAPER,
            0,
            Some(wide.as_ptr() as *const _),
            SPIF_UPDATEINIFILE | SPIF_SENDCHANGE,
        )
    };

    if result.is_err() {
        return Err(Error::CommandFailed(
            "SystemParametersInfoW failed".to_string(),
        ));
    }
    Ok(())
}

#[cfg(target_os = "windows")]
fn get_current_wallpaper_windows() -> Result<String, Error> {
    use std::ffi::OsString;
    use std::os::windows::ffi::OsStringExt;
    use windows::Win32::UI::WindowsAndMessaging::{
        SystemParametersInfoW, SPI_GETDESKWALLPAPER,
    };

    let mut buffer: [u16; 512] = [0; 512];
    let result = unsafe {
        SystemParametersInfoW(
            SPI_GETDESKWALLPAPER,
            buffer.len() as u32,
            Some(buffer.as_mut_ptr() as *mut _),
            Default::default(),
        )
    };

    if result.is_err() {
        return Err(Error::WallpaperNotFound);
    }

    let len = buffer.iter().position(|&c| c == 0).unwrap_or(buffer.len());
    let os_string = OsString::from_wide(&buffer[..len]);
    os_string.into_string().map_err(|_| Error::WallpaperNotFound)
}

#[cfg(target_os = "linux")]
fn set_wallpaper_linux(path: &str) -> Result<(), Error> {
    let file_uri = format!("file://{}", path);

    // Try GNOME/gsettings first
    let gnome_result = std::process::Command::new("gsettings")
        .args(["set", "org.gnome.desktop.background", "picture-uri", &file_uri])
        .output();

    if let Ok(output) = gnome_result {
        if output.status.success() {
            // Also set dark mode variant
            let _ = std::process::Command::new("gsettings")
                .args(["set", "org.gnome.desktop.background", "picture-uri-dark", &file_uri])
                .output();
            // Set to zoom/scaled mode
            let _ = std::process::Command::new("gsettings")
                .args(["set", "org.gnome.desktop.background", "picture-options", "zoom"])
                .output();
            return Ok(());
        }
    }

    // Fallback to feh
    let feh_result = std::process::Command::new("feh")
        .args(["--bg-fill", path])
        .output();

    if let Ok(output) = feh_result {
        if output.status.success() {
            return Ok(());
        }
    }

    // Fallback to nitrogen
    let nitrogen_result = std::process::Command::new("nitrogen")
        .args(["--set-zoom", "--save", path])
        .output();

    if let Ok(output) = nitrogen_result {
        if output.status.success() {
            return Ok(());
        }
    }

    Err(Error::CommandFailed(
        "Failed to set wallpaper: gsettings, feh, and nitrogen all failed".to_string(),
    ))
}

#[cfg(target_os = "linux")]
fn get_current_wallpaper_linux() -> Result<String, Error> {
    let output = std::process::Command::new("gsettings")
        .args(["get", "org.gnome.desktop.background", "picture-uri"])
        .output()
        .map_err(|e| Error::CommandFailed(format!("gsettings not available: {}", e)))?;

    if output.status.success() {
        let raw = String::from_utf8_lossy(&output.stdout);
        let trimmed = raw.trim().trim_matches('\'');
        if let Some(path) = trimmed.strip_prefix("file://") {
            return Ok(path.to_string());
        }
        return Ok(trimmed.to_string());
    }

    Err(Error::WallpaperNotFound)
}

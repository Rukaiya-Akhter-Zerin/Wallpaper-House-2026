mod commands;
mod error;

use commands::rotation::RotationState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .manage(RotationState::new())
        .setup(|app| {
            // Setup system tray
            commands::tray::setup_tray(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::wallpaper::set_wallpaper,
            commands::wallpaper::get_current_wallpaper,
            commands::display::get_displays,
            commands::display::set_wallpaper_for_display,
            commands::cache::save_to_cache,
            commands::cache::read_from_cache,
            commands::cache::get_cache_size,
            commands::cache::clear_cache,
            commands::cache::get_app_data_dir,
            commands::cache::download_and_cache,
            commands::cache::copy_to_downloads,
            commands::rotation::schedule_rotation,
            commands::rotation::cancel_rotation,
            commands::rotation::get_rotation_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use crate::error::Error;
use serde::Serialize;
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use tauri::{command, AppHandle, Emitter};

fn cache_dir() -> Result<PathBuf, Error> {
    let data_dir = dirs::data_dir().ok_or_else(|| {
        Error::CacheError("Could not determine data directory".to_string())
    })?;
    let cache = data_dir.join("wallpaper-house").join("cache");
    fs::create_dir_all(&cache)?;
    Ok(cache)
}

fn extension_from_url(url: &str) -> &str {
    url
        .split(|c| c == '?' || c == '#')
        .next()
        .unwrap_or(url)
        .rsplit('.')
        .next()
        .and_then(|e| {
            if e.len() <= 5 && e.chars().all(|c| c.is_alphanumeric() || c == '_') {
                Some(e)
            } else {
                None
            }
        })
        .unwrap_or("jpg")
}

fn url_to_filename(url: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    url.hash(&mut hasher);
    let hash = hasher.finish();
    let ext = extension_from_url(url);
    format!("{:016x}.{}", hash, ext)
}

fn wallpaper_house_downloads_dir() -> Result<PathBuf, Error> {
    let downloads_dir = dirs::download_dir().ok_or_else(|| {
        Error::CacheError("Could not determine Downloads directory".to_string())
    })?;
    let dir = downloads_dir.join("Walpaper-House-2026");
    fs::create_dir_all(&dir)?;
    Ok(dir)
}

fn sanitize_file_stem(name: &str) -> String {
    let sanitized: String = name
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || matches!(c, ' ' | '-' | '_' | '(' | ')') {
                c
            } else {
                '_'
            }
        })
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ");

    let trimmed = sanitized.trim_matches(|c| c == '.' || c == ' ' || c == '_' || c == '-').trim();
    if trimmed.is_empty() {
        "wallpaper".to_string()
    } else {
        trimmed.chars().take(90).collect()
    }
}

fn unique_destination(dir: &PathBuf, stem: &str, ext: &str) -> PathBuf {
    let mut dest = dir.join(format!("{}.{}", stem, ext));
    if !dest.exists() {
        return dest;
    }

    for i in 1..10000 {
        let candidate = dir.join(format!("{} ({}).{}", stem, i, ext));
        if !candidate.exists() {
            dest = candidate;
            break;
        }
    }
    dest
}

#[derive(Clone, Serialize)]
struct DownloadProgress {
    wallpaper_id: i64,
    progress: u8,
    downloaded: u64,
    total: Option<u64>,
}

fn emit_download_progress(app: &AppHandle, wallpaper_id: i64, progress: u8, downloaded: u64, total: Option<u64>) {
    let _ = app.emit(
        "wallpaper-download-progress",
        DownloadProgress {
            wallpaper_id,
            progress: progress.min(100),
            downloaded,
            total,
        },
    );
}

/// Save binary data to the local cache.
#[command]
pub async fn save_to_cache(url: String, data: Vec<u8>) -> Result<String, Error> {
    let dir = cache_dir()?;
    let filename = url_to_filename(&url);
    let filepath = dir.join(&filename);
    fs::write(&filepath, &data)?;
    Ok(filepath.to_string_lossy().into_owned())
}

/// Check if a URL is already cached and return its local path.
#[command]
pub async fn read_from_cache(url: String) -> Result<Option<String>, Error> {
    let dir = cache_dir()?;
    let filename = url_to_filename(&url);
    let filepath = dir.join(&filename);
    if filepath.exists() {
        Ok(Some(filepath.to_string_lossy().into_owned()))
    } else {
        Ok(None)
    }
}

/// Get total cache size in bytes.
#[command]
pub async fn get_cache_size() -> Result<u64, Error> {
    let dir = cache_dir()?;
    let mut total = 0u64;
    if dir.exists() {
        for entry in fs::read_dir(&dir)? {
            let entry = entry?;
            if entry.file_type()?.is_file() {
                total += entry.metadata()?.len();
            }
        }
    }
    Ok(total)
}

/// Clear all cached files.
#[command]
pub async fn clear_cache() -> Result<(), Error> {
    let dir = cache_dir()?;
    if dir.exists() {
        for entry in fs::read_dir(&dir)? {
            let entry = entry?;
            if entry.file_type()?.is_file() {
                fs::remove_file(entry.path())?;
            }
        }
    }
    Ok(())
}

/// Get the application data directory path.
#[command]
pub async fn get_app_data_dir() -> Result<String, Error> {
    let data_dir = dirs::data_dir().ok_or_else(|| {
        Error::CacheError("Could not determine data directory".to_string())
    })?;
    let app_dir = data_dir.join("wallpaper-house");
    fs::create_dir_all(&app_dir)?;
    Ok(app_dir.to_string_lossy().into_owned())
}

/// Copy a file to the user's Downloads/Walpaper-House-2026 directory.
#[command]
pub async fn copy_to_downloads(source_path: String) -> Result<String, Error> {
    let source = PathBuf::from(&source_path);
    if !source.exists() {
        return Err(Error::Io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            format!("Source file not found: {}", source_path),
        )));
    }

    let downloads_dir = wallpaper_house_downloads_dir()?;

    let stem = source
        .file_stem()
        .and_then(|s| s.to_str())
        .map(sanitize_file_stem)
        .unwrap_or_else(|| "wallpaper".to_string());
    let ext = source
        .extension()
        .and_then(|s| s.to_str())
        .filter(|e| !e.is_empty())
        .unwrap_or("jpg");

    let dest = unique_destination(&downloads_dir, &stem, ext);

    fs::copy(&source, &dest)?;
    Ok(dest.to_string_lossy().into_owned())
}

/// Download an image from URL and save it to Downloads/Walpaper-House-2026.
#[command]
pub async fn download_wallpaper(
    app: AppHandle,
    wallpaper_id: i64,
    url: String,
    title: String,
) -> Result<String, Error> {
    let downloads_dir = wallpaper_house_downloads_dir()?;
    let ext = extension_from_url(&url);
    let stem = sanitize_file_stem(&title);
    let dest = unique_destination(&downloads_dir, &stem, ext);

    emit_download_progress(&app, wallpaper_id, 1, 0, None);

    let mut response = reqwest::get(&url)
        .await
        .map_err(|e| Error::CommandFailed(format!("Download failed: {}", e)))?;

    if !response.status().is_success() {
        return Err(Error::CommandFailed(format!(
            "Download HTTP error: {}",
            response.status()
        )));
    }

    let total = response.content_length();
    let mut downloaded = 0u64;
    let mut file = fs::File::create(&dest)?;

    while let Some(chunk) = response
        .chunk()
        .await
        .map_err(|e| Error::CommandFailed(format!("Failed to read response: {}", e)))?
    {
        file.write_all(&chunk)?;
        downloaded += chunk.len() as u64;
        let progress = total
            .map(|size| ((downloaded as f64 / size.max(1) as f64) * 100.0).round() as u8)
            .unwrap_or(50);
        emit_download_progress(&app, wallpaper_id, progress.min(99), downloaded, total);
    }

    file.flush()?;
    emit_download_progress(&app, wallpaper_id, 100, downloaded, total);
    Ok(dest.to_string_lossy().into_owned())
}

/// Download an image from URL and save to cache, then return the local path.
/// This avoids sending multi-MB byte arrays over Tauri IPC.
#[command]
pub async fn download_and_cache(url: String) -> Result<String, Error> {
    let dir = cache_dir()?;
    let filename = url_to_filename(&url);
    let filepath = dir.join(&filename);

    // Return cached path if already exists
    if filepath.exists() && filepath.metadata()?.len() > 0 {
        return Ok(filepath.to_string_lossy().into_owned());
    }

    let response = reqwest::get(&url)
        .await
        .map_err(|e| Error::CommandFailed(format!("Download failed: {}", e)))?;

    if !response.status().is_success() {
        return Err(Error::CommandFailed(format!(
            "Download HTTP error: {}",
            response.status()
        )));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| Error::CommandFailed(format!("Failed to read response: {}", e)))?;

    fs::write(&filepath, &bytes)?;
    Ok(filepath.to_string_lossy().into_owned())
}

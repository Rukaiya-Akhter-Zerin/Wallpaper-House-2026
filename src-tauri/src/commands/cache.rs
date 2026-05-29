use crate::error::Error;
use std::fs;
use std::path::PathBuf;
use tauri::command;

fn cache_dir() -> Result<PathBuf, Error> {
    let data_dir = dirs::data_dir().ok_or_else(|| {
        Error::CacheError("Could not determine data directory".to_string())
    })?;
    let cache = data_dir.join("wallpaper-house").join("cache");
    fs::create_dir_all(&cache)?;
    Ok(cache)
}

fn url_to_filename(url: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    url.hash(&mut hasher);
    let hash = hasher.finish();
    let ext = url
        .rsplit('.')
        .next()
        .and_then(|e| {
            if e.len() <= 5 && e.chars().all(|c| c.is_alphanumeric() || c == '_') {
                Some(e)
            } else {
                None
            }
        })
        .unwrap_or("jpg");
    format!("{:016x}.{}", hash, ext)
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

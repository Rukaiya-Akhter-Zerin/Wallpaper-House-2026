use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Platform not supported: {0}")]
    Platform(String),

    #[error("Wallpaper not found")]
    WallpaperNotFound,

    #[error("Display not found: {0}")]
    DisplayNotFound(u32),

    #[error("Cache error: {0}")]
    CacheError(String),

    #[error("Rotation error: {0}")]
    RotationError(String),

    #[error("Command failed: {0}")]
    CommandFailed(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

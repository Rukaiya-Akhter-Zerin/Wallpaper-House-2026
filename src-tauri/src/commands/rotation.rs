use crate::error::Error;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::{command, AppHandle, Emitter, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RotationConfig {
    pub interval_secs: u64,
    pub mode: String, // "sequential", "random", "category", "favorites"
    pub category: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RotationStatus {
    pub active: bool,
    pub config: Option<RotationConfig>,
    pub next_rotation_at: Option<String>,
}

pub struct RotationState {
    pub active: Arc<Mutex<bool>>,
    pub config: Arc<Mutex<Option<RotationConfig>>>,
    pub cancel_tx: Arc<Mutex<Option<tokio::sync::oneshot::Sender<()>>>>,
}

impl RotationState {
    pub fn new() -> Self {
        Self {
            active: Arc::new(Mutex::new(false)),
            config: Arc::new(Mutex::new(None)),
            cancel_tx: Arc::new(Mutex::new(None)),
        }
    }
}

/// Start automatic wallpaper rotation.
#[command]
pub async fn schedule_rotation(
    app: AppHandle,
    config: RotationConfig,
) -> Result<(), Error> {
    let state = app.state::<RotationState>();

    // Cancel any existing rotation
    {
        let mut cancel = state.cancel_tx.lock().unwrap();
        if let Some(tx) = cancel.take() {
            let _ = tx.send(());
        }
    }

    let interval = config.interval_secs;
    if interval == 0 {
        return Err(Error::RotationError(
            "Interval must be greater than 0".to_string(),
        ));
    }

    let (tx, mut rx) = tokio::sync::oneshot::channel::<()>();

    {
        let mut cancel = state.cancel_tx.lock().unwrap();
        *cancel = Some(tx);
    }
    {
        let mut active = state.active.lock().unwrap();
        *active = true;
    }
    {
        let mut cfg = state.config.lock().unwrap();
        *cfg = Some(config);
    }

    // Emit rotation started event
    let _ = app.emit("rotation-changed", serde_json::json!({ "active": true, "interval": interval }));

    let app_handle = app.clone();
    let active_flag = state.active.clone();

    tokio::spawn(async move {
        let duration = std::time::Duration::from_secs(interval);
        loop {
            tokio::select! {
                _ = &mut rx => {
                    break;
                }
                _ = tokio::time::sleep(duration) => {
                    // Check if still active
                    let is_active = *active_flag.lock().unwrap();
                    if !is_active {
                        break;
                    }
                    // Emit rotation event — frontend picks the next wallpaper
                    let _ = app_handle.emit("rotate-wallpaper", serde_json::json!({}));
                }
            }
        }
    });

    Ok(())
}

/// Stop automatic wallpaper rotation.
#[command]
pub async fn cancel_rotation(app: AppHandle) -> Result<(), Error> {
    let state = app.state::<RotationState>();

    {
        let mut active = state.active.lock().unwrap();
        *active = false;
    }
    {
        let mut cancel = state.cancel_tx.lock().unwrap();
        if let Some(tx) = cancel.take() {
            let _ = tx.send(());
        }
    }
    {
        let mut cfg = state.config.lock().unwrap();
        *cfg = None;
    }

    let _ = app.emit("rotation-changed", serde_json::json!({ "active": false }));

    Ok(())
}

/// Get current rotation status.
#[command]
pub async fn get_rotation_status(app: AppHandle) -> Result<RotationStatus, Error> {
    let state = app.state::<RotationState>();
    let active = *state.active.lock().unwrap();
    let config = state.config.lock().unwrap().clone();

    Ok(RotationStatus {
        active,
        config,
        next_rotation_at: None,
    })
}

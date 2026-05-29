import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

interface RotationStatus {
  active: boolean;
  mode: string;
  interval: number;
  next_rotation_at: string | null;
}

export function useRotation() {
  const [status, setStatus] = useState<RotationStatus>({ active: false, mode: "sequential", interval: 3600, next_rotation_at: null });

  const startRotation = useCallback(async (intervalSecs: number, mode: string) => {
    try {
      await invoke("schedule_rotation", { config: { interval_secs: intervalSecs, mode, category: null } });
      setStatus({ active: true, mode, interval: intervalSecs, next_rotation_at: new Date(Date.now() + intervalSecs * 1000).toISOString() });
    } catch (err) {
      console.error("Failed to start rotation:", err);
    }
  }, []);

  const stopRotation = useCallback(async () => {
    try {
      await invoke("cancel_rotation");
      setStatus((s) => ({ ...s, active: false, next_rotation_at: null }));
    } catch (err) {
      console.error("Failed to stop rotation:", err);
    }
  }, []);

  return { status, startRotation, stopRotation };
}

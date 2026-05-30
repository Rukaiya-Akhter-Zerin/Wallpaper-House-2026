import { useToastStore } from "@/stores/toastStore";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = { success: CheckCircle, error: AlertCircle, info: Info };

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type ?? "success"];
        return (
          <div
            key={toast.id}
            className={cn(
              "toast-enter glass flex items-center gap-3 rounded-lg px-4 py-3 text-sm shadow-lg min-w-[280px]",
              toast.type === "error" && "border-destructive/50",
              toast.type === "success" && "border-success/50"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", toast.type === "error" && "text-destructive", toast.type === "success" && "text-success")} />
            <span className="flex-1 text-foreground">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

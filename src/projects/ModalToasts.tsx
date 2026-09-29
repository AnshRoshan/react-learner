import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Bell, CircleAlert, CircleCheck, Info, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  tone: "ok" | "info" | "bad";
}
type ToastAction = { type: "push"; toast: Toast } | { type: "dismiss"; id: number };
type Push = (message: string, tone?: Toast["tone"]) => void;

const TONE_STYLE = {
  ok: { icon: CircleCheck, color: "var(--ok)" },
  info: { icon: Info, color: "var(--brand)" },
  bad: { icon: CircleAlert, color: "var(--bad)" },
} as const;

// @region autoDismiss
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(timer); // cleanup: the toast was dismissed by hand, or unmounted early
  }, [toast.id, onDismiss]);

  const { icon: Icon, color } = TONE_STYLE[toast.tone];
  return (
    <div
      role="status"
      className="pointer-events-auto flex w-72 animate-slide items-start gap-3 rounded-2xl border bg-solid p-3.5 shadow-2xl"
      style={{ borderColor: `color-mix(in oklab, ${color} 45%, transparent)` }}
    >
      <Icon size={18} style={{ color }} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm leading-snug text-ink">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} aria-label="Dismiss" className="text-ink3 transition hover:text-ink">
        <X size={15} />
      </button>
    </div>
  );
}
// @endregion

// @region toasts
// Notification system = context (so anything can push) + reducer (the queue) + portal (where it renders).
function toastReducer(list: Toast[], action: ToastAction): Toast[] {
  return action.type === "push" ? [...list, action.toast].slice(-4) : list.filter((t) => t.id !== action.id);
}

const ToastContext = createContext<Push>(() => {});
const useToast = () => useContext(ToastContext);

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const nextId = useRef(1);

  // Stable identities, so consumers and the effects above don't churn on every render
  const push = useCallback<Push>(
    (message, tone = "info") => dispatch({ type: "push", toast: { id: nextId.current++, message, tone } }),
    [],
  );
  const dismiss = useCallback((id: number) => dispatch({ type: "dismiss", id }), []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      {/* Portal: render the stack straight into <body>, no matter where the app lives */}
      {createPortal(
        <div className="pointer-events-none fixed bottom-5 right-5 z-[110] flex flex-col gap-2.5">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
// @endregion

// @region modal
function Modal({
  open,
  onClose,
  portal,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  portal: boolean;
  title: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;

    dialogRef.current?.focus(); // 1 · move focus into the dialog
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(); // 2 · close on Escape
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden"; // 3 · lock page scroll

    return () => {
      // Cleanup mirrors setup, step by step
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      trigger?.focus(); // give focus back to the button that opened us
    };
  }, [open, onClose]);

  if (!open) return null;

  const overlay = (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm animate-fade"
      onMouseDown={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-sm animate-pop rounded-3xl border border-line2 bg-solid p-6 shadow-2xl outline-none"
      >
        <h4 className="font-display text-lg font-bold text-ink">{title}</h4>
        {children}
      </div>
    </div>
  );

  // The one line that changes where the DOM nodes live:
  return portal ? createPortal(overlay, document.body) : overlay;
}
// @endregion

function Demo() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [portal, setPortal] = useState(true);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-5 py-10">
      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
          <Bell size={15} className="text-brand" /> Toasts (portal → body)
        </p>
        <div className="flex flex-wrap gap-2.5">
          <button className="btn btn-soft btn-sm" onClick={() => toast("Saved successfully", "ok")}>
            Success
          </button>
          <button className="btn btn-soft btn-sm" onClick={() => toast("New version available", "info")}>
            Info
          </button>
          <button className="btn btn-soft btn-sm" onClick={() => toast("Upload failed — retry?", "bad")}>
            Error
          </button>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink2">
        <input type="checkbox" checked={portal} onChange={(e) => setPortal(e.target.checked)} />
        Render the modal in a <b className="text-ink">portal</b>
      </label>

      {/* This box has overflow:hidden AND a transform. A position:fixed child can't escape it — unless it's portalled. */}
      <div
        className="relative min-h-[15rem] overflow-hidden rounded-2xl border border-dashed border-line2 bg-surface p-6"
        style={{ transform: "translateZ(0)" }}
      >
        <p className="max-w-md text-sm leading-relaxed text-ink2">
          This container has <code className="font-mono text-brand">overflow: hidden</code> and a CSS transform. Open the modal with the portal{" "}
          <b className="text-ink">off</b> and it's trapped inside; turn it <b className="text-ink">on</b> and it covers the page.
        </p>
        <button className="btn btn-primary mt-5" onClick={() => setOpen(true)}>
          Open modal
        </button>

        <Modal open={open} onClose={close} portal={portal} title="Delete this project?">
          <p className="mt-2 text-sm leading-relaxed text-ink2">
            This can't be undone. Press <span className="kbd">Esc</span> or click outside to cancel.
          </p>
          <div className="mt-6 flex justify-end gap-2.5">
            <button className="btn btn-soft btn-sm" onClick={close}>
              Cancel
            </button>
            <button
              className="btn btn-sm bg-bad text-white"
              onClick={() => {
                close();
                toast("Project deleted", "ok");
              }}
            >
              Delete
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default function ModalToasts() {
  return (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  );
}

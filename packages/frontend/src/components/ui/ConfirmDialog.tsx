import Modal from "./Modal";
import Button from "./Button";
import Icon from "./Icon";
import type { IconName } from "./Icon";

type Tone = "danger" | "neutral";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  note?: string;
  confirmLabel?: string;
  /** "danger" para lo que destruye datos, "neutral" para el resto. */
  tone?: Tone;
  icon?: IconName;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const toneStyles: Record<Tone, { badge: string; note: string }> = {
  danger: {
    badge: "bg-red-100 text-red-600",
    note: "border-amber-200 bg-amber-50 text-amber-800",
  },
  neutral: {
    badge: "bg-blue-50 text-blue-600",
    note: "border-gray-200 bg-gray-50 text-gray-600",
  },
};

export default function ConfirmDialog({
  open,
  title,
  message,
  note,
  confirmLabel = "Eliminar",
  tone = "danger",
  icon,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const styles = toneStyles[tone];

  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.badge}`}
        >
          <Icon
            name={icon ?? (tone === "danger" ? "warning" : "circle")}
            className="h-5 w-5"
          />
        </span>

        <div className="space-y-3">
          <p className="text-sm text-gray-700">{message}</p>
          {note && (
            <div role="note" className={`rounded-lg border p-3 ${styles.note}`}>
              <p className="text-xs">{note}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

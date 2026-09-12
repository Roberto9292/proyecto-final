import Modal from "./Modal";
import Button from "./Button";
import Icon from "./Icon";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  note?: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  note,
  confirmLabel = "Eliminar",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
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
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <Icon name="warning" className="h-5 w-5" />
        </span>

        <div className="space-y-3">
          <p className="text-sm text-gray-700">{message}</p>
          {note && (
            <div
              role="note"
              className="rounded-lg border border-amber-200 bg-amber-50 p-3"
            >
              <p className="text-xs text-amber-800">{note}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

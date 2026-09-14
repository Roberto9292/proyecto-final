import { useRef } from "react";
import type { ReactNode } from "react";
import Modal from "./Modal";
import Button from "./Button";
import Icon from "./Icon";
import type { IconName } from "./Icon";

type Tone = "danger" | "neutral";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** La pregunta, sin el nombre del registro dentro. */
  question: string;
  /** El registro afectado. Se destaca para que se vea qué se está por tocar. */
  target?: string;
  /** Dato secundario del registro: una categoría, un rol, cuántas tareas usa. */
  targetMeta?: ReactNode;
  /** Qué consecuencia tiene confirmar. */
  consequence?: string;
  confirmLabel?: string;
  /** "danger" para lo que destruye datos, "neutral" para el resto. */
  tone?: Tone;
  icon?: IconName;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const toneStyles: Record<Tone, { badge: string; consequence: string }> = {
  danger: {
    badge: "bg-red-50 text-red-600 ring-1 ring-inset ring-red-100",
    consequence: "border-red-400 bg-red-50/70 text-red-800",
  },
  neutral: {
    badge: "bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100",
    consequence: "border-gray-300 bg-gray-50 text-gray-600",
  },
};

export default function ConfirmDialog({
  open,
  title,
  question,
  target,
  targetMeta,
  consequence,
  confirmLabel = "Eliminar",
  tone = "danger",
  icon,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // El foco arranca en Cancelar: si arrancara en el botón que destruye, un
  // Enter de más bastaría para confirmar sin haber leído nada.
  const cancelRef = useRef<HTMLButtonElement>(null);
  const styles = toneStyles[tone];

  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      initialFocus={cancelRef}
      footer={
        <>
          <Button
            ref={cancelRef}
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
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
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.badge}`}
          >
            <Icon
              name={icon ?? (tone === "danger" ? "warning" : "circle")}
              className="h-5 w-5"
            />
          </span>
          <p className="text-sm font-medium text-gray-900">{question}</p>
        </div>

        {/* El registro y la consecuencia ocupan el ancho completo del diálogo:
            ninguno de los dos pertenece a la columna del ícono. */}
        {target && (
          <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50/70">
            <p className="truncate px-4 py-3 text-sm font-semibold text-gray-900">
              {target}
            </p>
            {targetMeta && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-500">
                {targetMeta}
              </div>
            )}
          </div>
        )}

        {consequence && (
          <p
            role="note"
            className={`flex w-full items-start gap-2 rounded-xl border-l-4 px-4 py-3 text-xs leading-relaxed ${styles.consequence}`}
          >
            <Icon name="warning" className="mt-px h-3.5 w-3.5 shrink-0" />
            <span>{consequence}</span>
          </p>
        )}
      </div>
    </Modal>
  );
}

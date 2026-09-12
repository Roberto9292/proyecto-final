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
    consequence: "border-red-200 bg-red-50 text-red-700",
  },
  neutral: {
    badge: "bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100",
    consequence: "border-gray-200 bg-gray-50 text-gray-600",
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
        <div className="flex gap-4">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.badge}`}
          >
            <Icon
              name={icon ?? (tone === "danger" ? "warning" : "circle")}
              className="h-5 w-5"
            />
          </span>

          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-sm text-gray-700">{question}</p>

            {target && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {target}
                </p>
                {targetMeta && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {targetMeta}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ocupa todo el ancho, alineada con el ícono: la consecuencia es del
            diálogo entero, no del registro que se muestra al costado. */}
        {consequence && (
          <p
            role="note"
            className={`rounded-lg border px-3 py-2.5 text-xs ${styles.consequence}`}
          >
            {consequence}
          </p>
        )}
      </div>
    </Modal>
  );
}

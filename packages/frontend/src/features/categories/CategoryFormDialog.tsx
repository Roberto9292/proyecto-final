import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import Input from "../../components/ui/Input";
import ColorPicker from "../../components/ui/ColorPicker";
import Badge from "../../components/ui/Badge";
import type { Category, CategoryInput } from "../../hooks/useCategories";

const DEFAULT_COLOR = "#3B82F6";
const MAX_NAME = 40;

interface CategoryFormDialogProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSubmit: (input: CategoryInput) => Promise<void>;
}

export default function CategoryFormDialog({
  open,
  category,
  onClose,
  onSubmit,
}: CategoryFormDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setColor(category?.color ?? DEFAULT_COLOR);
    setError(undefined);
  }, [open, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError("El nombre es requerido");
      return;
    }
    if (trimmed.length > MAX_NAME) {
      setError(`El nombre no puede exceder ${MAX_NAME} caracteres`);
      return;
    }

    setSaving(true);
    try {
      await onSubmit({ name: trimmed, color });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={category ? "Editar categoría" : "Nueva categoría"}
      description={
        category
          ? "Actualizá el nombre o el color de la categoría."
          : "Creá una categoría para organizar tus tareas."
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="category-form"
            loading={saving}
            icon="check"
          >
            {category ? "Guardar cambios" : "Crear categoría"}
          </Button>
        </>
      }
    >
      <form
        id="category-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-5"
      >
        <Field
          label="Nombre"
          required
          error={error}
          hint={`${name.length}/${MAX_NAME} caracteres`}
        >
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={Boolean(error)}
              autoFocus
              autoComplete="off"
              maxLength={MAX_NAME}
              placeholder="Ej: Trabajo"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(undefined);
              }}
            />
          )}
        </Field>

        <Field label="Color" hint="Elegí uno de la paleta o definí el tuyo.">
          {({ id }) => <ColorPicker id={id} value={color} onChange={setColor} />}
        </Field>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="mb-2 text-xs font-medium text-gray-500">
            Vista previa
          </p>
          <Badge color={color}>{name.trim() || "Sin nombre"}</Badge>
        </div>
      </form>
    </Modal>
  );
}

import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import type { Category } from "../../hooks/useCategories";
import type { Todo, TodoInput } from "../../hooks/useTodos";

const MAX_TITLE = 80;
const MAX_DESCRIPTION = 200;

type FormErrors = Partial<Record<keyof TodoInput | "form", string>>;

interface TodoFormDialogProps {
  open: boolean;
  todo: Todo | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (input: TodoInput) => Promise<void>;
}

export default function TodoFormDialog({
  open,
  todo,
  categories,
  onClose,
  onSubmit,
}: TodoFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(todo?.title ?? "");
    setDescription(todo?.description ?? "");
    setDueDate(todo?.dueDate ? todo.dueDate.split("T")[0] : "");
    setCategoryId(todo?.categoryId ?? "");
    setErrors({});
  }, [open, todo]);

  const clear = (field: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const validate = (): FormErrors => {
    const found: FormErrors = {};

    if (!title.trim()) found.title = "El título es requerido";
    else if (title.trim().length > MAX_TITLE)
      found.title = `El título no puede exceder ${MAX_TITLE} caracteres`;

    if (description.trim().length > MAX_DESCRIPTION)
      found.description = `La descripción no puede exceder ${MAX_DESCRIPTION} caracteres`;

    if (dueDate && Number.isNaN(new Date(dueDate).getTime()))
      found.dueDate = "La fecha no es válida";

    return found;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || null,
        categoryId: categoryId || null,
      });
      onClose();
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Error al guardar",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={todo ? "Editar tarea" : "Nueva tarea"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="todo-form"
            loading={saving}
            icon="check"
          >
            {todo ? "Guardar cambios" : "Crear tarea"}
          </Button>
        </>
      }
    >
      <form id="todo-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errors.form && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
          >
            {errors.form}
          </p>
        )}

        <Field
          label="Título"
          required
          error={errors.title}
          hint={`${title.length}/${MAX_TITLE} caracteres`}
        >
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={Boolean(errors.title)}
              autoFocus
              autoComplete="off"
              maxLength={MAX_TITLE}
              placeholder="Ej: Comprar pan"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clear("title");
              }}
            />
          )}
        </Field>

        <Field
          label="Descripción"
          error={errors.description}
          hint={`Opcional · ${description.length}/${MAX_DESCRIPTION} caracteres`}
        >
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              invalid={Boolean(errors.description)}
              maxLength={MAX_DESCRIPTION}
              placeholder="Ej: Comprar pan en la panadería de la esquina"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clear("description");
              }}
            />
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Fecha límite" error={errors.dueDate} hint="Opcional.">
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                invalid={Boolean(errors.dueDate)}
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  clear("dueDate");
                }}
              />
            )}
          </Field>

          <Field label="Categoría" error={errors.categoryId} hint="Opcional.">
            {({ id, describedBy }) => (
              <Select
                id={id}
                aria-describedby={describedBy}
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  clear("categoryId");
                }}
              >
                <option value="">Sin categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </form>
    </Modal>
  );
}

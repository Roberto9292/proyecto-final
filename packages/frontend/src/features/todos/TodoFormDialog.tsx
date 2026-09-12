import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import type { Category } from "../../hooks/useCategories";
import type { Todo, TodoInput } from "../../hooks/useTodos";


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
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(todo?.title ?? "");
    setDescription(todo?.description ?? "");
    setDueDate(todo?.dueDate ? todo.dueDate.split("T")[0] : "");
    setCategoryId(todo?.categoryId ?? "");
    setError(undefined);
  }, [open, todo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setError("El título es requerido");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        title: trimmed,
        description: description.trim() || undefined,
        dueDate: dueDate || null,
        categoryId: categoryId || null,
      });
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
      title={todo ? "Editar tarea" : "Nueva tarea"}
      description={
        todo
          ? "Modificá los datos de la tarea."
          : "Agregá una tarea a tu lista."
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="todo-form" loading={saving} icon="check">
            {todo ? "Guardar cambios" : "Crear tarea"}
          </Button>
        </>
      }
    >
      <form id="todo-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Título" required error={error}>
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={Boolean(error)}
              autoFocus
              autoComplete="off"
              placeholder="Ej: Comprar pan"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(undefined);
              }}
            />
          )}
        </Field>

        <Field label="Descripción" hint="Opcional.">
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              autoComplete="off"
              placeholder="Detalles de la tarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Fecha límite" hint="Opcional.">
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            )}
          </Field>

          <Field label="Categoría" hint="Opcional.">
            {({ id, describedBy }) => (
              <Select
                id={id}
                aria-describedby={describedBy}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
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

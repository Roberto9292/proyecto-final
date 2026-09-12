import { useMemo, useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { useTodos } from "../hooks/useTodos";
import type { Category, CategoryInput } from "../hooks/useCategories";
import { showToast } from "../components/Toast";
import CategoryFormDialog from "../features/categories/CategoryFormDialog";
import PageHeader from "../components/ui/PageHeader";
import Toolbar from "../components/ui/Toolbar";
import SearchInput from "../components/ui/SearchInput";
import Button from "../components/ui/Button";
import IconButton from "../components/ui/IconButton";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import ColorSwatch from "../components/ui/ColorSwatch";
import InlineEdit from "../components/ui/InlineEdit";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { Table, Row, Cell, TableFooter } from "../components/ui/Table";

export default function CategoriesPage() {
  const { categories, loading, reload, create, update, remove } =
    useCategories();
  const { todos } = useTodos();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [removing, setRemoving] = useState(false);

  const todoCountByCategory = useMemo(() => {
    return todos.reduce<Record<string, number>>((acc, todo) => {
      if (todo.categoryId) acc[todo.categoryId] = (acc[todo.categoryId] ?? 0) + 1;
      return acc;
    }, {});
  }, [todos]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(term));
  }, [categories, search]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setFormOpen(true);
  };

  const handleSubmit = async (input: CategoryInput) => {
    if (editing) {
      await update(editing.id, input);
      showToast("Categoría actualizada", "success");
    } else {
      await create(input);
      showToast("Categoría creada", "success");
    }
  };

  const handleRename = async (category: Category, name: string) => {
    try {
      await update(category.id, { name });
      showToast("Categoría actualizada", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al renombrar",
        "error",
      );
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await remove(deleting.id);
      showToast("Categoría eliminada", "success");
      setDeleting(null);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al eliminar",
        "error",
      );
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Categorías"
        subtitle="Organizá tus tareas agrupándolas por categoría."
        actions={
          <Button icon="plus" onClick={openCreate}>
            Nueva categoría
          </Button>
        }
      />

      <Toolbar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre..."
        />
        <IconButton
          icon="refresh"
          label="Actualizar"
          onClick={reload}
          disabled={loading}
        />
      </Toolbar>

      <Card>
        {loading ? (
          <Spinner label="Cargando categorías..." />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="categories"
            title={
              search ? "Sin resultados" : "Todavía no tenés categorías"
            }
            message={
              search
                ? `Ninguna categoría coincide con "${search}".`
                : "Creá tu primera categoría para empezar a organizar las tareas."
            }
            action={
              !search && (
                <Button icon="plus" onClick={openCreate}>
                  Crear categoría
                </Button>
              )
            }
          />
        ) : (
          <>
            <Table
              caption="Listado de categorías"
              headers={["Categoría", "Tareas", "_Acciones"]}
            >
              {visible.map((category) => (
                <Row key={category.id}>
                  <Cell>
                    <div className="flex items-center gap-3">
                      <ColorSwatch color={category.color} name={category.name} />
                      <InlineEdit
                        value={category.name}
                        label={`el nombre de ${category.name}`}
                        className="font-medium text-gray-900"
                        onSave={(name) => handleRename(category, name)}
                      />
                    </div>
                  </Cell>
                  <Cell>
                    {todoCountByCategory[category.id] ? (
                      <Badge tone="info">
                        {todoCountByCategory[category.id]}{" "}
                        {todoCountByCategory[category.id] === 1
                          ? "tarea"
                          : "tareas"}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">Sin uso</span>
                    )}
                  </Cell>
                  <Cell align="right">
                    <div className="flex justify-end gap-1">
                      <IconButton
                        icon="edit"
                        label={`Editar ${category.name}`}
                        onClick={() => openEdit(category)}
                      />
                      <IconButton
                        icon="trash"
                        tone="danger"
                        label={`Eliminar ${category.name}`}
                        onClick={() => setDeleting(category)}
                      />
                    </div>
                  </Cell>
                </Row>
              ))}
            </Table>

            <TableFooter>
              <span className="text-sm text-gray-500">
                {visible.length} de {categories.length}{" "}
                {categories.length === 1 ? "categoría" : "categorías"}
              </span>
            </TableFooter>
          </>
        )}
      </Card>

      <CategoryFormDialog
        open={formOpen}
        category={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar categoría"
        question="¿Estás seguro que deseas eliminar esta categoría?"
        target={deleting?.name ?? ""}
        targetMeta={
          deleting && (
            <>
              <ColorSwatch color={deleting.color} name={deleting.name} />
              <span>{deleting.color ?? "Sin color"}</span>
            </>
          )
        }
        consequence={
          deleting && todoCountByCategory[deleting.id]
            ? `${todoCountByCategory[deleting.id]} ${
                todoCountByCategory[deleting.id] === 1 ? "tarea" : "tareas"
              } quedarán sin categoría. Las tareas no se borran.`
            : "Ninguna tarea está usando esta categoría."
        }
        loading={removing}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

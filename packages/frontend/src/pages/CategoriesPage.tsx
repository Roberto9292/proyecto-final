import { useMemo, useState } from "react";
import { useCategories } from "../hooks/useCategories";
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
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { Table, Row, Cell, TableFooter } from "../components/ui/Table";

export default function CategoriesPage() {
  const { categories, loading, reload, create, update, remove } =
    useCategories();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [removing, setRemoving] = useState(false);

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
              headers={["Categoría", "Color", "_Acciones"]}
            >
              {visible.map((category) => (
                <Row key={category.id}>
                  <Cell>
                    <Badge color={category.color}>{category.name}</Badge>
                  </Cell>
                  <Cell>
                    <span className="font-mono text-xs text-gray-500">
                      {category.color ?? "—"}
                    </span>
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
        message={`¿Seguro que querés eliminar "${deleting?.name}"?`}
        note="Las tareas que la usen no se borran: simplemente quedan sin categoría."
        loading={removing}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

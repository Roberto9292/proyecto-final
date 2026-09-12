import { useMemo, useState } from "react";
import { useTodos } from "../hooks/useTodos";
import { useCategories } from "../hooks/useCategories";
import { showToast } from "../components/Toast";
import TodoFormDialog from "../features/todos/TodoFormDialog";
import type { Todo, TodoInput } from "../hooks/useTodos";
import PageHeader from "../components/ui/PageHeader";
import Toolbar from "../components/ui/Toolbar";
import SearchInput from "../components/ui/SearchInput";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import IconButton from "../components/ui/IconButton";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import StatusPill from "../components/ui/StatusPill";
import InlineEdit from "../components/ui/InlineEdit";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import StatCard from "../components/ui/StatCard";
import { Table, Row, Cell, TableFooter } from "../components/ui/Table";

type StatusFilter = "all" | "pending" | "done";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const isOverdue = (todo: Todo) =>
  Boolean(todo.dueDate) && !todo.completed && new Date(todo.dueDate!) < new Date();

export default function TodosPage() {
  const { todos, loading, reload, create, update, remove } = useTodos();
  const { categories } = useCategories();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<Todo | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Todo | null>(null);
  const [removing, setRemoving] = useState(false);

  const categoryOf = (id: string | null) =>
    categories.find((category) => category.id === id);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return todos.filter((todo) => {
      if (categoryFilter && todo.categoryId !== categoryFilter) return false;
      if (statusFilter === "pending" && todo.completed) return false;
      if (statusFilter === "done" && !todo.completed) return false;
      if (term && !todo.title.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [todos, search, categoryFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: todos.length,
      done: todos.filter((t) => t.completed).length,
      pending: todos.filter((t) => !t.completed).length,
      overdue: todos.filter(isOverdue).length,
    }),
    [todos],
  );

  const hasFilters = Boolean(search || categoryFilter || statusFilter !== "all");

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("all");
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (todo: Todo) => {
    setEditing(todo);
    setFormOpen(true);
  };

  const handleSubmit = async (input: TodoInput) => {
    if (editing) {
      await update(editing.id, input);
      showToast("Tarea actualizada", "success");
    } else {
      await create(input);
      showToast("Tarea creada", "success");
    }
  };

  const handleRename = async (todo: Todo, title: string) => {
    try {
      await update(todo.id, { title });
      showToast("Tarea actualizada", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al renombrar",
        "error",
      );
      throw err;
    }
  };

  const handleToggle = async (todo: Todo) => {
    const completed = !todo.completed;
    try {
      await update(todo.id, { completed });
      showToast(
        completed ? "Tarea completada" : "Tarea marcada como pendiente",
        "success",
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al actualizar",
        "error",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await remove(deleting.id);
      showToast("Tarea eliminada", "success");
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
        title="Tareas"
        subtitle="Gestioná tus tareas y asignales una categoría."
        actions={
          <Button icon="plus" onClick={openCreate}>
            Nueva tarea
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tareas totales" value={stats.total} icon="tasks" />
        <StatCard
          label="Completadas"
          value={stats.done}
          icon="check"
          tone="green"
        />
        <StatCard
          label="Pendientes"
          value={stats.pending}
          icon="clipboard"
          tone="purple"
        />
        <StatCard
          label="Vencidas"
          value={stats.overdue}
          icon="warning"
          tone="amber"
        />
      </div>

      <Toolbar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por título..."
        />

        <Select
          aria-label="Filtrar por categoría"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-auto min-w-[170px]"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filtrar por estado"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="w-auto min-w-[140px]"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="done">Completadas</option>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" icon="close" onClick={clearFilters}>
            Limpiar
          </Button>
        )}

        <IconButton
          icon="refresh"
          label="Actualizar"
          onClick={reload}
          disabled={loading}
          className="ml-auto"
        />
      </Toolbar>

      <Card>
        {loading ? (
          <Spinner label="Cargando tareas..." />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="tasks"
            title={hasFilters ? "Sin resultados" : "Todavía no tenés tareas"}
            message={
              hasFilters
                ? "Probá ajustando los filtros de búsqueda."
                : "Creá tu primera tarea para empezar a organizarte."
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              ) : (
                <Button icon="plus" onClick={openCreate}>
                  Crear tarea
                </Button>
              )
            }
          />
        ) : (
          <>
            <Table
              caption="Listado de tareas"
              headers={["Tarea", "Estado", "Categoría", "Vence", "_Acciones"]}
            >
              {visible.map((todo) => {
                const category = categoryOf(todo.categoryId);
                const overdue = isOverdue(todo);

                return (
                  <Row key={todo.id}>
                    <Cell>
                      <div className="min-w-0">
                        <InlineEdit
                          value={todo.title}
                          label={`el título de ${todo.title}`}
                          className={`font-medium ${
                            todo.completed
                              ? "text-gray-400 line-through"
                              : "text-gray-900"
                          }`}
                          onSave={(title) => handleRename(todo, title)}
                        />
                        {todo.description && (
                          <p className="mt-0.5 max-w-md truncate text-xs text-gray-500">
                            {todo.description}
                          </p>
                        )}
                      </div>
                    </Cell>

                    <Cell>
                      <StatusPill
                        tone={todo.completed ? "success" : "neutral"}
                        icon={todo.completed ? "checkCircle" : "circle"}
                        label={todo.completed ? "Completada" : "Pendiente"}
                        pressed={todo.completed}
                        actionLabel={
                          todo.completed
                            ? `Marcar "${todo.title}" como pendiente`
                            : `Marcar "${todo.title}" como completada`
                        }
                        onToggle={() => handleToggle(todo)}
                      />
                    </Cell>

                    <Cell>
                      {category ? (
                        <Badge color={category.color}>{category.name}</Badge>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Sin categoría
                        </span>
                      )}
                    </Cell>

                    <Cell>
                      {todo.dueDate ? (
                        <Badge tone={overdue ? "danger" : "neutral"}>
                          {formatDate(todo.dueDate)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </Cell>

                    <Cell align="right">
                      <div className="flex justify-end gap-1">
                        <IconButton
                          icon="edit"
                          label={`Editar ${todo.title}`}
                          onClick={() => openEdit(todo)}
                        />
                        <IconButton
                          icon="trash"
                          tone="danger"
                          label={`Eliminar ${todo.title}`}
                          onClick={() => setDeleting(todo)}
                        />
                      </div>
                    </Cell>
                  </Row>
                );
              })}
            </Table>

            <TableFooter>
              <span className="text-sm text-gray-500">
                Mostrando <strong>{visible.length}</strong> de{" "}
                <strong>{todos.length}</strong>{" "}
                {todos.length === 1 ? "tarea" : "tareas"}
              </span>
            </TableFooter>
          </>
        )}
      </Card>

      <TodoFormDialog
        open={formOpen}
        todo={editing}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar tarea"
        message={`¿Seguro que querés eliminar "${deleting?.title}"?`}
        note="Esta acción no se puede deshacer."
        loading={removing}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

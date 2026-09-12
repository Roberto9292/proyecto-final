import { useMemo, useState } from "react";
import { useUsers } from "../hooks/useUsers";
import type { User } from "../hooks/useUsers";
import { useAuth } from "../hooks/useAuth";
import { showToast } from "../components/Toast";
import UserFormDialog from "../features/users/UserFormDialog";
import type { UserInput } from "../hooks/useUsers";
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

export default function UsersPage() {
  const { users, loading, reload, create, update, remove } = useUsers();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [removing, setRemoving] = useState(false);

  const isAdmin = currentUser?.role === "ADMIN";

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(term) ||
        (u.name ?? "").toLowerCase().includes(term),
    );
  }, [users, search]);

  const handleCreate = async (input: UserInput) => {
    await create(input);
    showToast("Usuario creado", "success");
  };

  const handleToggleStatus = async (user: User) => {
    const status = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    try {
      await update(user.id, { status });
      showToast(
        status === "ACTIVE" ? "Usuario desbloqueado" : "Usuario bloqueado",
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
      showToast("Usuario eliminado", "success");
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
        title="Usuarios"
        subtitle="Administrá las cuentas que acceden al sistema."
        actions={
          <Button icon="plus" onClick={() => setFormOpen(true)}>
            Nuevo usuario
          </Button>
        }
      />

      <Toolbar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por email o nombre..."
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
          <Spinner label="Cargando usuarios..." />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="users"
            title="Sin resultados"
            message={`Ningún usuario coincide con "${search}".`}
          />
        ) : (
          <>
            <Table
              caption="Listado de usuarios"
              headers={["Usuario", "Rol", "Estado", "_Acciones"]}
            >
              {visible.map((user) => {
                const isSelf = user.id === currentUser?.id;

                return (
                  <Row key={user.id}>
                    <Cell>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                          {user.email.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">
                            {user.name ?? "Sin nombre"}
                            {isSelf && (
                              <span className="ml-2 text-xs font-normal text-gray-400">
                                (vos)
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </Cell>

                    <Cell>
                      <Badge tone={user.role === "ADMIN" ? "purple" : "neutral"}>
                        {user.role}
                      </Badge>
                    </Cell>

                    <Cell>
                      <Badge
                        tone={user.status === "ACTIVE" ? "success" : "danger"}
                      >
                        {user.status === "ACTIVE" ? "Activo" : "Bloqueado"}
                      </Badge>
                    </Cell>

                    <Cell align="right">
                      <div className="flex justify-end gap-1">
                        <IconButton
                          icon={user.status === "ACTIVE" ? "lock" : "check"}
                          label={
                            user.status === "ACTIVE"
                              ? `Bloquear a ${user.email}`
                              : `Desbloquear a ${user.email}`
                          }
                          disabled={!isAdmin || isSelf}
                          onClick={() => handleToggleStatus(user)}
                        />
                        <IconButton
                          icon="trash"
                          tone="danger"
                          label={`Eliminar a ${user.email}`}
                          disabled={!isAdmin || isSelf}
                          onClick={() => setDeleting(user)}
                        />
                      </div>
                    </Cell>
                  </Row>
                );
              })}
            </Table>

            <TableFooter>
              <span className="text-sm text-gray-500">
                {visible.length} de {users.length}{" "}
                {users.length === 1 ? "usuario" : "usuarios"}
              </span>
              {!isAdmin && (
                <span className="text-xs text-gray-400">
                  Solo un administrador puede bloquear o eliminar usuarios.
                </span>
              )}
            </TableFooter>
          </>
        )}
      </Card>

      <UserFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar usuario"
        message={`¿Seguro que querés eliminar a "${deleting?.email}"?`}
        note="Se eliminarán también todas sus tareas y categorías. Esta acción no se puede deshacer."
        loading={removing}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

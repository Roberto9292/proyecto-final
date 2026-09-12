import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import Input from "../../components/ui/Input";
import type { UserInput } from "../../hooks/useUsers";

const MIN_PASSWORD = 6;

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: UserInput) => Promise<void>;
}

export default function UserFormDialog({
  open,
  onClose,
  onSubmit,
}: UserFormDialogProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setName("");
    setPassword("");
    setError(undefined);
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < MIN_PASSWORD) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres`);
      return;
    }

    setSaving(true);
    try {
      await onSubmit({ email: email.trim(), name: name.trim(), password });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Nuevo usuario"
      description="El usuario se crea con rol CLIENT y estado ACTIVE."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="user-form"
            loading={saving}
            icon="check"
            disabled={!email.trim() || !name.trim() || !password}
          >
            Crear usuario
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Email" required>
          {({ id }) => (
            <Input
              id={id}
              type="email"
              required
              autoFocus
              autoComplete="off"
              placeholder="juan@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Field>

        <Field label="Nombre" required>
          {({ id }) => (
            <Input
              id={id}
              required
              autoComplete="off"
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
        </Field>

        <Field
          label="Contraseña"
          required
          error={error}
          hint={`Mínimo ${MIN_PASSWORD} caracteres.`}
        >
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={Boolean(error)}
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(undefined);
              }}
            />
          )}
        </Field>
      </form>
    </Modal>
  );
}

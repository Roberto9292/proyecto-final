import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { showToast } from "../components/Toast";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import Input from "../components/ui/Input";
import Icon from "../components/ui/Icon";
import Footer from "../components/Footer";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await login(email, password);
      showToast("Sesión iniciada correctamente", "success");
      navigate("/todos");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo iniciar sesión",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="hidden flex-1 flex-col justify-between bg-slate-900 p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Icon name="clipboard" className="h-5 w-5" />
          </span>
          <span className="font-semibold tracking-tight text-white">
            Todo App
          </span>
        </div>

        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
            Organizá tus tareas por categoría.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Creá categorías con color, asignalas a tus tareas y filtrá al
            instante para ver solo lo que te importa.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "Categorías con color personalizado",
              "Filtros por categoría y estado",
              "Control de acceso por roles",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-sm text-slate-300"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
                  <Icon name="check" className="h-3 w-3" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Footer tone="dark" />
      </aside>

      <main className="flex flex-1 items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Icon name="clipboard" className="h-5 w-5" />
            </span>
            <span className="font-semibold tracking-tight text-gray-900">
              Todo App
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Iniciar sesión
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ingresá tus credenciales para continuar.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <Field label="Email" required>
              {({ id }) => (
                <Input
                  id={id}
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="admin@todo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              )}
            </Field>

            <Field label="Contraseña" required error={error}>
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  invalid={Boolean(error)}
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(undefined);
                  }}
                />
              )}
            </Field>

            <Button type="submit" loading={loading} className="w-full">
              Entrar
            </Button>
          </form>

          <div className="mt-10 lg:hidden">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";

interface InlineEditProps {
  value: string;
  /** Puede rechazar: el backend valida nombres duplicados. */
  onSave: (value: string) => Promise<void>;
  /** Describe qué se edita, para el lector de pantalla. */
  label: string;
  className?: string;
}

/**
 * Edición en el lugar: el texto se convierte en un campo sin cambiar de
 * contexto. Enter confirma, Escape descarta y salir del campo confirma, que es
 * lo que se espera de una lista editable.
 *
 * La debilidad conocida de este patrón es que nada indica que el texto sea
 * clickeable, así que el disparador es un botón real y se subraya al pasar por
 * encima.
 */
export default function InlineEdit({
  value,
  onSave,
  label,
  className = "",
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const start = () => {
    setDraft(value);
    setEditing(true);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const commit = async () => {
    const trimmed = draft.trim();

    if (!trimmed || trimmed === value) {
      cancel();
      return;
    }

    setSaving(true);
    try {
      await onSave(trimmed);
      setEditing(false);
    } catch {
      // El campo queda abierto con lo escrito para poder corregirlo; el aviso
      // del error lo muestra la pantalla.
      inputRef.current?.focus();
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={start}
        aria-label={`Editar ${label}`}
        className={`rounded text-left decoration-dotted underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${className}`}
      >
        {value}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      disabled={saving}
      aria-label={label}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          void commit();
        }
        if (e.key === "Escape") cancel();
      }}
      className="w-full max-w-xs rounded-md border border-blue-400 bg-white px-2 py-1 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
    />
  );
}

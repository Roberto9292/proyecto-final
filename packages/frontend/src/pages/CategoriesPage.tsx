import { useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { showToast } from "../components/Toast";

const DEFAULT_COLOR = "#3B82F6";

export default function CategoriesPage() {
  const { categories, loading, create, update, remove } = useCategories();
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState(DEFAULT_COLOR);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await create({ name: name.trim(), color });
      setName("");
      setColor(DEFAULT_COLOR);
      showToast("Categoría creada", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al crear", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (id: string, currentName: string, currentColor: string | null) => {
    setEditingId(id);
    setEditName(currentName);
    setEditColor(currentColor ?? DEFAULT_COLOR);
  };

  const handleSave = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      await update(editingId, { name: editName.trim(), color: editColor });
      setEditingId(null);
      showToast("Categoría actualizada", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al guardar", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      showToast("Categoría eliminada", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al eliminar", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500">
            {categories.length} categorías
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="mb-6 flex gap-3 items-end">
        <div className="flex-1 flex flex-col gap-1">
          <input
            type="text"
            placeholder="Nueva categoría..."
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          title="Color de la categoría"
          className="h-9 w-12 border border-gray-300 rounded-md cursor-pointer"
        />
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Agregar
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">
          No hay categorías aún
        </p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
            >
              {editingId === category.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="h-7 w-10 border border-blue-200 rounded cursor-pointer"
                  />
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSave}
                    className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2 py-0.5 text-gray-400 text-xs hover:text-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => startEdit(category.id, category.name, category.color)}
                  className="flex-1 flex items-center gap-2 cursor-pointer"
                >
                  <span
                    className="h-3 w-3 rounded-full border border-gray-200 shrink-0"
                    style={{ backgroundColor: category.color ?? "transparent" }}
                  />
                  <span className="text-sm text-gray-900">{category.name}</span>
                </div>
              )}

              <button
                onClick={() => handleDelete(category.id)}
                className="text-gray-300 hover:text-red-500 transition-colors text-sm shrink-0"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

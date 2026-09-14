import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./useAuth";

export interface Category {
  id: string;
  name: string;
  color: string | null;
}

export interface CategoryInput {
  name: string;
  color?: string;
}

export function useCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api<Category[]>("/api/categories", { token });
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (input: CategoryInput) => {
      await api("/api/categories", { method: "POST", body: input, token });
      await load();
    },
    [token, load],
  );

  const update = useCallback(
    async (id: string, input: CategoryInput) => {
      await api(`/api/categories/${id}`, {
        method: "PATCH",
        body: input,
        token,
      });
      await load();
    },
    [token, load],
  );

  const remove = useCallback(
    async (id: string) => {
      await api(`/api/categories/${id}`, { method: "DELETE", token });
      await load();
    },
    [token, load],
  );

  return { categories, loading, reload: load, create, update, remove };
}

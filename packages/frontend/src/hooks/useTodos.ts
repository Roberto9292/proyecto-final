import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./useAuth";

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: string | null;
  categoryId: string | null;
}

export interface TodoInput {
  title: string;
  description?: string;
  dueDate?: string | null;
  categoryId?: string | null;
}

export function useTodos() {
  const { token } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api<Todo[]>("/api/todo", { token });
      setTodos(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (input: TodoInput) => {
      await api("/api/todo", { method: "POST", body: input, token });
      await load();
    },
    [token, load],
  );

  const update = useCallback(
    async (id: string, input: Partial<TodoInput> & { completed?: boolean }) => {
      await api(`/api/todo/${id}`, { method: "PATCH", body: input, token });
      await load();
    },
    [token, load],
  );

  const remove = useCallback(
    async (id: string) => {
      await api(`/api/todo/${id}`, { method: "DELETE", token });
      await load();
    },
    [token, load],
  );

  return { todos, loading, reload: load, create, update, remove };
}

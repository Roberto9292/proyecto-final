import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./useAuth";

export interface UserInput {
  email: string;
  name: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "CLIENT";
  status: "ACTIVE" | "BLOCKED";
}

export function useUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api<User[]>("/api/users", { token });
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (input: UserInput) => {
      await api("/api/users", { method: "POST", body: input, token });
      await load();
    },
    [token, load],
  );

  const update = useCallback(
    async (id: string, input: Partial<User>) => {
      await api(`/api/users/${id}`, { method: "PATCH", body: input, token });
      await load();
    },
    [token, load],
  );

  const remove = useCallback(
    async (id: string) => {
      await api(`/api/users/${id}`, { method: "DELETE", token });
      await load();
    },
    [token, load],
  );

  return { users, loading, reload: load, create, update, remove };
}

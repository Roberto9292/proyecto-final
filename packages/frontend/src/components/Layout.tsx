import { useState } from "react";
import { Link, useLocation } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import NotificationBell from "./NotificationBell";
import Footer from "./Footer";
import Icon from "./ui/Icon";
import IconButton from "./ui/IconButton";
import ConfirmDialog from "./ui/ConfirmDialog";
import type { IconName } from "./ui/Icon";

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

const NAV: NavItem[] = [
  { to: "/todos", label: "Tareas", icon: "tasks" },
  { to: "/categories", label: "Categorías", icon: "categories" },
  { to: "/users", label: "Usuarios", icon: "users" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const { notifications, unread, connected, markAsRead, markAllAsRead } =
    useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();
  const current = NAV.find((item) => item.to === pathname);

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-900 transition-transform lg:static lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Icon name="clipboard" className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-white">
            Todo App
          </span>
        </div>

        <nav aria-label="Navegación principal" className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                {user?.email}
              </p>
              <p className="text-[11px] text-slate-400">{user?.role}</p>
            </div>
            <button
              onClick={() => setConfirmingLogout(true)}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Icon name="logout" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <span className="lg:hidden">
              <IconButton
                icon={menuOpen ? "close" : "filter"}
                label="Abrir menú"
                onClick={() => setMenuOpen((open) => !open)}
              />
            </span>
            <span className="text-sm font-medium text-gray-500">
              {current?.label ?? "Todo App"}
            </span>
          </div>

          <NotificationBell
            notifications={notifications}
            unread={unread}
            connected={connected}
            onMarkRead={markAsRead}
            onMarkAllRead={markAllAsRead}
          />
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-gray-200 px-4 py-5 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Footer />
          </div>
        </footer>
      </div>

      <ConfirmDialog
        open={confirmingLogout}
        tone="neutral"
        icon="logout"
        title="Cerrar sesión"
        question="¿Estás seguro que deseas cerrar sesión?"
        target={user?.email ?? ""}
        targetMeta={<span>{user?.role}</span>}
        confirmLabel="Cerrar sesión"
        onConfirm={logout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>
  );
}

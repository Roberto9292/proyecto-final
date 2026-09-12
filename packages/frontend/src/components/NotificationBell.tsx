import { useState, useRef, useEffect } from "react";
import type { Notification } from "../hooks/useNotifications";
import Icon from "./ui/Icon";
import type { IconName } from "./ui/Icon";

const typeIcons: Record<string, IconName> = {
  TASK_CREATED: "tasks",
  TASK_COMPLETED: "check",
  TASK_DUE_SOON: "calendar",
  USER_CREATED: "users",
};

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

interface Props {
  notifications: Notification[];
  unread: number;
  connected: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function NotificationBell({
  notifications,
  unread,
  connected,
  onMarkRead,
  onMarkAllRead,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={`Notificaciones${unread > 0 ? ` (${unread} sin leer)` : ""}`}
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <Icon name="bell" className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
        {!connected && (
          <span
            title="Sin conexión con el servicio de notificaciones"
            className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white"
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold text-gray-900">
              Notificaciones
              {unread > 0 && (
                <span className="ml-1.5 text-xs font-normal text-gray-400">
                  {unread} sin leer
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-800"
              >
                Marcar todo leído
              </button>
            )}
          </header>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">
                {connected
                  ? "No tenés notificaciones"
                  : "Servicio de notificaciones no disponible"}
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && onMarkRead(n.id)}
                  className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors ${
                    n.read ? "hover:bg-gray-50" : "bg-blue-50/60 hover:bg-blue-50"
                  }`}
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                    <Icon
                      name={typeIcons[n.type] ?? "bell"}
                      className="h-3.5 w-3.5"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          n.read ? "text-gray-700" : "text-gray-900"
                        }`}
                      >
                        {n.title}
                      </span>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500">
                      {n.message}
                    </span>
                    <span className="mt-1 block text-[11px] text-gray-400">
                      {timeAgo(n.createdAt)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

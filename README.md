# Todo App — Monorepo

Proyecto de tareas construido como monorepo con **pnpm workspaces**.

## Entrega — Proyecto Final

| | |
|---|---|
| Repositorio | https://github.com/Roberto9292/todo-backend |
| Pull Request | https://github.com/Roberto9292/todo-backend/pull/1 |
| Rama | `feature/final-project-categories` |
| Autor | Roberto Ugarte |

### Aplicación desplegada

| | |
|---|---|
| Aplicación | http://54.90.184.57 |
| Swagger | http://54.90.184.57/docs |
| API | `http://54.90.184.57/api` |
| Email | `admin@gmail.com` |
| Contraseña | `admin123` |

Todo entra por el puerto 80: nginx sirve el frontend en `/`, la API en `/api/` y
Swagger en `/docs`. Los puertos de los servicios no están expuestos a internet.

`/api` es el prefijo de los endpoints (`/api/auth/login`, `/api/categories`,
`/api/todo`, `/api/users`), no una página: abrirlo en el navegador devuelve 404.
Para probar la API conviene usar Swagger, que ya trae el botón *Authorize* para
pegar el token.

La base tiene datos de prueba cargados con `packages/backend/prisma/seed-demo.js`:
5 usuarios, 10 categorías y 20 tareas.

El trabajo del proyecto final está en la rama `feature/final-project-categories`.
`main` conserva la base del repositorio original, de modo que el Pull Request
muestra únicamente los cambios agregados.

## Estructura

```
todo-backend/
├── packages/
│   ├── backend/        # NestJS + Prisma + PostgreSQL (DDD)
│   ├── notification/   # NestJS + Mongoose + Socket.io (notificaciones)
│   └── frontend/       # React 19 + Tailwind CSS v4 + Vite
├── package.json        # Root workspace config
└── pnpm-workspace.yaml
```

## Requisitos previos

- Node.js >= 18
- pnpm
- PostgreSQL corriendo localmente
- MongoDB corriendo localmente (servicio de notificaciones)

## Instalación

```bash
# Instalar dependencias de todos los packages
pnpm install
```

Los builds nativos (`argon2`, `esbuild`, `@prisma/engines`, etc.) ya están
aprobados en `allowBuilds` de `pnpm-workspace.yaml`, así que no hace falta
ejecutar `pnpm approve-builds`.

## Variables de entorno

Para correr los servicios sueltos, cada package tiene su propio `.env`:

```bash
cp packages/backend/.env.sample packages/backend/.env
cp packages/notification/.env.sample packages/notification/.env
cp packages/frontend/.env.sample packages/frontend/.env
```

Para levantar todo con Docker Compose, en cambio, las variables van en un único
archivo en la raíz:

```bash
cp .env.sample .env
```

`JWT_SECRET` no tiene valor por defecto: hay que generarlo con
`openssl rand -hex 32`. Los detalles de cada variable están en
[`docs/DEPLOY.md`](docs/DEPLOY.md).

## Ejecutar

```bash
# Backend (puerto 3050)
pnpm --filter todo-backend start:dev

# Notificaciones (puerto 3060)
pnpm --filter notification-service start:dev

# Frontend (puerto 3040)
pnpm --filter todo-frontend dev
```

También se puede levantar todo el entorno con Docker Compose (ver `docs/DEPLOY.md`):

```bash
docker compose up --build
```

## Base de datos inicial

Las migraciones crean las tablas y el seed carga un usuario administrador:

```bash
pnpm --filter todo-backend exec prisma migrate deploy
pnpm --filter todo-backend seed
```

| | |
|---|---|
| Email | `admin@gmail.com` |
| Contraseña | `admin123` |
| Rol | `ADMIN` |

Es la única cuenta con permiso para cambiar roles, bloquear usuarios y
eliminarlos. Los usuarios que se crean desde `POST /users` o desde la pantalla
de Usuarios nacen con rol `CLIENT`, que es el valor por defecto del modelo.

La contraseña se guarda con Argon2id, nunca en texto plano. El seed no
sobrescribe nada: si el usuario ya existe, avisa y termina.

> Son credenciales de desarrollo. Antes de exponer la aplicación hay que
> cambiar la contraseña desde `PATCH /users/:id`.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm --filter todo-backend start:dev` | Iniciar backend en desarrollo |
| `pnpm --filter todo-backend build` | Build del backend |
| `pnpm --filter todo-backend test` | Tests del backend |
| `pnpm --filter todo-backend lint` | Lint del backend |
| `pnpm --filter notification-service start:dev` | Iniciar notificaciones en desarrollo |
| `pnpm --filter notification-service test` | Tests del servicio de notificaciones |
| `pnpm --filter todo-frontend dev` | Iniciar frontend en desarrollo |
| `pnpm --filter todo-frontend build` | Build del frontend |

## Packages

### Backend (`packages/backend`)

- **Stack:** NestJS 12 + Prisma 7 + PostgreSQL
- **Arquitectura:** DDD (Domain-Driven Design) con Hexagonal Architecture
- **Auth:** JWT + Argon2id + Passport, con guard de roles para endpoints de admin
- **Docs:** Swagger en `http://localhost:3050/docs`
- **Tests:** Jest (131 tests, 16 suites)

### Notification (`packages/notification`)

- **Stack:** NestJS 12 + Mongoose + MongoDB
- **Tiempo real:** Socket.io, sala por usuario (`user:<id>`)
- **Docs:** Swagger en `http://localhost:3060/docs`
- **Puerto:** 3060

### Frontend (`packages/frontend`)

- **Stack:** React 19 + Tailwind CSS v4 + Vite
- **Routing:** React Router v7
- **Pantallas:** Login, CRUD Usuarios, CRUD Tareas, CRUD Categorías
- **Puerto:** 3040

## Arquitectura del Monorepo

```
AppModule (NestJS)
├── PrismaModule (@Global)
├── ContextsModule
│   ├── TasksModule
│   │   ├── TodoModule
│   │   └── CategoryModule
│   └── IdentityAccessModule
│       ├── UserModule
│       └── AuthModule
└── AppsModule
    └── ApiModule
        ├── AuthController (POST /auth/login)
        ├── UserController (GET/POST /users, GET/PATCH/DELETE /users/:id)
        ├── TodoController (GET/POST/PATCH/DELETE /todo)
        └── CategoryController (GET/POST/PATCH/DELETE /categories)

El puerto de notificaciones (`NotificationPort`) vive en `src/shared/domain` y su
adaptador HTTP en `src/shared/infrastructure/notification`, para que ningún bounded
context dependa de otro.
```

## Recursos

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Domain-Driven Design — Eric Evans](https://www.domainlanguage.com/ddd/)

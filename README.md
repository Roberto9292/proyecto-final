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
| Aplicación | http://54.81.193.240 |
| Swagger | http://54.81.193.240/docs |
| API | `http://54.81.193.240/api` |

#### Usuarios de prueba

Cada uno entra con su nombre seguido de `123`:

| Email | Contraseña | Rol | Estado |
|---|---|---|---|
| `admin@gmail.com` | `admin123` | ADMIN | ACTIVE |
| `lucia.mendez@gmail.com` | `lucia123` | CLIENT | ACTIVE |
| `carlos.rojas@gmail.com` | `carlos123` | CLIENT | ACTIVE |
| `sofia.aguirre@gmail.com` | `sofia123` | CLIENT | ACTIVE |
| `diego.paredes@gmail.com` | `diego123` | CLIENT | BLOCKED |

Los datos salen de `packages/backend/prisma/seed-demo.js`: 10 categorías y 20
tareas repartidas entre esos usuarios. `diego` está bloqueado a propósito, así
que su login responde `401` aunque la contraseña sea correcta.

nginx sirve todo por el puerto 80 —el frontend en `/`, Swagger en `/docs` y la
API en `/api/`— y los puertos de los servicios no se exponen a internet. `/api`
es el prefijo de los endpoints, no una página, así que para probarlos conviene
Swagger, que trae el botón *Authorize*.

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

- Node.js >= 22 (lo exige pnpm 11)
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

### Datos de prueba

Una segunda semilla deja la aplicación poblada con 5 usuarios, 10 categorías y
20 tareas —10 completadas y 10 pendientes—, con las credenciales de
[Usuarios de prueba](#usuarios-de-prueba):

```bash
pnpm --filter todo-backend build   # compila el cliente de Prisma que usa
pnpm --filter todo-backend exec node prisma/seed-demo.js
```

Se puede repetir: reescribe las contraseñas y reemplaza las tareas de esos cinco
usuarios, así que siempre deja el mismo conjunto.

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

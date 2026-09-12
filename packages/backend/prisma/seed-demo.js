// Datos de demostración: 5 usuarios, 10 categorías y 20 tareas. Idempotente.
//
// CommonJS y no TypeScript para poder correr en la imagen de producción, que
// se instala con --prod y por lo tanto no tiene tsx.
//
//   docker compose exec -w /app/packages/backend backend node prisma/seed-demo.js

const path = require('path');
const argon2 = require('argon2');
const { PrismaPg } = require('@prisma/adapter-pg');

// Prisma genera archivos .ts; el cargable es el que `nest build` deja en dist/.
function loadPrismaClient() {
  const candidates = [
    path.resolve(__dirname, '../dist/generated/prisma/client'),
    path.resolve(process.cwd(), 'dist/generated/prisma/client'),
  ];
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') throw error;
    }
  }
  throw new Error(
    'No se encontró el cliente de Prisma compilado. Ejecutá `nest build` antes de correr esta semilla.',
  );
}

const { PrismaClient } = loadPrismaClient();
const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

// Cada usuario tiene su propia contraseña, `<key>123`, para poder entrar con
// cualquiera de ellos y ver la aplicación desde distintos roles.
const passwordFor = (key) => `${key}123`;

// Desplazamiento en días desde la corrida, para que siempre haya vencimientos
// pasados y futuros en vez de quedar todo vencido con el tiempo.
const day = 24 * 60 * 60 * 1000;
const inDays = (n) => new Date(Date.now() + n * day);

const USERS = [
  { key: 'admin',  email: 'admin@gmail.com',           name: 'Admin',          role: 'ADMIN',  status: 'ACTIVE'  },
  { key: 'lucia',  email: 'lucia.mendez@gmail.com',    name: 'Lucía Méndez',   role: 'CLIENT', status: 'ACTIVE'  },
  { key: 'carlos', email: 'carlos.rojas@gmail.com',    name: 'Carlos Rojas',   role: 'CLIENT', status: 'ACTIVE'  },
  { key: 'sofia',  email: 'sofia.aguirre@gmail.com',   name: 'Sofía Aguirre',  role: 'CLIENT', status: 'ACTIVE'  },
  { key: 'diego',  email: 'diego.paredes@gmail.com',   name: 'Diego Paredes',  role: 'CLIENT', status: 'BLOCKED' },
];

// Category.name es @unique global: los diez nombres deben ser distintos.
const CATEGORIES = [
  { key: 'trabajo',   name: 'Trabajo',   color: '#2563EB', owner: 'admin'  },
  { key: 'personal',  name: 'Personal',  color: '#16A34A', owner: 'admin'  },
  { key: 'estudio',   name: 'Estudio',   color: '#7C3AED', owner: 'lucia'  },
  { key: 'salud',     name: 'Salud',     color: '#DC2626', owner: 'lucia'  },
  { key: 'finanzas',  name: 'Finanzas',  color: '#CA8A04', owner: 'carlos' },
  { key: 'hogar',     name: 'Hogar',     color: '#0891B2', owner: 'carlos' },
  { key: 'viajes',    name: 'Viajes',    color: '#DB2777', owner: 'sofia'  },
  { key: 'lectura',   name: 'Lectura',   color: '#4F46E5', owner: 'sofia'  },
  { key: 'deporte',   name: 'Deporte',   color: '#EA580C', owner: 'diego'  },
  { key: 'proyectos', name: 'Proyectos', color: '#059669', owner: 'diego'  },
];

// 10 completadas y 10 pendientes. Dos —una de cada estado— van sin description,
// dueDate ni categoría, para ejercitar los campos opcionales.
const TODOS = [
  { owner: 'admin',  category: 'trabajo',   completed: true,  dueIn: -6,  title: 'Preparar informe trimestral',            description: 'Consolidar métricas de los tres meses y dejarlo listo para la reunión de directorio.' },
  { owner: 'admin',  category: 'trabajo',   completed: false, dueIn: 4,   title: 'Revisar presupuesto del equipo',         description: 'Comparar lo ejecutado contra lo proyectado y marcar los desvíos.' },
  { owner: 'admin',  category: 'personal',  completed: true,  dueIn: -14, title: 'Renovar el pasaporte',                   description: 'Turno tomado y documentación presentada.' },
  { owner: 'admin',  category: null,        completed: false, dueIn: null, title: 'Ordenar el escritorio',                 description: null },

  { owner: 'lucia',  category: 'estudio',   completed: true,  dueIn: -3,  title: 'Entregar trabajo práctico de Algoritmos', description: 'Implementación de grafos con el informe de complejidad.' },
  { owner: 'lucia',  category: 'estudio',   completed: false, dueIn: 9,   title: 'Repasar para el parcial de Bases de Datos', description: 'Normalización, transacciones y planes de ejecución.' },
  { owner: 'lucia',  category: 'salud',     completed: true,  dueIn: -8,  title: 'Turno con el odontólogo',                description: 'Control semestral y limpieza.' },
  { owner: 'lucia',  category: 'salud',     completed: false, dueIn: 2,   title: 'Retomar la rutina de natación',          description: 'Tres veces por semana, turno de la mañana.' },

  { owner: 'carlos', category: 'finanzas',  completed: true,  dueIn: -20, title: 'Declarar impuestos del trimestre',       description: 'Presentado dentro del plazo, con comprobante archivado.' },
  { owner: 'carlos', category: 'finanzas',  completed: false, dueIn: 12,  title: 'Comparar planes de ahorro',              description: 'Revisar tasas y comisiones de tres bancos antes de decidir.' },
  { owner: 'carlos', category: 'hogar',     completed: true,  dueIn: -2,  title: 'Arreglar la canilla de la cocina',       description: 'Cambio de cuerito y ajuste del flexible.' },
  { owner: 'carlos', category: 'hogar',     completed: false, dueIn: 21,  title: 'Pintar el balcón',                       description: 'Lijar la baranda y dar dos manos de esmalte sintético.' },

  { owner: 'sofia',  category: 'viajes',    completed: true,  dueIn: -11, title: 'Reservar vuelos a Salta',                description: 'Ida el viernes a la noche, vuelta el domingo.' },
  { owner: 'sofia',  category: 'viajes',    completed: false, dueIn: 6,   title: 'Armar itinerario de la Quebrada',        description: 'Purmamarca, Tilcara y Humahuaca en tres días.' },
  { owner: 'sofia',  category: 'lectura',   completed: true,  dueIn: -1,  title: "Terminar 'Rayuela'",                     description: 'Leído siguiendo el orden propuesto por el autor.' },
  { owner: 'sofia',  category: 'lectura',   completed: false, dueIn: 15,  title: 'Elegir el próximo libro del club',       description: 'Proponer tres títulos y votar en la reunión.' },

  { owner: 'diego',  category: 'deporte',   completed: true,  dueIn: -5,  title: 'Inscribirse a la media maratón',         description: 'Inscripción pagada y remera retirada.' },
  { owner: 'diego',  category: 'deporte',   completed: false, dueIn: 3,   title: 'Plan de entrenamiento de 8 semanas',     description: 'Series, fondo largo y descanso activo repartidos por semana.' },
  { owner: 'diego',  category: null,        completed: true,  dueIn: null, title: 'Publicar el portfolio',                 description: null },
  { owner: 'diego',  category: 'proyectos', completed: false, dueIn: 30,  title: 'Migrar el blog a Astro',                 description: 'Portar el contenido y conservar las URLs actuales.' },
];

async function main() {
  const hash = (plain) =>
    argon2.hash(plain, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

  const userIds = {};
  for (const user of USERS) {
    // La contraseña se reescribe en cada corrida: la semilla define el estado
    // completo de la demo, contraseñas incluidas.
    const password = await hash(passwordFor(user.key));
    const row = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password,
        role: user.role,
        status: user.status,
      },
      create: {
        email: user.email,
        name: user.name,
        password,
        role: user.role,
        status: user.status,
      },
    });
    userIds[user.key] = row.id;
  }
  console.log(`Usuarios: ${USERS.length}`);

  const categoryIds = {};
  for (const category of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { name: category.name },
      update: { color: category.color, userId: userIds[category.owner] },
      create: {
        name: category.name,
        color: category.color,
        userId: userIds[category.owner],
      },
    });
    categoryIds[category.key] = row.id;
  }
  console.log(`Categorías: ${CATEGORIES.length}`);

  // Solo las de estos usuarios: repetir la semilla no duplica ni toca a otros.
  const removed = await prisma.todo.deleteMany({
    where: { userId: { in: Object.values(userIds) } },
  });
  if (removed.count > 0) {
    console.log(`Tareas previas eliminadas: ${removed.count}`);
  }

  for (const todo of TODOS) {
    await prisma.todo.create({
      data: {
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        dueDate: todo.dueIn === null ? null : inDays(todo.dueIn),
        userId: userIds[todo.owner],
        categoryId: todo.category === null ? null : categoryIds[todo.category],
      },
    });
  }

  const completed = TODOS.filter((t) => t.completed).length;
  const bare = TODOS.filter(
    (t) => t.description === null && t.dueIn === null && t.category === null,
  ).length;
  console.log(
    `Tareas: ${TODOS.length} (${completed} completadas, ${TODOS.length - completed} pendientes, ${bare} sin campos opcionales)`,
  );
  console.log('\nCredenciales:');
  for (const user of USERS) {
    console.log(`  ${user.email.padEnd(26)} ${passwordFor(user.key)}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

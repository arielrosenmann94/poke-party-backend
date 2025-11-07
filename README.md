# Poké Party — Backend

Backend para administrar Pokémon, Party (máx. 6) y Box.
Construido con Node.js, Express, Prisma y PostgreSQL.

## Requisitos

Node.js 24.x

npm 11.x

PostgreSQL instalado localmente o gestionado (Supabase, Neon u otro)

## Instalación

Clonar repositorio
git clone https://github.com/
https://github.com/arielrosenmann94/poke-party-frontend.git
cd poke-party-backend

##Instalar dependencias
npm install

##Variables de entorno

Crear archivo llamado .env en la raíz del proyecto con:

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
PORT=4000

(Modificar valores según tu servicio DB, el poyecto incluye un .env que puedes usar,se recomienda revisión)

## Configuración base de datos

Generar cliente Prisma
npx prisma generate

Ejecutar migraciones
npx prisma migrate dev

Opcional (explorar DB)
npx prisma studio

## Ejecutar servidor

Modo desarrollo
npm run dev

Modo producción
npm start

## El servidor quedará disponible en:
http://localhost:4000

## Endpoints principales

GET /ping
→ Prueba de disponibilidad

GET /pokemon
→ Listado inicial de Pokémon

POST /pokemon
→ Guardar Pokémon

GET /party
→ Recuperar Pokémon en Party

POST /party/:id
→ Mover Pokémon a Party
(Límite: 6 Pokémon)

DELETE /party/:id
→ Remover Pokémon de Party

GET /box
→ Recuperar Pokémon en Box

POST /box/:id
→ Mover Pokémon a Box

DELETE /box/:id
→ Remover Pokémon de Box

## Reglas

Party solo admite 6 Pokémon.

El resto se almacena en Box.

Se permite optimizar equipo según estadísticas combinadas.

Estructura del proyecto

poke-party-backend
├── prisma/
│ └── schema.prisma
├── src/
│ ├── index.ts
│ ├── routes/
│ └── services/
├── .env
├── package.json
└── README.md

## Alternativa con Docker (opcional)

Si utilizas Docker:
docker compose up -d

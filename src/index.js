import express from "express";
import cors from "cors";
import { prisma } from "./db.js";
import { getRandomPokemonByType } from "./poke.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.get("/pokemon", async (req, res) => {
  const { type } = req.query;
  if (!type) return res.status(400).json({ error: "Falta ?type=" });
  try {
    const pokemon = await getRandomPokemonByType(type);
    res.json(pokemon);
  } catch {
    res.status(500).json({ error: "Error obteniendo Pokémon" });
  }
});

const STAT_KEYS = ["hp","attack","defense","special-attack","special-defense","speed"];

function statValue(pokemon, key) {
  if (key === "total") {
    return pokemon.stats?.reduce((acc, s) => acc + Number(s.base || 0), 0) ?? 0;
  }
  const s = pokemon.stats?.find((x) => x.name === key);
  return s ? Number(s.base || 0) : 0;
}

app.get("/party", async (req, res) => {
  const sort = (req.query.sort || "").toLowerCase();
  const order = (req.query.order || "desc").toLowerCase();

  if (!["total", ...STAT_KEYS].includes(sort)) {
    const rows = await prisma.pokemon.findMany({ where: { box: false }, orderBy: { id: "asc" } });
    return res.json(rows);
  }

  const rows = await prisma.pokemon.findMany({ where: { box: false } });
  rows.sort((a, b) => {
    const va = statValue(a, sort);
    const vb = statValue(b, sort);
    return order === "asc" ? va - vb : vb - va;
  });
  res.json(rows);
});

app.post("/party", async (req, res) => {
  const p = req.body;
  try {
    const countBefore = await prisma.pokemon.count({ where: { box: false } });
    const placeInParty = countBefore < 6;

    const saved = await prisma.pokemon.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        sprite: p.sprite ?? null,
        types: p.types,
        stats: p.stats,
        box: placeInParty ? false : true,
      },
      create: {
        id: p.id,
        name: p.name,
        sprite: p.sprite ?? null,
        types: p.types,
        stats: p.stats,
        box: placeInParty ? false : true,
      },
    });

    const party = await prisma.pokemon.findMany({ where: { box: false } });
    const box = await prisma.pokemon.findMany({ where: { box: true } });

    res.json({
      success: true,
      placed: placeInParty ? "party" : "box",
      pokemon: saved,
      party,
      box,
    });
  } catch (err) {
    res.status(500).json({ error: "No se pudo procesar el Pokémon" });
  }
});

app.delete("/party/:id", async (req, res) => {
  const id = Number(req.params.id);
  const exists = await prisma.pokemon.findUnique({ where: { id } });
  if (!exists || exists.box === true)
    return res.status(404).json({ error: "Pokemon no encontrado en party" });

  await prisma.pokemon.delete({ where: { id } });
  res.json({ success: true });
});

app.get("/box", async (_req, res) => {
  const boxRows = await prisma.pokemon.findMany({
    where: { box: true },
    orderBy: { id: "asc" },
  });
  res.json(boxRows);
});

app.post("/box/:id", async (req, res) => {
  const id = Number(req.params.id);
  const exists = await prisma.pokemon.findUnique({ where: { id } });
  if (!exists || exists.box === true)
    return res.status(404).json({ error: "Pokemon no está en party" });

  const updated = await prisma.pokemon.update({
    where: { id },
    data: { box: true },
  });

  res.json(updated);
});

app.post("/party/:id/move", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const count = await prisma.pokemon.count({ where: { box: false } });
    if (count >= 6) {
      return res.status(400).json({ error: "El party está lleno (max 6)." });
    }

    const found = await prisma.pokemon.findUnique({ where: { id } });
    if (!found) return res.status(404).json({ error: "Pokemon no existe" });

    const updated = await prisma.pokemon.update({
      where: { id },
      data: { box: false },
    });

    const party = await prisma.pokemon.findMany({ where: { box: false } });
    const box = await prisma.pokemon.findMany({ where: { box: true } });
    res.json({ success: true, pokemon: updated, party, box });
  } catch (e) {
    res.status(500).json({ error: "No se pudo mover a party" });
  }
});

app.post("/party/optimize", async (_req, res) => {
  const all = await prisma.pokemon.findMany();
  const ranked = [...all].sort((a, b) => statValue(b, "total") - statValue(a, "total"));
  const partyIds = new Set(ranked.slice(0, 6).map((p) => p.id));

  await prisma.$transaction([
    prisma.pokemon.updateMany({ data: { box: true } }),
    prisma.pokemon.updateMany({ data: { box: false }, where: { id: { in: Array.from(partyIds) } } }),
  ]);

  const party = await prisma.pokemon.findMany({ where: { box: false } });
  const box = await prisma.pokemon.findMany({ where: { box: true } });

  res.json({ success: true, party, box });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

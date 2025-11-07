import axios from "axios";

const api = axios.create({ baseURL: "https://pokeapi.co/api/v2" });

function mapPokemon(p) {
  return {
    id: p.id,
    name: p.name,
    sprite: p.sprites?.other?.["official-artwork"]?.front_default || p.sprites?.front_default || "",
    types: p.types.map(t => t.type.name),
    stats: p.stats.map(s => ({
      name: s.stat.name,           // "hp", "attack", "defense", "special-attack", ...
      base: s.base_stat            // número base
    })),
    box: false
  };
}

export async function getRandomPokemonByType(type) {
  // 1) toma ids del tipo
  const { data } = await api.get(`/type/${type.toLowerCase()}`);
  const pool = data.pokemon.map((x) => x.pokemon.url.split("/").filter(Boolean).pop());
  const id = Number(pool[Math.floor(Math.random() * pool.length)]);

  // 2) trae detalle del pokemon y mapea stats
  const { data: poke } = await api.get(`/pokemon/${id}`);
  return mapPokemon(poke);
}

import { POKEMON_LIST } from "./consts/consts";

export function getRandomBattlePokemon() {
  const idx1 = Math.floor(Math.random() * POKEMON_LIST.length);
  let idx2 = Math.floor(Math.random() * POKEMON_LIST.length);

  while (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * POKEMON_LIST.length);
  }

  return [POKEMON_LIST[idx1], POKEMON_LIST[idx2]];
}

export function percent(part: number, total: number) {
  if (total === 0) return "0%";
  return ((part / total) * 100).toFixed(1) + "%";
}

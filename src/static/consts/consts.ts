export const POKEMON = [
  { name: "bulbasaur", label: "Bulbasaur" },
  { name: "pikachu", label: "Pikachu" },
];

// TODO: update with full pokemon list
export const POKEMON_LIST = [
  { name: "bulbasaur", label: "Bulbasaur" },
  { name: "ivysaur", label: "Ivysaur" },
  { name: "venusaur", label: "Venusaur" },
  /*   { name: "charmander", label: "Charmander" },
  { name: "charmeleon", label: "Charmeleon" },
  { name: "charizard", label: "Charizard" },
  { name: "squirtle", label: "Squirtle" },
  { name: "wartortle", label: "Wartortle" },
  { name: "blastoise", label: "Blastoise" },
  { name: "caterpie", label: "Caterpie" },
  { name: "metapod", label: "Metapod" },
  { name: "butterfree", label: "Butterfree" },
  { name: "weedle", label: "Weedle" },
  { name: "kakuna", label: "Kakuna" },
  { name: "beedrill", label: "Beedrill" },
  { name: "pidgey", label: "Pidgey" },
  { name: "pidgeotto", label: "Pidgeotto" },
  { name: "pidgeot", label: "Pidgeot" },
  { name: "rattata", label: "Rattata" },
  { name: "raticate", label: "Raticate" }, */
];

export function getRandomBattlePokemon() {
  const idx1 = Math.floor(Math.random() * POKEMON_LIST.length);
  let idx2 = Math.floor(Math.random() * POKEMON_LIST.length);
  while (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * POKEMON_LIST.length);
  }
  return [POKEMON_LIST[idx1], POKEMON_LIST[idx2]];
}

export const POKE_API = "https://pokeapi.co/api/v2/pokemon/";
export const VOTE_KEY = "pokemon-battle-vote";
export const CHANNEL_NAME = "pokemon-battle-channel";

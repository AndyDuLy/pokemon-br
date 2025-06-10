export type ResultsProps = {
  votes: { [key: string]: number };
  winner: string | null;
};

export type PokemonCardProps = {
  poke: any;
  votes: number;
  totalVotes: number;
  winner: string | null;
  voted: string | null;
  onVote: (pokemon: string) => void;
};

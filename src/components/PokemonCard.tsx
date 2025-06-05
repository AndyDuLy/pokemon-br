import React from "react";

type PokemonCardProps = {
  poke: any;
  votes: number;
  totalVotes: number;
  winner: string | null;
  voted: string | null;
  onVote: (pokemon: string) => void;
};

function percent(part: number, total: number) {
  if (total === 0) return "0%";
  return ((part / total) * 100).toFixed(1) + "%";
}

const PokemonCard: React.FC<PokemonCardProps> = ({
  poke,
  votes,
  totalVotes,
  winner,
  voted,
  onVote,
}) => {
  return (
    <div className={`pokemon-card${winner === poke.name ? " winner" : ""}`}>
      <h2>{poke.name.charAt(0).toUpperCase() + poke.name.slice(1)}</h2>
      <img
        src={poke.sprites.front_default}
        alt={poke.name}
        width={96}
        height={96}
      />
      <ul>
        <li>Weight: {poke.weight}</li>
        <li>Height: {poke.height}</li>
        <li>Base Exp: {poke.base_experience}</li>
      </ul>
      <button
        disabled={!!voted}
        onClick={() => onVote(poke.name)}
        style={{ opacity: voted ? 0.5 : 1 }}
      >
        {voted === poke.name
          ? "Voted already"
          : `Submit vote for ${
              poke.name.charAt(0).toUpperCase() + poke.name.slice(1)
            }`}
      </button>
      <div className="vote-bar">
        <div
          className="bar"
          style={{
            width: percent(votes, totalVotes),
            background: winner === poke.name ? "#4caf50" : "#2196f3",
          }}
        />
        <span>
          {votes} vote{votes !== 1 ? "s" : ""} ({percent(votes, totalVotes)})
        </span>
      </div>
    </div>
  );
};

export default PokemonCard;

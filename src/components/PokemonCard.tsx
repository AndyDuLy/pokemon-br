import React from "react";
import { type PokemonCardProps } from "../static/types";
import { percent } from "../static/numbers";

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
      <h2 className="pokemon-name">
        {poke.name.charAt(0).toUpperCase() + poke.name.slice(1)}
      </h2>

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

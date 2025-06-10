import React from "react";
import { type ResultsProps } from "../static/types";

const Results: React.FC<ResultsProps> = ({ votes, winner }) => {
  const pokeNames = Object.keys(votes);

  if (pokeNames.length !== 2) return null;

  const [poke1, poke2] = pokeNames;
  const votes1 = votes[poke1] || 0;
  const votes2 = votes[poke2] || 0;
  let resultText = "";

  if (votes1 === votes2) {
    resultText = "Matchup is currently a tie";
  } else {
    const winName = winner
      ? winner.charAt(0).toUpperCase() + winner.slice(1)
      : "";

    resultText = `${winName} is winning`;
  }

  return (
    <div className={"results results-visible"}>
      <h3>Results</h3>
      <p>{resultText}</p>
    </div>
  );
};

export default Results;

import React from "react";

type ResultsProps = {
  votes: { [key: string]: number };
  winner: string | null;
};

const Results: React.FC<ResultsProps> = ({ votes, winner }) => {
  return (
    <div className="results">
      <h3>Results</h3>
      <p>
        {votes.bulbasaur === votes.pikachu
          ? "Tie"
          : `${
              winner && winner.charAt(0).toUpperCase() + winner.slice(1)
            } is winning`}
      </p>
    </div>
  );
};

export default Results;

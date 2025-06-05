import { useState, useEffect, useRef } from "react";
import PokemonCard from "../components/PokemonCard";
import Results from "../components/Results";
import {
  POKEMON,
  POKE_API,
  VOTE_KEY,
  CHANNEL_NAME,
} from "../static/consts/consts";

export default function Battle() {
  const [pokemonData, setPokemonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<{ [key: string]: number }>({
    bulbasaur: 0,
    pikachu: 0,
  });
  const [voted, setVoted] = useState<string | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // hit api
  useEffect(() => {
    setLoading(true);
    Promise.all(
      POKEMON.map((p) =>
        fetch(POKE_API + p.name).then((res) => {
          if (!res.ok) throw new Error("API error");
          return res.json();
        })
      )
    )
      .then((data) => {
        setPokemonData(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load Pokémon data.");
        setLoading(false);
      });
  }, []);

  // localStorage vote storage
  useEffect(() => {
    const stored = localStorage.getItem(VOTE_KEY);
    if (stored) setVoted(stored);
  }, []);

  // sync from broadcast channel
  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;
    channel.onmessage = (event) => {
      if (event.data.type === "votes-update") {
        setVotes(event.data.votes);
      } else if (event.data.type === "sync-request") {
        channel.postMessage({ type: "votes-update", votes });
      }
    };
    channel.postMessage({ type: "sync-request" });
    return () => channel.close();
  }, []);

  // re-render on vote update
  useEffect(() => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type: "votes-update", votes });
    }
  }, [votes]);

  // handle votes
  const handleVote = (pokemon: string) => {
    if (voted) return;
    const newVotes = { ...votes, [pokemon]: votes[pokemon] + 1 };
    setVotes(newVotes);
    setVoted(pokemon);
    localStorage.setItem(VOTE_KEY, pokemon);
    if (channelRef.current) {
      channelRef.current.postMessage({ type: "votes-update", votes: newVotes });
    }
  };

  // ui update for winner
  const totalVotes = votes.bulbasaur + votes.pikachu;
  let winner: string | null = null;
  if (votes.bulbasaur > votes.pikachu) winner = "bulbasaur";
  else if (votes.pikachu > votes.bulbasaur) winner = "pikachu";

  if (loading) return <p>Loading Pokémon...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <div className="battle">
        {pokemonData.map((poke: any) => (
          <PokemonCard
            key={poke.id}
            poke={poke}
            votes={votes[poke.name]}
            totalVotes={totalVotes}
            winner={winner}
            voted={voted}
            onVote={handleVote}
          />
        ))}
      </div>
      {voted && <Results votes={votes} winner={winner} />}
    </>
  );
}

import { useState, useEffect, useRef } from "react";
import PokemonCard from "../components/PokemonCard";
import Results from "../components/Results";
import {
  POKE_API,
  CHANNEL_NAME,
  getRandomBattlePokemon,
} from "../static/consts/consts";

// localStorage key for voting matchup
function getMatchupKey(poke1: string, poke2: string) {
  return [poke1, poke2].sort().join("_vs_");
}

export default function Battle() {
  const [pokemonChoices, setPokemonChoices] = useState<any[]>([]);
  const [pokemonData, setPokemonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<{ [key: string]: number }>({});
  const [voted, setVoted] = useState<string | null>(null);
  const [matchupKey, setMatchupKey] = useState<string>("");
  const channelRef = useRef<BroadcastChannel | null>(null);

  // matchup handler
  const startNewBattle = () => {
    const choices = getRandomBattlePokemon();
    setPokemonChoices(choices);

    const key = getMatchupKey(choices[0].name, choices[1].name);
    setMatchupKey(key);

    // grab existing votes if exists
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setVotes(
          parsed.votes || { [choices[0].name]: 0, [choices[1].name]: 0 }
        );
        setVoted(parsed.voted || null);
      } catch {
        setVotes({ [choices[0].name]: 0, [choices[1].name]: 0 });
        setVoted(null);
      }
    } else {
      setVotes({ [choices[0].name]: 0, [choices[1].name]: 0 });
      setVoted(null);
    }
    setLoading(true);
  };

  useEffect(() => {
    startNewBattle();
    // eslint-disable-next-line
  }, []);

  // hit api
  useEffect(() => {
    if (pokemonChoices.length !== 2) return;
    setLoading(true);
    Promise.all(
      pokemonChoices.map((p) =>
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
  }, [pokemonChoices]);

  // localStorage vote storage
  useEffect(() => {
    if (pokemonChoices.length !== 2) return;
    const key = getMatchupKey(pokemonChoices[0].name, pokemonChoices[1].name);
    setMatchupKey(key);
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setVotes(
          parsed.votes || {
            [pokemonChoices[0].name]: 0,
            [pokemonChoices[1].name]: 0,
          }
        );
        setVoted(parsed.voted || null);
      } catch {
        setVotes({ [pokemonChoices[0].name]: 0, [pokemonChoices[1].name]: 0 });
        setVoted(null);
      }
    } else {
      setVotes({ [pokemonChoices[0].name]: 0, [pokemonChoices[1].name]: 0 });
      setVoted(null);
    }
  }, [pokemonChoices]);

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
  }, [pokemonChoices]);

  // re-render on vote update
  useEffect(() => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type: "votes-update", votes });
    }
  }, [votes]);

  // handle votes
  const handleVote = (pokemon: string) => {
    if (voted || !matchupKey) return;
    const newVotes = { ...votes, [pokemon]: (votes[pokemon] || 0) + 1 };
    setVotes(newVotes);
    setVoted(pokemon);
    localStorage.setItem(
      matchupKey,
      JSON.stringify({ voted: pokemon, votes: newVotes })
    );
    if (channelRef.current) {
      channelRef.current.postMessage({ type: "votes-update", votes: newVotes });
    }
  };

  // ui update for winner
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  let winner: string | null = null;
  if (
    pokemonChoices.length === 2 &&
    votes[pokemonChoices[0].name] > votes[pokemonChoices[1].name]
  )
    winner = pokemonChoices[0].name;
  else if (
    pokemonChoices.length === 2 &&
    votes[pokemonChoices[1].name] > votes[pokemonChoices[0].name]
  )
    winner = pokemonChoices[1].name;

  if (loading) return <p>Loading Pokémon...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <button onClick={startNewBattle} style={{ marginBottom: 16 }}>
        New Battle
      </button>
      <div className="battle">
        {pokemonData.map((poke: any) => (
          <PokemonCard
            key={poke.id}
            poke={poke}
            votes={votes[poke.name] || 0}
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

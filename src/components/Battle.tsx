import { useState, useEffect, useRef } from "react";
import PokemonCard from "../components/PokemonCard";
import Results from "../components/Results";
import { POKE_API, CHANNEL_NAME } from "../static/consts/consts";
import { getRandomBattlePokemon } from "../static/numbers";

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
  const [reVoteWarning, setReVoteWarning] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // matchup handler
  const startNewBattle = () => {
    let choices, sortedNames, key;
    let attempts = 0;

    do {
      choices = getRandomBattlePokemon();
      sortedNames = [choices[0].name, choices[1].name].sort();
      key = getMatchupKey(sortedNames[0], sortedNames[1]);
      attempts++;
    } while (key === matchupKey && attempts < 10);

    // sort matchup to account for reversed order
    setPokemonChoices(choices);
    setMatchupKey(key);

    // grab existing votes if exists
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        // map votes for display order
        const parsed = JSON.parse(stored);
        const votesObj = {
          [choices[0].name]: parsed.votes[choices[0].name] || 0,
          [choices[1].name]: parsed.votes[choices[1].name] || 0,
        };

        setVotes(votesObj);
        setVoted(parsed.voted || null);
      } catch {
        setVotes({ [choices[0].name]: 0, [choices[1].name]: 0 });
        setVoted(null);
      }
    } else {
      setVotes({ [choices[0].name]: 0, [choices[1].name]: 0 });
      setVoted(null);
    }

    setReVoteWarning(false);
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

    // sort matchup
    const sortedNames = [pokemonChoices[0].name, pokemonChoices[1].name].sort();
    const key = getMatchupKey(sortedNames[0], sortedNames[1]);

    setMatchupKey(key);

    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        // map votes for display order
        const parsed = JSON.parse(stored);
        const votesObj = {
          [pokemonChoices[0].name]: parsed.votes[pokemonChoices[0].name] || 0,
          [pokemonChoices[1].name]: parsed.votes[pokemonChoices[1].name] || 0,
        };

        setVotes(votesObj);
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
    if (voted || !matchupKey) {
      setReVoteWarning(true);
      return;
    }

    const newVotes = { ...votes, [pokemon]: (votes[pokemon] || 0) + 1 };
    setVotes(newVotes);
    setVoted(pokemon);

    // sort matchup to save votes
    const sortedNames = [pokemonChoices[0].name, pokemonChoices[1].name].sort();
    const key = getMatchupKey(sortedNames[0], sortedNames[1]);
    const votesToStore = {
      [sortedNames[0]]: newVotes[sortedNames[0]] || 0,
      [sortedNames[1]]: newVotes[sortedNames[1]] || 0,
    };

    localStorage.setItem(
      key,
      JSON.stringify({ voted: pokemon, votes: votesToStore })
    );

    if (channelRef.current)
      channelRef.current.postMessage({ type: "votes-update", votes: newVotes });
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

      {reVoteWarning && (
        <div style={{ color: "orange", marginBottom: 8 }}>
          You have already voted for this matchup. Re-voting is not allowed.
        </div>
      )}

      <div className="battle-cards-row">
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

      <div className="battle-results-row">
        {voted && <Results votes={votes} winner={winner} />}
      </div>
    </>
  );
}

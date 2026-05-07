import { useState, useEffect, useRef } from "react";
import { AMAZON_SELLERS, PRESCRIPTION_DRUGS } from "./data.js";

const TOTAL_ROUNDS = 10;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck() {
  const amazon = shuffle(AMAZON_SELLERS)
    .slice(0, Math.ceil(TOTAL_ROUNDS / 2))
    .map(name => ({ name, answer: "amazon" }));
  const drugs = shuffle(PRESCRIPTION_DRUGS)
    .slice(0, Math.floor(TOTAL_ROUNDS / 2) + 1)
    .map(name => ({ name, answer: "drug" }));
  return shuffle([...amazon, ...drugs]).slice(0, TOTAL_ROUNDS);
}

function endingFor(score, total) {
  const pct = Math.round((score / total) * 100);
  if (pct === 100) return { title: "Pharmacist-grade.", blurb: "A perfect run. Are you sure you're not on Amazon's brand-protection team?" };
  if (pct >= 80) return { title: "Sharp eye.", blurb: "You can spot a vowel-stuffed shell company from a mile away." };
  if (pct >= 60) return { title: "Better than a coin flip.", blurb: "The line between gut-flora supplement and ergonomic chair brand is thin." };
  if (pct >= 40) return { title: "It's tricky out there.", blurb: "Modern branding has fully collapsed. Don't take it personally." };
  return { title: "Rough round.", blurb: "Honestly though — what even is a Mrocioa?" };
}

export default function App() {
  const [deck, setDeck] = useState(buildDeck);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [picked, setPicked] = useState(null);
  const [phase, setPhase] = useState("playing");
  const advanceTimer = useRef(null);

  const card = deck[roundIndex];

  function handleAnswer(answer) {
    if (picked !== null || phase !== "playing") return;
    setPicked(answer);
    const correct = answer === card.answer;
    if (correct) {
      const nextStreak = streak + 1;
      setScore(s => s + 1);
      setStreak(nextStreak);
      setBestStreak(b => Math.max(b, nextStreak));
    } else {
      setStreak(0);
    }
    advanceTimer.current = setTimeout(() => {
      const nextRound = roundIndex + 1;
      if (nextRound >= deck.length) {
        setPhase("ended");
      } else {
        setRoundIndex(nextRound);
        setPicked(null);
      }
    }, correct ? 700 : 1300);
  }

  function restart() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setDeck(buildDeck());
    setRoundIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setPicked(null);
    setPhase("playing");
  }

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (phase !== "playing" || picked !== null) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "1") handleAnswer("amazon");
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "2") handleAnswer("drug");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (phase === "ended") {
    const { title, blurb } = endingFor(score, deck.length);
    const pct = Math.round((score / deck.length) * 100);
    return (
      <main className="stage">
        <Hud score={score} streak={streak} round={deck.length} total={deck.length} />
        <section className="endcard">
          <h2>{title}</h2>
          <p className="end-score">{score} / {deck.length} correct  ·  {pct}%</p>
          <p>{blurb}  Best streak: {bestStreak}.</p>
          <button className="play-again" onClick={restart}>Play again</button>
        </section>
      </main>
    );
  }

  let feedback = " ";
  let feedbackTone = "";
  if (picked) {
    if (picked === card.answer) {
      feedback = streak >= 3 ? `Correct — ${streak} in a row!` : "Correct!";
      feedbackTone = "good";
    } else {
      const reveal = card.answer === "amazon" ? "an Amazon seller" : "a prescription drug";
      feedback = `Nope — ${card.name} is ${reveal}.`;
      feedbackTone = "bad";
    }
  }

  return (
    <main className="stage">
      <Hud score={score} streak={streak} round={roundIndex + 1} total={deck.length} />
      <section className="card">
        <p className="prompt">What is it?</p>
        <h1 key={roundIndex} className="word">{card.name}</h1>
        <div className="choices">
          <Choice answer="amazon" picked={picked} correctAnswer={card.answer} onClick={handleAnswer} icon="📦" label="Amazon Seller" />
          <Choice answer="drug" picked={picked} correctAnswer={card.answer} onClick={handleAnswer} icon="💊" label="Prescription Drug" />
        </div>
        <p className={`feedback ${feedbackTone}`}>{feedback}</p>
      </section>
    </main>
  );
}

function Hud({ score, streak, round, total }) {
  return (
    <header className="hud">
      <div className="hud-cell"><span className="hud-label">Score</span><span className="hud-value">{score}</span></div>
      <div className="hud-cell"><span className="hud-label">Streak</span><span className="hud-value">{streak}</span></div>
      <div className="hud-cell"><span className="hud-label">Round</span><span className="hud-value">{round} / {total}</span></div>
    </header>
  );
}

function Choice({ answer, picked, correctAnswer, onClick, icon, label }) {
  let cls = `choice choice-${answer}`;
  if (picked) {
    if (answer === correctAnswer) cls += " correct";
    if (answer === picked && picked !== correctAnswer) cls += " wrong";
  }
  return (
    <button className={cls} disabled={picked !== null} onClick={() => onClick(answer)}>
      <span className="choice-icon">{icon}</span>
      <span className="choice-label">{label}</span>
    </button>
  );
}

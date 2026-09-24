import React, { useEffect, useState } from "react";
import { IoChevronBack, IoChevronForward, IoSyncOutline } from "react-icons/io5";

const FlashcardDeck = ({ cards = [] }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const goTo = (i) => {
    setFlipped(false);
    setIndex(((i % cards.length) + cards.length) % cards.length);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, cards.length]);

  if (!cards.length) return null;
  const card = cards[index];

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center">
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-ink-300">
        Card {index + 1} of {cards.length}
      </p>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="group [perspective:1200px] h-72 w-full"
        aria-label="Flip card"
      >
        <div
          className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl2 border border-line bg-paper-50 p-8 text-center shadow-card [backface-visibility:hidden]">
            <span className="mb-3 text-xs font-semibold uppercase tracking-wide text-pine">Question</span>
            <p className="font-display text-xl text-ink-700">{card.question}</p>
            <span className="mt-6 flex items-center gap-1 text-xs text-ink-300">
              <IoSyncOutline size={13} /> Tap to reveal answer
            </span>
          </div>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl2 border border-pine-100 bg-pine-50 p-8 text-center shadow-card [backface-visibility:hidden]"
            style={{ transform: "rotateY(180deg)" }}
          >
            <span className="mb-3 text-xs font-semibold uppercase tracking-wide text-pine-600">Answer</span>
            <p className="text-base leading-relaxed text-ink-700">{card.answer}</p>
          </div>
        </div>
      </button>

      <div className="mt-6 flex items-center gap-4">
        <button onClick={() => goTo(index - 1)} className="btn-secondary !px-3" aria-label="Previous card">
          <IoChevronBack size={16} />
        </button>
        <button onClick={() => setFlipped((f) => !f)} className="btn-ghost">
          Flip
        </button>
        <button onClick={() => goTo(index + 1)} className="btn-secondary !px-3" aria-label="Next card">
          <IoChevronForward size={16} />
        </button>
      </div>
    </div>
  );
};

export default FlashcardDeck;

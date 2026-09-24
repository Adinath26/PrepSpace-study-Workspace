import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { IoChevronBack, IoAlbumsOutline } from "react-icons/io5";
import AppLayout from "../components/layout/AppLayout";
import FlashcardDeck from "../components/flashcards/FlashcardDeck";
import EmptyState from "../components/common/EmptyState";
import Spinner from "../components/common/Spinner";
import { getFlashcardSet } from "../services/flashcardService";

const Flashcards = () => {
  const { setId } = useParams();
  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getFlashcardSet(setId);
        setSet(data);
      } catch {
        toast.error("Couldn't load these flashcards.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setId]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <Link
          to={set?.documentId ? `/documents/${set.documentId}` : "/dashboard"}
          className="mb-6 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-pine"
        >
          <IoChevronBack size={15} /> Back to document
        </Link>

        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner label="Loading flashcards…" />
          </div>
        ) : !set || !(set.cards || []).length ? (
          <EmptyState icon={<IoAlbumsOutline />} title="No flashcards found" description="Generate a set from a document's AI Study Mode." />
        ) : (
          <>
            <h1 className="mb-8 font-display text-2xl font-semibold text-ink-700">{set.title}</h1>
            <FlashcardDeck cards={set.cards} />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Flashcards;

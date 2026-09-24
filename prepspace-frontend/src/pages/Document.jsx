import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  IoChevronBack,
  IoSparklesOutline,
  IoHelpCircleOutline,
  IoDocumentTextOutline,
} from "react-icons/io5";
import Navbar from "../components/layout/Navbar";
import PdfViewer from "../components/documents/PdfViewer";
import ChatPanel from "../components/ai/ChatPanel";
import Spinner from "../components/common/Spinner";
import { getDocument } from "../services/documentService";
import { generateFlashcards, generateQuiz } from "../services/aiService";
import { saveFlashcardSet } from "../services/flashcardService";
import { saveQuiz } from "../services/quizService";

const Document = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null); // "flashcards" | "quiz" | null

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const doc = await getDocument(documentId);
        setDocument(doc);
      } catch {
        toast.error("Couldn't load this document.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [documentId]);

  const handleGenerateFlashcards = async () => {
    try {
      setGenerating("flashcards");
      const cards = await generateFlashcards({ documentId });
      const saved = await saveFlashcardSet({
        documentId,
        title: `${document.title} — Flashcards`,
        cards,
      });
      toast.success("Flashcards ready.");
      navigate(`/flashcards/${saved._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't generate flashcards.");
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      setGenerating("quiz");
      const questions = await generateQuiz({ documentId });
      const saved = await saveQuiz({
        documentId,
        title: `${document.title} — Quiz`,
        questions: questions.questions ?? questions,
      });
      toast.success("Quiz ready.");
      navigate(`/quizzes/${saved._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't generate a quiz.");
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col bg-paper">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Spinner label="Opening document…" />
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex h-screen flex-col bg-paper">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-ink-500">Document not found.</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-paper">
      <Navbar />
      <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={document.notebookId ? `/notebooks/${document.notebookId}` : "/dashboard"}
            className="flex items-center gap-1 text-sm text-ink-500 hover:text-pine"
          >
            <IoChevronBack size={15} /> Back
          </Link>
          <span className="h-4 w-px bg-line" />
          <IoDocumentTextOutline className="shrink-0 text-pine" size={17} />
          <h1 className="truncate text-sm font-semibold text-ink-700">{document.title}</h1>
        </div>
        <div className="flex shrink-0 gap-2">
          <button className="btn-secondary" onClick={handleGenerateFlashcards} disabled={Boolean(generating)}>
            <IoSparklesOutline size={16} />
            {generating === "flashcards" ? "Generating…" : "Flashcards"}
          </button>
          <button className="btn-secondary" onClick={handleGenerateQuiz} disabled={Boolean(generating)}>
            <IoHelpCircleOutline size={16} />
            {generating === "quiz" ? "Generating…" : "Quiz"}
          </button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1.4fr_1fr]">
        <div className="h-full overflow-hidden border-b border-line lg:border-b-0 lg:border-r">
          <PdfViewer fileUrl={document.fileUrl} title={document.title} />
        </div>
        <div className="h-full overflow-hidden">
          <ChatPanel documentId={documentId} documentTitle={document.title} />
        </div>
      </div>
    </div>
  );
};

export default Document;

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { IoChevronBack, IoHelpCircleOutline } from "react-icons/io5";
import AppLayout from "../components/layout/AppLayout";
import QuizPlayer from "../components/quiz/QuizPlayer";
import EmptyState from "../components/common/EmptyState";
import Spinner from "../components/common/Spinner";
import { getQuiz } from "../services/quizService";

const Quiz = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getQuiz(quizId);
        setQuiz(data);
      } catch {
        toast.error("Couldn't load this quiz.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <Link
          to={quiz?.documentId ? `/documents/${quiz.documentId}` : "/dashboard"}
          className="mb-6 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-pine"
        >
          <IoChevronBack size={15} /> Back to document
        </Link>

        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner label="Loading quiz…" />
          </div>
        ) : !quiz || !(quiz.questions || []).length ? (
          <EmptyState icon={<IoHelpCircleOutline />} title="No quiz found" description="Generate a quiz from a document's AI Study Mode." />
        ) : (
          <>
            <h1 className="mb-8 font-display text-2xl font-semibold text-ink-700">{quiz.title}</h1>
            <QuizPlayer quiz={quiz} />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Quiz;

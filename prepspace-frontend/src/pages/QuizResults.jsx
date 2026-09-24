import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { IoChevronBack, IoCheckmarkCircle, IoCloseCircle, IoTrophyOutline } from "react-icons/io5";
import AppLayout from "../components/layout/AppLayout";
import Spinner from "../components/common/Spinner";
import { getQuizResults } from "../services/quizService";

const Ring = ({ percent }) => {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  const color = percent >= 70 ? "#2F5D50" : percent >= 40 ? "#C9A15A" : "#B3423C";
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="mx-auto">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#E4E0D6" strokeWidth="12" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="76" textAnchor="middle" className="fill-ink-700" fontSize="26" fontWeight="700">
        {percent}%
      </text>
    </svg>
  );
};

const QuizResults = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [quiz, setQuiz] = useState(location.state?.quiz || null);
  const [loading, setLoading] = useState(!location.state?.result);

  useEffect(() => {
    if (result) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getQuizResults(quizId);
        setResult(data);
      } catch {
        toast.error("Couldn't load your results.");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-24">
          <Spinner label="Scoring your quiz…" />
        </div>
      </AppLayout>
    );
  }

  if (!result) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center text-ink-500">Results not available.</div>
      </AppLayout>
    );
  }

  const percent = Math.round(((result.score ?? 0) / (result.total || 1)) * 100);

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
        <Link
          to={quiz?.documentId ? `/documents/${quiz.documentId}` : "/dashboard"}
          className="mb-6 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-pine"
        >
          <IoChevronBack size={15} /> Back to document
        </Link>

        <div className="card p-8 text-center">
          <IoTrophyOutline size={28} className="mx-auto mb-2 text-brass-600" />
          <h1 className="font-display text-2xl font-semibold text-ink-700">Quiz complete</h1>
          <p className="mt-1 text-sm text-ink-500">
            You scored {result.score} out of {result.total}
          </p>
          <div className="my-6">
            <Ring percent={percent} />
          </div>
        </div>

        {Array.isArray(result.breakdown) && result.breakdown.length > 0 && (
          <div className="mt-6 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-300">Review</h2>
            {result.breakdown.map((item, i) => (
              <div key={i} className="card flex items-start gap-3 p-4">
                {item.correct ? (
                  <IoCheckmarkCircle size={20} className="mt-0.5 shrink-0 text-pine" />
                ) : (
                  <IoCloseCircle size={20} className="mt-0.5 shrink-0 text-clay" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-700">{item.prompt || item.question}</p>
                  {!item.correct && (
                    <p className="mt-1 text-xs text-ink-500">
                      Correct answer: <span className="font-medium text-pine-700">{item.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default QuizResults;

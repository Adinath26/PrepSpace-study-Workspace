import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { IoArrowForward, IoCheckmarkCircle } from "react-icons/io5";
import { submitQuiz } from "../../services/quizService";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

const QuizPlayer = ({ quiz }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const questions = quiz.questions || [];
  const question = questions[current];
  const isLast = current === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  const select = (optionKey) => {
    setAnswers((prev) => ({ ...prev, [question._id || question.id || current]: optionKey }));
  };

  const handleNext = async () => {
    if (!isLast) {
      setCurrent((c) => c + 1);
      return;
    }
    if (answeredCount < questions.length) {
      toast.error(`You still have ${questions.length - answeredCount} unanswered question(s).`);
      return;
    }
    try {
      setSubmitting(true);
      const payload = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      }));
      const result = await submitQuiz(quiz._id, payload);
      navigate(`/quizzes/${quiz._id}/results`, { state: { result, quiz } });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't submit the quiz. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!questions.length) return null;

  const selected = answers[question._id || question.id || current];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-300">
          Question {current + 1} of {questions.length}
        </p>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-paper-200">
          <div
            className="h-full rounded-full bg-pine transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-display text-lg text-ink-700">{question.prompt || question.question}</h3>
        <div className="mt-5 space-y-2.5">
          {(question.options || []).map((opt, i) => {
            const key = opt.key || OPTION_LABELS[i];
            const label = opt.text || opt;
            const isSelected = selected === key;
            return (
              <button
                key={key}
                onClick={() => select(key)}
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                  isSelected
                    ? "border-pine bg-pine-50 text-pine-700 font-medium"
                    : "border-line bg-paper-50 text-ink-700 hover:border-pine-400"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-semibold ${
                    isSelected ? "border-pine bg-pine text-paper-50" : "border-line text-ink-300"
                  }`}
                >
                  {OPTION_LABELS[i]}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          className="btn-ghost"
          disabled={current === 0}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        >
          Back
        </button>
        <button className="btn-primary" onClick={handleNext} disabled={selected === undefined || submitting}>
          {isLast ? (
            <>
              {submitting ? "Submitting…" : "Submit quiz"} <IoCheckmarkCircle size={16} />
            </>
          ) : (
            <>
              Next <IoArrowForward size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizPlayer;

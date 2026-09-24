import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { IoSend, IoSparkles, IoPersonCircleOutline } from "react-icons/io5";
import { sendChatMessage } from "../../services/aiService";

const SUGGESTED_PROMPTS = [
  "Summarize this document in 5 bullet points",
  "Explain the hardest concept here simply",
  "Quiz me on the key terms",
];

const ChatPanel = ({ documentId, documentTitle }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `I've read **${documentTitle || "this document"}**. Ask me anything about it — I'll answer using its content.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || sending) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setSending(true);

    try {
      const data = await sendChatMessage({ documentId, message: question, conversationId });
      if (data.conversationId) setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "The assistant couldn't respond. Try again.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "_Sorry, I ran into an error answering that. Please try again._" },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-pine text-paper-50">
          <IoSparkles size={14} />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-700">AI Study Mode</p>
          <p className="text-xs text-ink-300">Grounded in this document</p>
        </div>
      </div>

      <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <span
              className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                m.role === "user" ? "bg-brass-100 text-brass-600" : "bg-pine-50 text-pine"
              }`}
            >
              {m.role === "user" ? <IoPersonCircleOutline size={17} /> : <IoSparkles size={13} />}
            </span>
            <div
              className={`max-w-[80%] rounded-xl2 px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-pine text-paper-50"
                  : "border border-line bg-paper-50 text-ink-700"
              }`}
            >
              <div className="prose-sm prose-p:my-1 prose-ul:my-1">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pine-50 text-pine">
              <IoSparkles size={13} />
            </span>
            <div className="flex items-center gap-1 rounded-xl2 border border-line bg-paper-50 px-3.5 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-300" />
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="rounded-full border border-line bg-paper-50 px-3 py-1.5 text-xs text-ink-500 hover:border-pine-400 hover:text-pine"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-line p-3">
        <input
          className="input"
          placeholder="Ask about this document…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="btn-primary !px-3.5" disabled={sending || !input.trim()} aria-label="Send">
          <IoSend size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;

import React from "react";
import { Link } from "react-router-dom";
import { IoDocumentTextOutline, IoTrashOutline } from "react-icons/io5";

const NotebookCard = ({ notebook, onDelete }) => {
  const resourceCount = notebook.documentCount ?? notebook.documents?.length ?? 0;

  return (
    <div
      className="spine-tab group card relative flex flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:shadow-pop"
      style={{ "--spine-color": notebook.color || "#2F5D50" }}
    >
      <Link to={`/notebooks/${notebook._id}`} className="block">
        <h3 className="font-display text-lg font-semibold text-ink-700 line-clamp-1">{notebook.name}</h3>
        <p className="mt-1.5 min-h-[2.5rem] text-sm text-ink-500 line-clamp-2">
          {notebook.description || "No description yet."}
        </p>
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink-300">
          <IoDocumentTextOutline size={14} />
          {resourceCount} {resourceCount === 1 ? "resource" : "resources"}
        </span>
        <button
          onClick={() => onDelete?.(notebook)}
          className="rounded-md p-1.5 text-ink-300 opacity-0 transition hover:bg-clay-100 hover:text-clay group-hover:opacity-100"
          aria-label={`Delete ${notebook.name}`}
          title="Delete notebook"
        >
          <IoTrashOutline size={15} />
        </button>
      </div>
    </div>
  );
};

export default NotebookCard;

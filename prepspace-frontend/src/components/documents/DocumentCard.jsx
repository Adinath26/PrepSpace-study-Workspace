import React from "react";
import { Link } from "react-router-dom";
import { IoDocumentOutline, IoTrashOutline, IoSparklesOutline } from "react-icons/io5";

const formatSize = (bytes) => {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const DocumentCard = ({ document, onDelete }) => {
  return (
    <div className="group card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-pop">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-pine-50 text-pine">
        <IoDocumentOutline size={22} />
      </div>
      <Link to={`/documents/${document._id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-700">{document.title || document.originalFileName}</p>
        <p className="mt-0.5 font-mono text-xs text-ink-300">
          {formatSize(document.fileSize)}
          {document.createdAt ? ` · Added ${new Date(document.createdAt).toLocaleDateString()}` : ""}
        </p>
      </Link>
      <Link
        to={`/documents/${document._id}`}
        className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-paper-200 px-2.5 py-1.5 text-xs font-medium text-pine-700 hover:bg-pine-50 sm:flex"
      >
        <IoSparklesOutline size={14} /> Study
      </Link>
      <button
        onClick={() => onDelete?.(document)}
        className="rounded-md p-1.5 text-ink-300 opacity-0 transition hover:bg-clay-100 hover:text-clay group-hover:opacity-100"
        aria-label={`Delete ${document.title}`}
        title="Delete resource"
      >
        <IoTrashOutline size={16} />
      </button>
    </div>
  );
};

export default DocumentCard;

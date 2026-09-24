import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";

const Modal = ({ open, onClose, title, children, footer, maxWidth = "max-w-md" }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidth} card p-6 shadow-pop animate-[fadeIn_.15s_ease-out]`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-ink-700">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-ink-300 hover:bg-paper-200 hover:text-ink-700"
            aria-label="Close dialog"
          >
            <IoClose size={20} />
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;

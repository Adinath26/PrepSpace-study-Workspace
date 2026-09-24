import React from "react";

const Spinner = ({ label, size = "md" }) => {
  const dims = size === "sm" ? "h-4 w-4 border-2" : size === "lg" ? "h-10 w-10 border-[3px]" : "h-6 w-6 border-2";
  return (
    <div className="flex flex-col items-center gap-3 text-ink-500">
      <span
        className={`${dims} animate-spin rounded-full border-pine-100 border-t-pine`}
        aria-hidden="true"
      />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
};

export default Spinner;

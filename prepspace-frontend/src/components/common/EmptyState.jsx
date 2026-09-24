import React from "react";

const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-line bg-paper-50/60 px-6 py-16 text-center">
    {icon && <div className="mb-4 text-4xl text-pine-400">{icon}</div>}
    <h3 className="font-display text-lg text-ink-700">{title}</h3>
    {description && <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;

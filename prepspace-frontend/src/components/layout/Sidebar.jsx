import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { IoAddOutline, IoGridOutline, IoBookOutline } from "react-icons/io5";
import { getNotebooks } from "../../services/notebookService";
import CreateNotebookModal from "../notebooks/CreateNotebookModal";

const SPINE_COLORS = ["#2F5D50", "#C9A15A", "#B3423C", "#3E7A69", "#8890A0", "#A97F3C"];

const Sidebar = ({ refreshKey = 0, onNotebookCreated }) => {
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { notebookId } = useParams();

  const load = async () => {
    try {
      setLoading(true);
      const data = await getNotebooks();
      setNotebooks(Array.isArray(data) ? data : []);
    } catch {
      // Sidebar failures shouldn't block the rest of the app.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleCreated = (notebook) => {
    setNotebooks((prev) => [notebook, ...prev]);
    setModalOpen(false);
    onNotebookCreated?.(notebook);
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-paper-100/70 px-3 py-5">
      <nav className="mb-6 space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive ? "bg-pine-50 text-pine-700" : "text-ink-500 hover:bg-paper-200 hover:text-ink-700"
            }`
          }
        >
          <IoGridOutline size={17} /> Dashboard
        </NavLink>
      </nav>

      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-300">My Notebooks</span>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-md p-1 text-ink-500 hover:bg-paper-200 hover:text-pine"
          aria-label="Create notebook"
          title="Create notebook"
        >
          <IoAddOutline size={16} />
        </button>
      </div>

      <div className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto pr-1">
        {loading && (
          <div className="px-3 py-2 text-xs text-ink-300">Loading notebooks…</div>
        )}
        {!loading && notebooks.length === 0 && (
          <button
            onClick={() => setModalOpen(true)}
            className="mx-1 mt-1 flex w-[calc(100%-0.5rem)] items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2.5 text-left text-xs text-ink-500 hover:border-pine-400 hover:text-pine"
          >
            <IoAddOutline size={15} /> Create your first notebook
          </button>
        )}
        {notebooks.map((nb, i) => (
          <NavLink
            key={nb._id}
            to={`/notebooks/${nb._id}`}
            style={{ "--spine-color": nb.color || SPINE_COLORS[i % SPINE_COLORS.length] }}
            className={({ isActive }) =>
              `spine-tab flex items-center gap-2 rounded-lg py-2 pr-2 text-sm transition ${
                isActive || notebookId === nb._id
                  ? "bg-paper-50 font-medium text-ink-700 shadow-card"
                  : "text-ink-500 hover:bg-paper-200"
              }`
            }
          >
            <IoBookOutline size={15} className="shrink-0 text-ink-300" />
            <span className="truncate">{nb.name}</span>
          </NavLink>
        ))}
      </div>

      <CreateNotebookModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </aside>
  );
};

export default Sidebar;

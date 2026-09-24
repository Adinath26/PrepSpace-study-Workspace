import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoAddOutline, IoLibraryOutline } from "react-icons/io5";
import AppLayout from "../components/layout/AppLayout";
import NotebookCard from "../components/notebooks/NotebookCard";
import CreateNotebookModal from "../components/notebooks/CreateNotebookModal";
import EmptyState from "../components/common/EmptyState";
import Spinner from "../components/common/Spinner";
import { getNotebooks, deleteNotebook } from "../services/notebookService";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getNotebooks();
      setNotebooks(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Couldn't load your notebooks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreated = (notebook) => {
    setNotebooks((prev) => [notebook, ...prev]);
    setModalOpen(false);
    setSidebarRefreshKey((k) => k + 1);
  };

  const handleDelete = async (notebook) => {
    if (!window.confirm(`Delete “${notebook.name}”? Its resources will be removed too.`)) return;
    const prev = notebooks;
    setNotebooks((n) => n.filter((nb) => nb._id !== notebook._id));
    try {
      await deleteNotebook(notebook._id);
      toast.success("Notebook deleted.");
      setSidebarRefreshKey((k) => k + 1);
    } catch (err) {
      setNotebooks(prev);
      toast.error("Couldn't delete the notebook.");
    }
  };

  const firstName = user?.name?.split(" ")[0];

  return (
    <AppLayout sidebarRefreshKey={sidebarRefreshKey}>
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-ink-300">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-ink-700">
              {firstName ? `Welcome back, ${firstName}` : "Your notebooks"}
            </h1>
          </div>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <IoAddOutline size={18} /> New notebook
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner label="Loading your notebooks…" />
          </div>
        ) : notebooks.length === 0 ? (
          <EmptyState
            icon={<IoLibraryOutline />}
            title="No notebooks yet"
            description="Create a notebook for each subject — Operating Systems, DBMS, Computer Networks — and start adding PDFs to study."
            action={
              <button className="btn-primary" onClick={() => setModalOpen(true)}>
                <IoAddOutline size={18} /> Create your first notebook
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {notebooks.map((nb) => (
              <NotebookCard key={nb._id} notebook={nb} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <CreateNotebookModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />
    </AppLayout>
  );
};

export default Dashboard;

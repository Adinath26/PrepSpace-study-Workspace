import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { IoAddOutline, IoDocumentTextOutline, IoChevronBack, IoPencilOutline } from "react-icons/io5";
import AppLayout from "../components/layout/AppLayout";
import DocumentCard from "../components/documents/DocumentCard";
import UploadDocumentModal from "../components/documents/UploadDocumentModal";
import EmptyState from "../components/common/EmptyState";
import Spinner from "../components/common/Spinner";
import { getNotebook, updateNotebook, deleteNotebook } from "../services/notebookService";
import { getDocuments, deleteDocument } from "../services/documentService";

const Notebook = () => {
  const { notebookId } = useParams();
  const navigate = useNavigate();
  const [notebook, setNotebook] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const [nb, docs] = await Promise.all([getNotebook(notebookId), getDocuments(notebookId)]);
      setNotebook(nb);
      setNameDraft(nb.name);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      toast.error("Couldn't load this notebook.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookId]);

  const handleUploaded = (doc) => {
    setDocuments((prev) => [doc, ...prev]);
    setModalOpen(false);
  };

  const handleDeleteDoc = async (doc) => {
    if (!window.confirm(`Remove “${doc.title || doc.originalFileName}” from this notebook?`)) return;
    const prev = documents;
    setDocuments((d) => d.filter((x) => x._id !== doc._id));
    try {
      await deleteDocument(doc._id);
      toast.success("Resource removed.");
    } catch {
      setDocuments(prev);
      toast.error("Couldn't remove the resource.");
    }
  };

  const handleRenameSave = async () => {
    if (!nameDraft.trim() || nameDraft === notebook.name) {
      setEditingName(false);
      setNameDraft(notebook.name);
      return;
    }
    try {
      const updated = await updateNotebook(notebookId, { name: nameDraft.trim() });
      setNotebook(updated);
      toast.success("Notebook renamed.");
    } catch {
      toast.error("Couldn't rename the notebook.");
    } finally {
      setEditingName(false);
    }
  };

  const handleDeleteNotebook = async () => {
    if (!window.confirm(`Delete “${notebook.name}” and all its resources? This can't be undone.`)) return;
    try {
      await deleteNotebook(notebookId);
      toast.success("Notebook deleted.");
      navigate("/dashboard");
    } catch {
      toast.error("Couldn't delete the notebook.");
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-24">
          <Spinner label="Loading notebook…" />
        </div>
      </AppLayout>
    );
  }

  if (!notebook) {
    return (
      <AppLayout>
        <EmptyState title="Notebook not found" description="It may have been deleted." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-pine">
          <IoChevronBack size={15} /> All notebooks
        </Link>

        <div
          className="spine-tab mb-8 flex flex-wrap items-start justify-between gap-4"
          style={{ "--spine-color": notebook.color || "#2F5D50" }}
        >
          <div className="min-w-0">
            {editingName ? (
              <input
                className="input font-display text-2xl font-semibold"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={handleRenameSave}
                onKeyDown={(e) => e.key === "Enter" && handleRenameSave()}
                autoFocus
              />
            ) : (
              <h1
                className="group flex cursor-pointer items-center gap-2 font-display text-3xl font-semibold text-ink-700"
                onClick={() => setEditingName(true)}
              >
                {notebook.name}
                <IoPencilOutline size={16} className="text-ink-300 opacity-0 group-hover:opacity-100" />
              </h1>
            )}
            {notebook.description && <p className="mt-1.5 text-sm text-ink-500">{notebook.description}</p>}
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={handleDeleteNotebook}>
              Delete notebook
            </button>
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              <IoAddOutline size={18} /> Add resource
            </button>
          </div>
        </div>

        {documents.length === 0 ? (
          <EmptyState
            icon={<IoDocumentTextOutline />}
            title="No resources yet"
            description="Add PDFs to this notebook — lecture notes, past papers, references — and study them with AI Study Mode."
            action={
              <button className="btn-primary" onClick={() => setModalOpen(true)}>
                <IoAddOutline size={18} /> Add your first resource
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {documents.map((doc) => (
              <DocumentCard key={doc._id} document={doc} onDelete={handleDeleteDoc} />
            ))}
          </div>
        )}
      </div>

      <UploadDocumentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        notebookId={notebookId}
        onUploaded={handleUploaded}
      />
    </AppLayout>
  );
};

export default Notebook;

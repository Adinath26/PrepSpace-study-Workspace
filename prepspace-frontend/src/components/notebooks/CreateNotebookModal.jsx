import React, { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import { createNotebook } from "../../services/notebookService";

const COLORS = ["#2F5D50", "#C9A15A", "#B3423C", "#3E7A69", "#8890A0", "#A97F3C"];

const CreateNotebookModal = ({ open, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
    setColor(COLORS[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Give the notebook a name first.");
      return;
    }
    try {
      setSubmitting(true);
      const notebook = await createNotebook({ name: name.trim(), description: description.trim(), color });
      toast.success(`“${notebook.name}” notebook created.`);
      onCreated?.(notebook);
      reset();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't create the notebook. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="New notebook"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="create-notebook-form" className="btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create notebook"}
          </button>
        </>
      }
    >
      <form id="create-notebook-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="nb-name">Name</label>
          <input
            id="nb-name"
            className="input"
            placeholder="e.g. Operating Systems"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            maxLength={60}
          />
        </div>
        <div>
          <label className="label" htmlFor="nb-desc">Description (optional)</label>
          <textarea
            id="nb-desc"
            className="input min-h-[72px] resize-none"
            placeholder="What is this subject about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
          />
        </div>
        <div>
          <span className="label">Spine color</span>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full border-2 transition ${
                  color === c ? "border-ink-700 scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Choose color ${c}`}
              />
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateNotebookModal;

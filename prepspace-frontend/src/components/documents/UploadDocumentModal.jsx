import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { IoCloudUploadOutline, IoDocumentOutline, IoCloseCircle } from "react-icons/io5";
import Modal from "../common/Modal";
import { uploadDocument } from "../../services/documentService";

const MAX_SIZE_MB = 25;

const UploadDocumentModal = ({ open, onClose, notebookId, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setTitle("");
    setProgress(0);
    setUploading(false);
  };

  const acceptFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("PrepSpace currently studies PDF files only.");
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`That file is over ${MAX_SIZE_MB}MB. Try a smaller PDF.`);
      return;
    }
    setFile(f);
    setTitle((prev) => prev || f.name.replace(/\.pdf$/i, ""));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Choose a PDF to add first.");
      return;
    }
    try {
      setUploading(true);
      const doc = await uploadDocument({
        file,
        notebookId,
        title: title.trim() || file.name,
        onUploadProgress: setProgress,
      });
      toast.success("Resource added.");
      onUploaded?.(doc);
      reset();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed. Please try again.");
      setUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!uploading) {
          reset();
          onClose();
        }
      }}
      title="Add a resource"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button type="submit" form="upload-doc-form" className="btn-primary" disabled={uploading || !file}>
            {uploading ? `Uploading… ${progress}%` : "Add to notebook"}
          </button>
        </>
      }
    >
      <form id="upload-doc-form" onSubmit={handleSubmit} className="space-y-4">
        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl2 border-2 border-dashed px-6 py-10 text-center transition ${
              dragOver ? "border-pine bg-pine-50" : "border-line hover:border-pine-400"
            }`}
          >
            <IoCloudUploadOutline size={30} className="text-pine" />
            <p className="text-sm font-medium text-ink-700">Drop a PDF here, or click to browse</p>
            <p className="text-xs text-ink-300">PDF only · up to {MAX_SIZE_MB}MB</p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl2 border border-line bg-paper-100 p-3">
            <IoDocumentOutline size={24} className="shrink-0 text-pine" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-700">{file.name}</p>
              <p className="text-xs text-ink-300">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!uploading && (
              <button type="button" onClick={() => setFile(null)} aria-label="Remove file">
                <IoCloseCircle size={18} className="text-ink-300 hover:text-clay" />
              </button>
            )}
          </div>
        )}

        {file && (
          <div>
            <label className="label" htmlFor="doc-title">Title</label>
            <input
              id="doc-title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              disabled={uploading}
            />
          </div>
        )}

        {uploading && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-200">
            <div
              className="h-full rounded-full bg-pine transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </form>
    </Modal>
  );
};

export default UploadDocumentModal;

import React, { useState } from "react";
import { IoDownloadOutline, IoWarningOutline } from "react-icons/io5";
import { BASE_URL } from "../../utils/apiPaths";
import Spinner from "../common/Spinner";

// Resolves relative fileUrl values ("/uploads/x.pdf") against the API origin,
// while leaving fully-qualified URLs (e.g. S3/object storage links) untouched.
const resolveUrl = (fileUrl) => {
  if (!fileUrl) return null;
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${BASE_URL}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
};

const PdfViewer = ({ fileUrl, title }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = resolveUrl(fileUrl);

  if (!src) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-300">
        <IoWarningOutline size={28} />
        <p className="text-sm">This resource has no file to preview.</p>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-ink-500">
        <IoWarningOutline size={28} className="text-clay" />
        <p className="text-sm">The preview couldn't load in-browser.</p>
        <a href={src} target="_blank" rel="noreferrer" className="btn-secondary">
          <IoDownloadOutline size={16} /> Open PDF in a new tab
        </a>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-paper-200">
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center">
          <Spinner label="Loading document…" />
        </div>
      )}
      <object
        data={src}
        type="application/pdf"
        className="h-full w-full"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        aria-label={title}
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 text-ink-500">
          <p className="text-sm">Your browser can't preview PDFs inline.</p>
          <a href={src} target="_blank" rel="noreferrer" className="btn-secondary">
            <IoDownloadOutline size={16} /> Open PDF
          </a>
        </div>
      </object>
    </div>
  );
};

export default PdfViewer;

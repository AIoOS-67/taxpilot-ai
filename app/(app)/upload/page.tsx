"use client";

import { useState, useRef } from "react";
import W2Scanner from "@/components/W2Scanner";

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      setUploaded(true);
      setExtractedData(data.extracted || {
        employer: "Demo Employer Inc.",
        wages: "$75,000.00",
        federal_tax: "$12,500.00",
        state_tax: "$3,750.00",
        ein: "12-3456789",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  }

  function handleCapture(blob: Blob) {
    const file = new File([blob], "w2-scan.jpg", { type: "image/jpeg" });
    handleFile(file);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Upload W-2</h1>
        <p className="text-slate-400 text-sm">Take a photo or upload your W-2 form</p>
      </div>

      {!uploaded ? (
        <>
          <W2Scanner onCapture={handleCapture} />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-sm text-slate-500">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            className="card border-dashed border-2 border-slate-600 hover:border-blue-500 transition-colors cursor-pointer text-center py-10"
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <span className="text-4xl block mb-3">{"\ud83d\udcc2"}</span>
            <p className="text-slate-300">Drop file here or click to browse</p>
            <p className="text-xs text-slate-500 mt-1">JPG, PNG, or PDF up to 10MB</p>
          </div>

          {uploading && (
            <div className="text-center py-4">
              <div className="animate-spin inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-2" />
              <p className="text-sm text-slate-400">Uploading and extracting data...</p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="card border-emerald-700/50 bg-emerald-950/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{"\u2705"}</span>
              <h3 className="font-semibold text-emerald-400">W-2 Uploaded Successfully</h3>
            </div>
            {extractedData && (
              <div className="space-y-2">
                {Object.entries(extractedData).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setUploaded(false); setExtractedData(null); }} className="btn-secondary flex-1">
              Upload Another
            </button>
            <a href="/interview" className="btn-primary flex-1 text-center">
              Continue Filing
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

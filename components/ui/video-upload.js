"use client";

import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export function VideoUpload({ value, onChange, onRemove }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const uniqueId = useId();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onChange(data.file.path);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error uploading video");
      }
    } catch (error) {
      setError("Error uploading video: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <video src={value} controls className="h-full w-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 text-black"
            onClick={onRemove}
          >
            ×
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Upload a video</p>
          <input
            type="file"
            accept="video/*"
            onChange={handleUpload}
            className="hidden"
            id={uniqueId}
          />
          <Button
            type="button"
            variant="outline"
            className="mt-4 text-black"
            onClick={() => document.getElementById(uniqueId).click()}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Select Video"}
          </Button>
        </div>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

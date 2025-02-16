"use client";

import { useState } from "react";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, showErrorToast, showSuccessToast } from "@/lib/utils";
import { API } from "@/lib/axios";
import errorHandler from "@/lib/error-handler";

export type DocumentType =
  | "Bank Statement"
  | "Cancel Cheque"
  | "Bank Pass Book"
  | "Profile Picture";

export interface FileUpload {
  file: File;
  type: DocumentType;
  preview: string;
}

export default function UploadPage() {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [currentType, setCurrentType] =
    useState<DocumentType>("Bank Statement");
  const documentTypes: { value: DocumentType; label: string }[] = [
    { value: "Bank Statement", label: "Bank Statement" },
    { value: "Cancel Cheque", label: "Cancel Cheque" },
    { value: "Bank Pass Book", label: "Bank Pass Book" },
    { value: "Profile Picture", label: "Profile Picture" },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setUploads((prev) => [
        ...prev,
        {
          file,
          type: currentType,
          preview: base64String,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const removeUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Uploading files:", uploads);

    try {
      const formData = new FormData();
      formData.append("filename", uploads[0].type);
      formData.append("image", uploads[0].preview);
      const res = await API.post("/uploadFile", formData);
      showSuccessToast("File uploaded successfully");
      setUploads([]);
    } catch (error: any) {
      errorHandler(error);
    }
  };

  return (
    <div className="w-full rounded-xl glassmorphic-card shadow-2xl">
      <div className="relative w-fulll mx-auto  pb-10 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8  to-purple-100 mt-4">
          <Link
            href="/"
            className="rounded-full p-2 bg-white/40 backdrop-blur-md hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 " />
          </Link>
          <div className="px-4 py-2 rounded-full bg-white/50 backdrop-blur-md">
            <span className="text-black font-medium">Upload Document</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black">
                Document Type
              </label>
              <Select
                value={currentType}
                onValueChange={(value) => setCurrentType(value as DocumentType)}
              >
                <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-0 text-black">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label
                htmlFor="file-upload"
                className="block w-full rounded-lg border-2 border-purple-300 p-4 bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors cursor-pointer text-center"
              >
                <div
                  className={cn(
                    "flex flex-col items-center justify-center text-purple-900",
                    { "cursor-not-allowed opacity-50": uploads.length > 0 }
                  )}
                >
                  <Upload className="h-8 w-8 mb-2" />
                  <p className="text-sm font-medium">Tap to upload</p>
                  <p className="text-xs text-purple-800">PNG, JPG up to 1MB</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploads.length > 0}
                />
              </label>
            </div>

            {/* Uploaded Files Preview */}
            <div className="space-y-2">
              {uploads.map((upload, index) => (
                <div
                  key={index}
                  className="relative bg-white/50 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 overflow-hidden"
                >
                  <img
                    src={upload.preview}
                    alt={`Preview of ${upload.type}`}
                    className="h-12 w-12 object-cover rounded"
                  />
                  <div className="flex-1 max-w-[70%]">
                    <p className="text-sm font-medium text-black">
                      {upload.type}
                    </p>
                    <p className="text-xs text-black/60 w-[99%] overflow-x-scroll">
                      {upload.file.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeUpload(index)}
                    className="p-1 hover:bg-black/5 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-black" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          {uploads.length > 0 && (
            <button
              type="submit"
              className="w-full py-3 px-4 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition-colors"
            >
              Upload File
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

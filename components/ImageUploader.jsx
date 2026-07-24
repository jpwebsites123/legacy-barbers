"use client";

import { useState } from "react";
import axios from "axios";

export default function ImageUploader({ onUpload }) {
  const [loading, setLoading] = useState(false);

  async function uploadImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );

      onUpload(res.data.secure_url);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={uploadImage}
      />

      {loading && (
        <p className="text-yellow-400">
          Uploading...
        </p>
      )}
    </div>
  );
}
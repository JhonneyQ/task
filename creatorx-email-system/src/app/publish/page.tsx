"use client";

import { useState } from "react";

export default function PublishPage() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handlePublish() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "85629cc3-edfc-434a-962b-951e0121ed1d", // ⚡ replace with logged-in user id
          title,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage("❌ Error publishing video: " + data.error);
      } else {
        setMessage("✅ Video published! Congrats email will be sent 🎉");
        setTitle("");
      }
    } catch (err: any) {
      setMessage("❌ Error: " + err.message);
    }

    setLoading(false);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Publish Video</h1>

      <input
        type="text"
        placeholder="Video title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <button
        onClick={handlePublish}
        disabled={loading || !title}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Publishing..." : "Publish"}
      </button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}

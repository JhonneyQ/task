"use client";
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("");

  async function handleSend() {
    setStatus("Sending...");
    const res = await fetch("/api/test-send");
    const data = await res.json();
    if (res.ok) setStatus("✅ " + data.message);
    else setStatus("❌ " + data.error);
  }

  return (
    <main className="p-6">
      <button
        onClick={handleSend}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Send Test Email
      </button>
      <p>{status}</p>
    </main>
  );
}

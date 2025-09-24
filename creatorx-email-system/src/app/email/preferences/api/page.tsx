// src/app/email/preferences/page.tsx
"use client";

import { log } from "console";
import { useEffect, useState } from "react";

export default function PreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState("");

  // ⚡ replace with actual signed userId or parse from query (?u=...)
  const userId = "da36709c-5d0d-4ff7-af19-0adcd62e6188";

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/email/preferences?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setChecked(data.marketing_opt_in);
      }
      setLoading(false);
    }
    load();
  }, []);

  console.log(checked);
  
  

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    // if(checked === true){
    //     setChecked(false)
    // }else{
    //     setChecked(true)
    // }

    const res = await fetch(`/api/email/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, marketing_opt_in: checked }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Preferences updated");
    } else {
      setMessage("❌ Error: " + data.error);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Email Preferences</h1>
      <form onSubmit={handleSubmit}>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          Receive marketing emails
        </label>
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}

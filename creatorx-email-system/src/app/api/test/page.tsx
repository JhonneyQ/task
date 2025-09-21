"use client";

import { useState } from "react";

export default function TestPage() {
  const [userId, setUserId] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  async function createUser() {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test" + Date.now() + "@example.com",
        full_name: "Test User",
        timezone: "America/New_York",
      }),
    });
    const data = await res.json();
    setLogs((l) => [...l, "User response: " + JSON.stringify(data)]);
    if (data.profile?.id) setUserId(data.profile.id);
  }

  async function createProject() {
    if (!userId) return alert("No user yet");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        project_name: "My First Project",
      }),
    });
    const data = await res.json();
    setLogs((l) => [...l, "Project response: " + JSON.stringify(data)]);
  }

  async function publishVideo() {
    if (!userId) return alert("No user yet");
    const res = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        video_id: "vid_" + Date.now(),
      }),
    });
    const data = await res.json();
    setLogs((l) => [...l, "Publish response: " + JSON.stringify(data)]);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>API Test Page</h1>
      <button onClick={createUser}>Create User</button>
      <button onClick={createProject} disabled={!userId}>
        Create Project
      </button>
      <button onClick={publishVideo} disabled={!userId}>
        Publish Video
      </button>

      <h2>Logs</h2>
      <pre>{logs.join("\n")}</pre>
    </div>
  );
}

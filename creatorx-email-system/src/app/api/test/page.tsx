"use client";

import { useState } from "react";

export default function TestPage() {
  const [userId, setUserId] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  // async function createUser() {
  //   const res = await fetch("/api/users", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       email: "test" + Date.now() + "@example.com",
  //       full_name: "Test User",
  //       timezone: "America/New_York",
  //     }),
  //   });
  //   const data = await res.json();
  //   setLogs((l) => [...l, "User response: " + JSON.stringify(data)]);
  //   if (data.profile?.id) setUserId(data.profile.id);
  // }

  const id = "85629cc3-edfc-434a-962b-951e0121ed1d"; // 👈 replace with a real user ID from your `profiles` table

  async function createProject() {
    if (!id) return alert("No user yet");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: id,
        project_name: "My First Project",
      }),
    });
    const data = await res.json();
    setLogs((l) => [...l, "Project response: " + JSON.stringify(data)]);
  }

  async function publishVideo() {
    if (!id) return alert("No user yet");
    const res = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: id,
        video_id: "vid_" + Date.now(),
      }),
    });
    const data = await res.json();
    setLogs((l) => [...l, "Publish response: " + JSON.stringify(data)]);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>API Test Page</h1>
      {/* <button onClick={createUser}>Create User</button> */}
      <button onClick={createProject} disabled={!id}>
        Create Project
      </button>
      <button onClick={publishVideo} disabled={!id}>
        Publish Video
      </button>

      <h2>Logs</h2>
      <pre>{logs.join("\n")}</pre>
    </div>
  );
}

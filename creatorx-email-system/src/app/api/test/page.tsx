"use client";

import { useState } from "react";

export default function TestPage() {
  const [userId, setUserId] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  // form inputs
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [projectName, setProjectName] = useState("");
  const [videoId, setVideoId] = useState("");

  async function createUser() {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        full_name: fullName,
        timezone,
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
        project_name: projectName,
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
        video_id: videoId || "vid_" + Date.now(),
      }),
    });
    const data = await res.json();
    setLogs((l) => [...l, "Publish response: " + JSON.stringify(data)]);
  }

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h1>API Test Page</h1>

      <h2>Create User</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: "100%" }}
      />
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: "100%" }}
      />
      <input
        type="text"
        placeholder="Timezone (e.g. America/New_York)"
        value={timezone}
        onChange={(e) => setTimezone(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: "100%" }}
      />
      <button onClick={createUser}>Create User</button>

      <h2>Create Project</h2>
      <input
        type="text"
        placeholder="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: "100%" }}
      />
      <button onClick={createProject} disabled={!userId}>
        Create Project
      </button>

      <h2>Publish Video</h2>
      <input
        type="text"
        placeholder="Video ID (leave empty for auto)"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: "100%" }}
      />
      <button onClick={publishVideo} disabled={!userId}>
        Publish Video
      </button>

      <h2>Logs</h2>
      <pre
        style={{
          background: "#f4f4f4",
          padding: 10,
          borderRadius: 6,
          maxHeight: 300,
          overflow: "auto",
        }}
      >
        {logs.join("\n")}
      </pre>
    </div>
  );
}

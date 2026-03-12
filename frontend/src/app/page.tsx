"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Task = {
  id: number;
  title: string;
  done: boolean;
  created_at: string;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function fetchTasks() {
    try {
      const res = await fetch(`${API_URL}/api/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (mounted) fetchTasks(); }, [mounted]);

  async function createTask() {
    if (!title.trim()) return;
    await fetch(`${API_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setTitle("");
    fetchTasks();
  }

  async function toggleTask(task: Task) {
    await fetch(`${API_URL}/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    });
    fetchTasks();
  }

  async function deleteTask(id: number) {
    await fetch(`${API_URL}/api/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  }

  if (!mounted) return null;

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f5f5f5",
      display: "flex",
      justifyContent: "center",
      padding: "60px 20px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 560,
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 24,
          color: "#111",
          letterSpacing: "-0.5px",
        }}>
          Tasks
        </h1>

        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createTask()}
            placeholder="Add a new task..."
            style={{
              flex: 1,
              padding: "10px 14px",
              fontSize: 15,
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff",
              color: "#111",
              outline: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          />
          <button
            onClick={createTask}
            style={{
              padding: "10px 20px",
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 8,
              background: "#111",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            Add
          </button>
        </div>

        <div style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e5e5",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}>
          {loading && (
            <p style={{ padding: "20px 16px", color: "#888", fontSize: 14 }}>Loading...</p>
          )}

          {!loading && tasks.length === 0 && (
            <p style={{ padding: "20px 16px", color: "#888", fontSize: 14 }}>No tasks yet.</p>
          )}

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {tasks.map((task, index) => (
              <li
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderBottom: index < tasks.length - 1 ? "1px solid #f0f0f0" : "none",
                  transition: "background 0.1s",
                }}
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task)}
                  style={{ width: 17, height: 17, cursor: "pointer", accentColor: "#111" }}
                />
                <span style={{
                  flex: 1,
                  fontSize: 15,
                  color: task.done ? "#aaa" : "#111",
                  textDecoration: task.done ? "line-through" : "none",
                }}>
                  {task.title}
                </span>
                <span style={{ fontSize: 12, color: "#bbb", marginRight: 8 }}>
                  {new Date(task.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ccc",
                    cursor: "pointer",
                    fontSize: 20,
                    lineHeight: 1,
                    padding: "0 4px",
                    borderRadius: 4,
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

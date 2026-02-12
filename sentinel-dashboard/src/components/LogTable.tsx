"use client";

import { useEffect, useState } from "react";

interface LogEntry {
  id: string;
  timestamp: string | Date;
  event?: string;
  activity?: string;
  severity?: string;
  level?: string;
}

export default function LogTable() {
  const [logs, setLogs] = useState<LogEntry[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch("/api/logs?page=1&limit=10");
        if (!response.ok) throw new Error("Unauthorized or Server Error");
        const data = await response.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Sentinel Log Fetch Error:", err);
        setLogs([]); // Set to empty array to trigger the "No logs" fallback instead of crashing
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/30">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-sm">
            <th className="p-4 font-medium">Timestamp</th>
            <th className="p-4 font-medium">Event</th>
            <th className="p-4 font-medium">Severity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {Array.isArray(logs) && logs.length > 0 ? (
            logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-800/40 transition-colors">
                <td className="p-4 text-sm text-gray-300">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="p-4 text-sm text-white">
                  {log.event || log.activity || "System Event"}
                </td>
                <td className="p-4 text-sm text-blue-400 font-bold uppercase">
                  {log.severity || log.level || "INFO"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="p-8 text-center text-gray-500 italic">
                {logs === undefined ? "Initializing secure connection..." : "No logs available or access denied."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

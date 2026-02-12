"use client";

import { useEffect, useState } from "react";

interface LogEntry {
  id: string;
  timestamp: string | Date;
  event?: string;    // Common Prisma field
  activity?: string; // Fallback from your Activity Summarizer project
  message?: string;  // General fallback
  severity?: string; // Common field
  level?: string;    // Fallback for logging levels
}

export default function LogTable() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch("/api/logs?page=1&limit=10");
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error("Failed to fetch Sentinel logs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  if (loading) return <div className="text-gray-500 animate-pulse p-4">Loading encrypted logs...</div>;

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
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-800/40 transition-colors">
              <td className="p-4 text-sm text-gray-300">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="p-4 text-sm text-white">
                {/* Checks multiple possible field names from your Prisma schema */}
                {log.event || log.activity || log.message || "N/A"}
              </td>
              <td className="p-4 text-sm">
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                  (log.severity || log.level)?.toLowerCase() === 'critical' ? 'bg-red-500/20 text-red-400' :
                  (log.severity || log.level)?.toLowerCase() === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {(log.severity || log.level) || "INFO"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
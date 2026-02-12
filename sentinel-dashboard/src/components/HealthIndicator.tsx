"use client";
import React, { useState, useEffect } from "react";

export default function HealthIndicator() {
  const [status, setStatus] = useState("Checking...");
  const [isHealthy, setIsHealthy] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setStatus(data.status);
        setIsHealthy(data.status === "Healthy");
      } catch (err) {
        setStatus("Offline");
        setIsHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-700 w-fit">
      <div className={`w-3 h-3 rounded-full ${isHealthy ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"}`} />
      <span className="text-sm font-medium text-gray-200">System: {status}</span>
    </div>
  );
}

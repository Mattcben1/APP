import React, { useEffect, useState } from "react";

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchEvents() {
    setLoading(true);
    const res = await fetch("./mock-events.json");
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">
          UVA + Charlottesville Events
        </h1>
        <button
          onClick={fetchEvents}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </header>

      {loading && <p>Loading events...</p>}

      <div className="space-y-4">
        {events.map((e, i) => (
          <div key={i} className="p-4 bg-white rounded-md shadow">
            <h2 className="font-semibold text-lg">{e.name}</h2>
            <p className="text-sm text-gray-500">Source: {e.source}</p>
            <p className="mt-2 text-gray-700">{e.summary}</p>
            <a
              href={e.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 text-sm mt-1 inline-block"
            >
              Visit event page →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

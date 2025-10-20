import React, { useEffect, useState } from "react";

export default function App() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filter, setFilter] = useState("upcoming");
  const [loading, setLoading] = useState(true);

  async function fetchEvents() {
    setLoading(true);
    const res = await fetch("./mock-events.json");
    const data = await res.json();

    const sorted = (data.events || []).sort(
      (a, b) => new Date(a.datetime) - new Date(b.datetime)
    );

    setEvents(sorted);
    setLoading(false);
  }

  function applyFilter(type) {
    const now = new Date();
    if (type === "today") {
      const todayEvents = events.filter((e) => {
        const date = new Date(e.datetime);
        return (
          date.getDate() === now.getDate() &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      });
      setFilteredEvents(todayEvents);
    } else if (type === "upcoming") {
      const upcoming = events.filter((e) => new Date(e.datetime) >= now);
      setFilteredEvents(upcoming);
    } else if (type === "past") {
      const past = events.filter((e) => new Date(e.datetime) < now);
      setFilteredEvents(past.reverse());
    }
    setFilter(type);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilter("upcoming");
  }, [events]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-800 text-gray-100 font-sans">
      <div className="max-w-5xl mx-auto py-10 px-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400 mb-3 sm:mb-0">
            UVA & Charlottesville Events
          </h1>
          <button
            onClick={fetchEvents}
            className="px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition"
          >
            Refresh
          </button>
        </header>

        {/* Subtitle */}
        <p className="text-gray-400 mb-6 text-sm sm:text-base">
          Explore upcoming activities, community gatherings, and student events happening on Grounds and around Charlottesville.
        </p>

        {/* Filter Bar */}
        <div className="flex justify-center gap-4 mb-6">
          {["today", "upcoming", "past"].map((tab) => (
            <button
              key={tab}
              onClick={() => applyFilter(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === tab
                  ? "bg-yellow-500 text-gray-900"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Event List */}
        <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {loading && <p className="text-gray-400">Loading events...</p>}
          {!loading && filteredEvents.length === 0 && (
            <p className="text-gray-400 text-center italic">
              No events fou

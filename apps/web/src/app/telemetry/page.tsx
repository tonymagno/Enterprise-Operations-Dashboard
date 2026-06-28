"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import axios from "axios";

interface TelemetryEvent {
  id: number;
  event_type: string;
  source: string;
  severity: string;
}

const PAGE_SIZE = 8;

const SEVERITY_COLORS: Record<string, string> = {
  low:    "bg-slate-500/10 text-slate-400 border-slate-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  high:   "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function TelemetryPage() {
  const [events,       setEvents]       = useState<TelemetryEvent[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [editingEvent, setEditingEvent] = useState<TelemetryEvent | null>(null);
  const [form, setForm] = useState({ event_type: "", source: "", severity: "medium" });

  // ── Filtros ───────────────────────────────────────
  const [search,         setSearch]         = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [currentPage,    setCurrentPage]    = useState(1);

  useEffect(() => { loadEvents(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, filterSeverity]);

  async function loadEvents() {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await axios.get("http://localhost:8000/telemetry/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Erro ao carregar telemetria:", error);
    } finally {
      setLoading(false);
    }
  }

  // ── Filtros + paginação ───────────────────────────
  const filtered = events.filter((e) => {
    const matchSearch   = search === "" ||
      e.event_type.toLowerCase().includes(search.toLowerCase()) ||
      e.source.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = filterSeverity === "" || e.severity === filterSeverity;
    return matchSearch && matchSeverity;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = search !== "" || filterSeverity !== "";

  function clearFilters() { setSearch(""); setFilterSeverity(""); }

  // ── Modal ─────────────────────────────────────────
  function openCreateModal() {
    setEditingEvent(null);
    setForm({ event_type: "", source: "", severity: "medium" });
    setShowModal(true);
  }

  function openEditModal(event: TelemetryEvent) {
    setEditingEvent(event);
    setForm({ event_type: event.event_type, source: event.source, severity: event.severity });
    setShowModal(true);
  }

  async function handleSave() {
    try {
      const token = localStorage.getItem("access_token");
      if (editingEvent) {
        await axios.put(`http://localhost:8000/telemetry/${editingEvent.id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("http://localhost:8000/telemetry/", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowModal(false);
      setEditingEvent(null);
      setForm({ event_type: "", source: "", severity: "medium" });
      loadEvents();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      alert("Erro ao salvar evento.");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Deseja realmente excluir este evento?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`http://localhost:8000/telemetry/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadEvents();
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      alert("Erro ao excluir evento.");
    }
  }

  return (
    <div className="p-8 text-white">

      {/* ── Cabeçalho ── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Telemetria</h1>
          <p className="text-slate-400 text-sm mt-1">
            {filtered.length} de {events.length} evento{events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openCreateModal} className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium">
          Novo Evento
        </button>
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por tipo ou origem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 transition"
          />
        </div>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 transition"
        >
          <option value="">Todas as severidades</option>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>

        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition">
            <X size={14} /> Limpar
          </button>
        )}
      </div>

      {/* ── Tabela ── */}
      <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700">
        <table className="w-full">
          <thead className="bg-slate-700/80">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-slate-300">ID</th>
              <th className="p-4 text-left text-sm font-semibold text-slate-300">Tipo</th>
              <th className="p-4 text-left text-sm font-semibold text-slate-300">Origem</th>
              <th className="p-4 text-left text-sm font-semibold text-slate-300">Severidade</th>
              <th className="p-4 text-center text-sm font-semibold text-slate-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400">Carregando...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400">
                {hasFilters ? "Nenhum evento encontrado para os filtros aplicados." : "Nenhum evento encontrado."}
              </td></tr>
            ) : (
              paginated.map((event) => (
                <tr key={event.id} className="border-t border-slate-700 hover:bg-slate-700/30 transition">
                  <td className="p-4 text-slate-400 text-sm">{event.id}</td>
                  <td className="p-4 font-medium">{event.event_type}</td>
                  <td className="p-4 text-slate-300">{event.source}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${SEVERITY_COLORS[event.severity] ?? SEVERITY_COLORS.medium}`}>
                      {event.severity === "low" ? "Baixa" : event.severity === "medium" ? "Média" : "Alta"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => openEditModal(event)} className="text-yellow-400 mr-4 hover:text-yellow-300 text-sm font-medium transition">Editar</button>
                    <button onClick={() => handleDelete(event.id)} className="text-red-400 hover:text-red-300 text-sm font-medium transition">Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Paginação ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-slate-400 text-sm">
            Página {currentPage} de {totalPages} — {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
              ← Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p); return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`e-${idx}`} className="px-3 py-2 text-slate-500 text-sm">...</span>
                ) : (
                  <button key={p} onClick={() => setCurrentPage(p as number)}
                    className={`px-4 py-2 rounded-lg text-sm border transition ${currentPage === p ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-800 border-slate-700 hover:bg-slate-700"}`}>
                    {p}
                  </button>
                )
              )}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
              Próxima →
            </button>
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 px-4">
          <div className="bg-slate-800 p-8 rounded-xl w-full max-w-md shadow-2xl border border-slate-700">
            <h2 className="text-2xl font-bold mb-6">
              {editingEvent ? "Editar Evento" : "Novo Evento"}
            </h2>
            <div className="space-y-4">
              <input
                className="w-full p-3 bg-slate-700 rounded-lg outline-none border border-slate-600 focus:border-blue-500 transition"
                placeholder="Tipo do Evento"
                value={form.event_type}
                onChange={(e) => setForm({ ...form, event_type: e.target.value })}
              />
              <input
                className="w-full p-3 bg-slate-700 rounded-lg outline-none border border-slate-600 focus:border-blue-500 transition"
                placeholder="Origem"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              />
              <select
                className="w-full p-3 bg-slate-700 rounded-lg outline-none border border-slate-600 focus:border-blue-500 transition"
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition">Cancelar</button>
              <button onClick={handleSave} className="px-5 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
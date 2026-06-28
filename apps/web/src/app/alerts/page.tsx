"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import axios from "axios";

interface Alert {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
}

const PAGE_SIZE = 8;

const SEVERITY_COLORS: Record<string, string> = {
  low:      "bg-slate-500/10 text-slate-400 border-slate-500/20",
  medium:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  high:     "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-green-500/10 text-green-400 border-green-500/20",
  resolved: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function AlertsPage() {
  const [alerts,      setAlerts]      = useState<Alert[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editingAlert,setEditingAlert]= useState<Alert | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", severity: "medium", status: "active",
  });

  // ── Filtros ───────────────────────────────────────
  const [search,          setSearch]          = useState("");
  const [filterSeverity,  setFilterSeverity]  = useState("");
  const [filterStatus,    setFilterStatus]    = useState("");
  const [currentPage,     setCurrentPage]     = useState(1);

  useEffect(() => { loadAlerts(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, filterSeverity, filterStatus]);

  async function loadAlerts() {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("http://localhost:8000/alerts/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(response.data);
    } catch (error) {
      console.error("Erro ao carregar alertas:", error);
    } finally {
      setLoading(false);
    }
  }

  // ── Filtros + paginação ───────────────────────────
  const filtered = alerts.filter((a) => {
    const matchSearch   = search === "" || a.title.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = filterSeverity === "" || a.severity === filterSeverity;
    const matchStatus   = filterStatus === "" || a.status === filterStatus;
    return matchSearch && matchSeverity && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = search !== "" || filterSeverity !== "" || filterStatus !== "";

  function clearFilters() {
    setSearch(""); setFilterSeverity(""); setFilterStatus("");
  }

  // ── Modal ─────────────────────────────────────────
  function openCreateModal() {
    setEditingAlert(null);
    setForm({ title: "", description: "", severity: "medium", status: "active" });
    setShowModal(true);
  }

  function openEditModal(alert: Alert) {
    setEditingAlert(alert);
    setForm({ title: alert.title, description: alert.description, severity: alert.severity, status: alert.status });
    setShowModal(true);
  }

  async function saveAlert() {
    try {
      const token = localStorage.getItem("access_token");
      const payload = { title: form.title, description: form.description, severity: form.severity, status: form.status };

      if (editingAlert) {
        await axios.put(`http://localhost:8000/alerts/${editingAlert.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("http://localhost:8000/alerts/", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowModal(false);
      loadAlerts();
    } catch (error) {
      console.error("Erro ao salvar alerta:", error);
      alert("Erro ao salvar alerta.");
    }
  }

  async function deleteAlert(id: number) {
    if (!confirm("Deseja realmente excluir este alerta?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`http://localhost:8000/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadAlerts();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir alerta.");
    }
  }

  return (
    <div className="p-8 text-white">

      {/* ── Cabeçalho ── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Alertas</h1>
          <p className="text-slate-400 text-sm mt-1">
            {filtered.length} de {alerts.length} alerta{alerts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openCreateModal} className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium">
          Novo Alerta
        </button>
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título..."
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
          <option value="critical">Crítica</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 transition"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="resolved">Resolvido</option>
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
              <th className="p-4 text-left text-sm font-semibold text-slate-300">Título</th>
              <th className="p-4 text-left text-sm font-semibold text-slate-300">Severidade</th>
              <th className="p-4 text-left text-sm font-semibold text-slate-300">Status</th>
              <th className="p-4 text-center text-sm font-semibold text-slate-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400">Carregando...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400">
                {hasFilters ? "Nenhum alerta encontrado para os filtros aplicados." : "Nenhum alerta encontrado."}
              </td></tr>
            ) : (
              paginated.map((alertItem) => (
                <tr key={alertItem.id} className="border-t border-slate-700 hover:bg-slate-700/30 transition">
                  <td className="p-4 text-slate-400 text-sm">{alertItem.id}</td>
                  <td className="p-4 font-medium">{alertItem.title}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${SEVERITY_COLORS[alertItem.severity] ?? SEVERITY_COLORS.medium}`}>
                      {alertItem.severity === "low" ? "Baixa" : alertItem.severity === "medium" ? "Média" : alertItem.severity === "high" ? "Alta" : "Crítica"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[alertItem.status] ?? ""}`}>
                      {alertItem.status === "active" ? "Ativo" : "Resolvido"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => openEditModal(alertItem)} className="text-yellow-400 mr-4 hover:text-yellow-300 text-sm font-medium transition">Editar</button>
                    <button onClick={() => deleteAlert(alertItem.id)} className="text-red-400 hover:text-red-300 text-sm font-medium transition">Excluir</button>
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
              {editingAlert ? "Editar Alerta" : "Novo Alerta"}
            </h2>
            <div className="space-y-4">
              <input className="w-full p-3 bg-slate-700 rounded-lg outline-none border border-slate-600 focus:border-blue-500 transition" placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <textarea className="w-full p-3 bg-slate-700 rounded-lg outline-none border border-slate-600 focus:border-blue-500 transition resize-none" placeholder="Descrição" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <select className="w-full p-3 bg-slate-700 rounded-lg outline-none border border-slate-600 focus:border-blue-500 transition" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
              <select className="w-full p-3 bg-slate-700 rounded-lg outline-none border border-slate-600 focus:border-blue-500 transition" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Ativo</option>
                <option value="resolved">Resolvido</option>
              </select>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition">Cancelar</button>
              <button onClick={saveAlert} className="px-5 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
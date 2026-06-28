"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface RoleFormData {
  name: string;
  description: string;
}

const initialFormData: RoleFormData = { name: "", description: "" };

const PAGE_SIZE = 8;

const ROLE_LABELS: Record<string, string> = {
  admin:    "Administrador",
  manager:  "Gerente",
  analyst:  "Analista",
  operator: "Operador",
};

function getRoleLabel(name: string): string {
  return ROLE_LABELS[name] ?? name;
}

export default function RolesPage() {
  const [roles,      setRoles]      = useState<Role[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editingId,  setEditingId]  = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData,   setFormData]   = useState<RoleFormData>(initialFormData);

  // ── Filtros ───────────────────────────────────────
  const [search,      setSearch]      = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { loadRoles(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search]);

  async function loadRoles() {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://127.0.0.1:8000/roles/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data = await response.json();
      const normalized = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
      setRoles(normalized);
    } catch (error) {
      console.error("Erro ao carregar roles:", error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }

  // ── Filtros + paginação ───────────────────────────
  const filtered = roles.filter((r) =>
    search === "" ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = search !== "";

  // ── Modal ─────────────────────────────────────────
  function openCreateModal() {
    setEditingId(null);
    setFormData(initialFormData);
    setShowModal(true);
  }

  function openEditModal(role: Role) {
    setEditingId(role.id);
    setFormData({ name: role.name, description: role.description ?? "" });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormData);
  }

  async function saveRole() {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Não autenticado");

      const isEditing = editingId !== null;
      const payload: Record<string, unknown> = { name: formData.name };
      if (formData.description.trim()) payload.description = formData.description;

      const response = await fetch(
        isEditing ? `http://127.0.0.1:8000/roles/${editingId}` : "http://127.0.0.1:8000/roles/",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Erro ${response.status}`);
      }

      await loadRoles();
      closeModal();
    } catch (error) {
      console.error("Erro ao salvar role:", error);
      alert("Erro ao salvar perfil.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteRole(id: number) {
    if (!window.confirm("Deseja excluir este perfil?")) return;
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://127.0.0.1:8000/roles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      await loadRoles();
    } catch (error) {
      console.error("Erro ao excluir role:", error);
      alert("Erro ao excluir perfil.");
    }
  }

  return (
    <AuthGuard>
      <div className="p-8 text-white">

        {/* ── Cabeçalho ── */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Perfis</h1>
            <p className="text-slate-400 text-sm mt-1">
              {filtered.length} de {roles.length} perfil{roles.length !== 1 ? "is" : ""}
            </p>
          </div>
          <button onClick={openCreateModal} className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium">
            Novo Perfil
          </button>
        </div>

        {/* ── Filtros ── */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 transition"
            />
          </div>

          {hasFilters && (
            <button onClick={() => setSearch("")} className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition">
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
                <th className="p-4 text-left text-sm font-semibold text-slate-300">Nome</th>
                <th className="p-4 text-left text-sm font-semibold text-slate-300">Label</th>
                <th className="p-4 text-left text-sm font-semibold text-slate-300">Descrição</th>
                <th className="p-4 text-center text-sm font-semibold text-slate-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400">Carregando...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400">
                  {hasFilters ? "Nenhum perfil encontrado para os filtros aplicados." : "Nenhum perfil encontrado."}
                </td></tr>
              ) : (
                paginated.map((role) => (
                  <tr key={role.id} className="border-t border-slate-700 hover:bg-slate-700/30 transition">
                    <td className="p-4 text-slate-400 text-sm">{role.id}</td>
                    <td className="p-4">
                      <span className="bg-slate-700 px-3 py-1 rounded-full text-sm font-mono">
                        {role.name}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{getRoleLabel(role.name)}</td>
                    <td className="p-4 text-slate-400 text-sm">{role.description ?? "—"}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => openEditModal(role)} className="text-yellow-400 mr-4 hover:text-yellow-300 text-sm font-medium transition">Editar</button>
                      <button onClick={() => deleteRole(role.id)} className="text-red-400 hover:text-red-300 text-sm font-medium transition">Excluir</button>
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
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-slate-800 p-8 rounded-xl w-full max-w-md shadow-2xl border border-slate-700">
              <h2 className="text-2xl font-bold mb-6">
                {editingId ? "Editar Perfil" : "Novo Perfil"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Nome (identificador interno)</label>
                  <input
                    type="text"
                    placeholder="ex: admin, manager, analyst"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 rounded-lg bg-slate-700 outline-none border border-slate-600 focus:border-blue-500 transition font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Descrição (opcional)</label>
                  <input
                    type="text"
                    placeholder="Descrição do perfil"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 rounded-lg bg-slate-700 outline-none border border-slate-600 focus:border-blue-500 transition"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button onClick={closeModal} className="px-5 py-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition" type="button">Cancelar</button>
                <button onClick={saveRole} disabled={submitting} className="px-5 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition" type="button">
                  {submitting ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
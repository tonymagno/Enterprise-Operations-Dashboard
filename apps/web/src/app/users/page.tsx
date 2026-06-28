"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  is_active?: boolean;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role_id: number;
  is_active: boolean;
}

const initialFormData = (roleId: number): UserFormData => ({
  name: "",
  email: "",
  password: "",
  role_id: roleId,
  is_active: true,
});

const PAGE_SIZE = 8;

export default function UsersPage() {
  const [users,         setUsers]         = useState<User[]>([]);
  const [roles,         setRoles]         = useState<Role[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [showModal,     setShowModal]     = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [formData,      setFormData]      = useState<UserFormData>(initialFormData(1));

  // ── Filtros ────────────────────────────────────────
  const [search,       setSearch]       = useState("");
  const [filterRole,   setFilterRole]   = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<"" | "active" | "inactive">("");
  const [currentPage,  setCurrentPage]  = useState(1);

  useEffect(() => { loadData(); }, []);

  // Reset página ao mudar filtros
  useEffect(() => { setCurrentPage(1); }, [search, filterRole, filterStatus]);

  async function loadData() {
    setLoading(true);
    try {
      await Promise.allSettled([loadUsers(), loadRoles()]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Usuário não autenticado");

      const response = await fetch("http://127.0.0.1:8000/users?page=1&limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Erro: ${response.status}`);

      const data = await response.json();
      const normalized = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
      setUsers(normalized);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setUsers([]);
    }
  }

  async function loadRoles() {
    try {
      const response = await fetch("http://127.0.0.1:8000/roles/");
      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
      const data = await response.json();
      const normalized = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
      setRoles(normalized);
      if (normalized.length > 0) {
        setFormData((prev) => ({ ...prev, role_id: normalized[0].id }));
      }
    } catch (error) {
      console.error("Erro ao carregar roles:", error);
      setRoles([]);
    }
  }

  function getRoleLabel(roleName: string) {
    const map: Record<string, string> = {
      admin: "Administrador", manager: "Gerente",
      analyst: "Analista",   operator: "Operador",
    };
    return map[roleName] ?? roleName;
  }

  function getUserRoleLabel(roleId: number) {
    const role = roles.find((r) => r.id === roleId);
    return role ? getRoleLabel(role.name) : String(roleId);
  }

  // ── Filtros + paginação ────────────────────────────
  const filtered = users.filter((user) => {
    const matchSearch =
      search === "" ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchRole = filterRole === "" || user.role_id === filterRole;

    const matchStatus =
      filterStatus === "" ||
      (filterStatus === "active"
        ? user.is_active !== false
        : user.is_active === false);

    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const hasFilters = search !== "" || filterRole !== "" || filterStatus !== "";

  function clearFilters() {
    setSearch("");
    setFilterRole("");
    setFilterStatus("");
  }

  // ── Modal ──────────────────────────────────────────
  function openCreateModal() {
    setEditingUserId(null);
    setFormData(initialFormData(roles[0]?.id ?? 1));
    setShowModal(true);
  }

  function openEditModal(user: User) {
    setEditingUserId(user.id);
    setFormData({
      name: user.name, email: user.email, password: "",
      role_id: user.role_id, is_active: user.is_active ?? true,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingUserId(null);
    setFormData(initialFormData(roles[0]?.id ?? 1));
  }

  async function saveUser() {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Usuário não autenticado");

      const isEditing = editingUserId !== null;
      const payload: Record<string, unknown> = {
        name: formData.name, email: formData.email, role_id: formData.role_id,
      };
      if (formData.password.trim()) payload.password = formData.password;
      if (isEditing) payload.is_active = formData.is_active;

      const response = await fetch(
        isEditing ? `http://127.0.0.1:8000/users/${editingUserId}` : "http://127.0.0.1:8000/users",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erro: ${response.status}`);
      }

      await loadData();
      closeModal();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      alert("Erro ao salvar usuário.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteUser(userId: number) {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Usuário não autenticado");

      const response = await fetch(`http://127.0.0.1:8000/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      await loadUsers();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      alert("Erro ao excluir usuário.");
    }
  }

  return (
    <div className="p-8 text-white">

      {/* ── Cabeçalho ── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Usuários</h1>
          <p className="text-slate-400 text-sm mt-1">
            {filtered.length} de {users.length} usuário{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Novo Usuário
        </button>
      </div>

      {/* ── Barra de filtros ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Busca */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Filtro por perfil */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value === "" ? "" : Number(e.target.value))}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 transition"
        >
          <option value="">Todos os perfis</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {getRoleLabel(role.name)}
            </option>
          ))}
        </select>

        {/* Filtro por status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "" | "active" | "inactive")}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 transition"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>

        {/* Limpar filtros */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition"
          >
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
              <th className="p-4 text-left text-sm font-semibold text-slate-300">Email</th>
              <th className="p-4 text-left text-sm font-semibold text-slate-300">Perfil</th>
              <th className="p-4 text-left text-sm font-semibold text-slate-300">Status</th>
              <th className="p-4 text-center text-sm font-semibold text-slate-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-slate-400">
                  Carregando...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-slate-400">
                  {hasFilters ? "Nenhum usuário encontrado para os filtros aplicados." : "Nenhum usuário encontrado."}
                </td>
              </tr>
            ) : (
              paginated.map((user) => (
                <tr key={user.id} className="border-t border-slate-700 hover:bg-slate-700/30 transition">
                  <td className="p-4 text-slate-400 text-sm">{user.id}</td>
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-slate-300">{user.email}</td>
                  <td className="p-4">
                    <span className="bg-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                      {getUserRoleLabel(user.role_id)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.is_active === false
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-green-500/10 text-green-400 border border-green-500/20"
                    }`}>
                      {user.is_active === false ? "Inativo" : "Ativo"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-yellow-400 mr-4 hover:text-yellow-300 text-sm font-medium transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium transition"
                    >
                      Excluir
                    </button>
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
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Anterior
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-3 py-2 text-slate-500 text-sm">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`px-4 py-2 rounded-lg text-sm border transition ${
                      currentPage === p
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
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
              {editingUserId ? "Editar Usuário" : "Novo Usuário"}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 rounded-lg bg-slate-700 outline-none border border-slate-600 focus:border-blue-500 transition"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 rounded-lg bg-slate-700 outline-none border border-slate-600 focus:border-blue-500 transition"
              />
              <input
                type="password"
                placeholder={editingUserId ? "Senha (opcional)" : "Senha"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 rounded-lg bg-slate-700 outline-none border border-slate-600 focus:border-blue-500 transition"
              />
              <select
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                className="w-full p-3 rounded-lg bg-slate-700 outline-none border border-slate-600 focus:border-blue-500 transition"
              >
                {roles.length === 0 ? (
                  <option value={1}>Carregando perfis...</option>
                ) : (
                  roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {getRoleLabel(role.name)}
                    </option>
                  ))
                )}
              </select>
              {editingUserId && (
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Usuário ativo
                </label>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button onClick={closeModal} className="px-5 py-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition" type="button">
                Cancelar
              </button>
              <button
                onClick={saveUser}
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition"
                type="button"
              >
                {submitting ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
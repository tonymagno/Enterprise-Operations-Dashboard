"use client";

import { useEffect, useState } from "react";
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

const initialFormData: RoleFormData = {
  name: "",
  description: "",
};

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
  const [roles, setRoles]           = useState<Role[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData]     = useState<RoleFormData>(initialFormData);

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://127.0.0.1:8000/roles/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data = await response.json();
      const normalized = Array.isArray(data)
        ? data
        : data?.items ?? data?.data ?? [];
      setRoles(normalized);
    } catch (error) {
      console.error("Erro ao carregar roles:", error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setFormData(initialFormData);
    setShowModal(true);
  }

  function openEditModal(role: Role) {
    setEditingId(role.id);
    setFormData({
      name:        role.name,
      description: role.description ?? "",
    });
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
      const payload: Record<string, unknown> = {
        name: formData.name,
      };
      if (formData.description.trim()) {
        payload.description = formData.description;
      }

      const response = await fetch(
        isEditing
          ? `http://127.0.0.1:8000/roles/${editingId}`
          : "http://127.0.0.1:8000/roles/",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Perfis</h1>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700 transition"
          >
            Novo Perfil
          </button>
        </div>

        {/* Tabela */}
        <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Nome</th>
                <th className="p-4 text-left">Label</th>
                <th className="p-4 text-left">Descrição</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Carregando...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Nenhum perfil encontrado
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr
                    key={role.id}
                    className="border-t border-slate-700 hover:bg-slate-700/30"
                  >
                    <td className="p-4">{role.id}</td>
                    <td className="p-4">
                      <span className="bg-slate-700 px-3 py-1 rounded-full text-sm font-mono">
                        {role.name}
                      </span>
                    </td>
                    <td className="p-4">{getRoleLabel(role.name)}</td>
                    <td className="p-4 text-slate-400">
                      {role.description ?? "—"}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openEditModal(role)}
                        className="text-yellow-400 mr-4 hover:text-yellow-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteRole(role.id)}
                        className="text-red-400 hover:text-red-300"
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-slate-800 p-8 rounded-lg w-full max-w-md shadow-2xl">
              <h2 className="text-3xl font-bold mb-6">
                {editingId ? "Editar Perfil" : "Novo Perfil"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">
                    Nome (identificador interno)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: admin, manager, analyst"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full p-3 rounded bg-slate-700 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-1 block">
                    Descrição (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Descrição do perfil"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-3 rounded bg-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={closeModal}
                  className="px-5 py-2 bg-gray-600 rounded hover:bg-gray-500"
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveRole}
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
                  type="button"
                >
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
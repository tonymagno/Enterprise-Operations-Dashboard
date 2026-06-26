"use client";

import { useEffect, useState } from "react";

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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<UserFormData>(
    initialFormData(1)
  );

  useEffect(() => {
    loadData();
  }, []);

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

      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      const response = await fetch(
        "http://127.0.0.1:8000/users?page=1&limit=20",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erro ao carregar usuários: ${response.status}`
        );
      }

      const data = await response.json();

      console.log("API USERS =>", data);

      const normalizedUsers = Array.isArray(data)
        ? data
        : data?.items ?? data?.data ?? [];

      setUsers(normalizedUsers);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setUsers([]);
    }
  }

  async function loadRoles() {
    try {
      console.log("Iniciando carregamento das roles...");

      const response = await fetch(
        "http://127.0.0.1:8000/roles/"
      );

      console.log("Status Roles:", response.status);

      if (!response.ok) {
        throw new Error(
          `Erro HTTP ${response.status}`
        );
      }

      const data = await response.json();

      console.log("ROLES RECEBIDAS =>", data);

      const normalizedRoles = Array.isArray(data)
        ? data
        : data?.items ?? data?.data ?? [];

      setRoles(normalizedRoles);

      if (normalizedRoles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          role_id: normalizedRoles[0].id,
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar roles:", error);
      setRoles([]);
    }
  }

  function getRoleLabel(roleName: string) {
    switch (roleName) {
      case "admin":
        return "Administrador";
      case "manager":
        return "Gerente";
      case "analyst":
        return "Analista";
      case "operator":
        return "Operador";
      default:
        return roleName;
    }
  }

  function getUserRoleLabel(roleId: number) {
    const role = roles.find((r) => r.id === roleId);

    if (!role) {
      return String(roleId);
    }

    return getRoleLabel(role.name);
  }

  function openCreateModal() {
    setEditingUserId(null);

    setFormData(
      initialFormData(roles[0]?.id ?? 1)
    );

    setShowModal(true);
  }

  function openEditModal(user: User) {
    setEditingUserId(user.id);

    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role_id: user.role_id,
      is_active: user.is_active ?? true,
    });

    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingUserId(null);
    setFormData(
      initialFormData(roles[0]?.id ?? 1)
    );
  }

  async function saveUser() {
    try {
      setSubmitting(true);

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      const isEditing = editingUserId !== null;

      const payload: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        role_id: formData.role_id,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      if (isEditing) {
        payload.is_active = formData.is_active;
      }

      const response = await fetch(
        isEditing
          ? `http://127.0.0.1:8000/users/${editingUserId}`
          : "http://127.0.0.1:8000/users",
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
        const errorText = await response.text();
        throw new Error(
          errorText ||
            `Erro ao salvar usuário: ${response.status}`
        );
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
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este usuário?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      const response = await fetch(
        `http://127.0.0.1:8000/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText ||
            `Erro ao excluir usuário: ${response.status}`
        );
      }

      await loadUsers();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      alert("Erro ao excluir usuário.");
    }
  }

  return (
    <div className="p-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Usuários
        </h1>

        <button
          onClick={openCreateModal}
          className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Novo Usuário
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Nome</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Perfil</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center"
                >
                  Carregando...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center"
                >
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-slate-700 hover:bg-slate-700/30"
                >
                  <td className="p-4">
                    {user.id}
                  </td>

                  <td className="p-4">
                    {user.name}
                  </td>

                  <td className="p-4">
                    {user.email}
                  </td>

                  <td className="p-4">
                    {getUserRoleLabel(user.role_id)}
                  </td>

                  <td className="p-4">
                    {user.is_active === false
                      ? "Inativo"
                      : "Ativo"}
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-yellow-400 mr-4 hover:text-yellow-300"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => deleteUser(user.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 p-8 rounded-lg w-full max-w-md shadow-2xl">
            <h2 className="text-3xl font-bold mb-6">
              {editingUserId
                ? "Editar Usuário"
                : "Novo Usuário"}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="w-full p-3 rounded bg-slate-700 outline-none"
              />

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                className="w-full p-3 rounded bg-slate-700 outline-none"
              />

              <input
                type="password"
                placeholder={
                  editingUserId
                    ? "Senha (opcional)"
                    : "Senha"
                }
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                className="w-full p-3 rounded bg-slate-700 outline-none"
              />

              <select
                value={formData.role_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role_id: Number(e.target.value),
                  })
                }
                className="w-full p-3 rounded bg-slate-700 outline-none"
              >
                {roles.length === 0 ? (
                  <option value={1}>
                    Carregando perfis...
                  </option>
                ) : (
                  roles.map((role) => (
                    <option
                      key={role.id}
                      value={role.id}
                    >
                      {getRoleLabel(role.name)}
                    </option>
                  ))
                )}
              </select>

              {editingUserId && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.checked,
                      })
                    }
                  />
                  Usuário ativo
                </label>
              )}
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
                onClick={saveUser}
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
                type="button"
              >
                {submitting
                  ? "Salvando..."
                  : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
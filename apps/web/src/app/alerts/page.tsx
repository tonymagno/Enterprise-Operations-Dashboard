"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Alert {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "medium",
    status: "active",
  });

  async function loadAlerts() {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      const response = await axios.get(
        "http://localhost:8000/alerts/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAlerts(response.data);
    } catch (error) {
      console.error("Erro ao carregar alertas:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  function openCreateModal() {
    setEditingAlert(null);

    setForm({
      title: "",
      description: "",
      severity: "medium",
      status: "active",
    });

    setShowModal(true);
  }

  function openEditModal(alert: Alert) {
    setEditingAlert(alert);

    setForm({
      title: alert.title,
      description: alert.description,
      severity: alert.severity,
      status: alert.status,
    });

    setShowModal(true);
  }

  async function saveAlert() {
    try {
      const token = localStorage.getItem("access_token");

      const payload = {
        title: form.title,
        description: form.description,
        severity: form.severity,
        status: form.status,
      };

      if (editingAlert) {
        await axios.put(
          `http://localhost:8000/alerts/${editingAlert.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          "http://localhost:8000/alerts/",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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

      await axios.delete(
        `http://localhost:8000/alerts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadAlerts();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir alerta.");
    }
  }

  return (
    <div className="p-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-bold">Alertas</h1>

        <button
          onClick={openCreateModal}
          className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700"
        >
          Novo Alerta
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Título</th>
              <th className="p-4 text-left">Severidade</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  Carregando...
                </td>
              </tr>
            ) : alerts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  Nenhum alerta encontrado
                </td>
              </tr>
            ) : (
              alerts.map((alertItem) => (
                <tr
                  key={alertItem.id}
                  className="border-t border-slate-700"
                >
                  <td className="p-4">{alertItem.id}</td>
                  <td className="p-4">{alertItem.title}</td>
                  <td className="p-4">{alertItem.severity}</td>
                  <td className="p-4">{alertItem.status}</td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => openEditModal(alertItem)}
                      className="text-yellow-400 mr-4"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => deleteAlert(alertItem.id)}
                      className="text-red-500"
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
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <div className="bg-slate-800 p-8 rounded-xl w-[500px]">
            <h2 className="text-4xl font-bold mb-8">
              {editingAlert
                ? "Editar Alerta"
                : "Novo Alerta"}
            </h2>

            <div className="space-y-4">
              <input
                className="w-full p-4 bg-slate-700 rounded"
                placeholder="Título"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
              />

              <textarea
                className="w-full p-4 bg-slate-700 rounded"
                placeholder="Descrição"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />

              <select
                className="w-full p-4 bg-slate-700 rounded"
                value={form.severity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    severity: e.target.value,
                  })
                }
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>

              <select
                className="w-full p-4 bg-slate-700 rounded"
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
              >
                <option value="active">Ativo</option>
                <option value="resolved">Resolvido</option>
              </select>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                className="bg-gray-600 px-6 py-3 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>

              <button
                className="bg-blue-600 px-6 py-3 rounded"
                onClick={saveAlert}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface TelemetryEvent {
  id: number;
  event_type: string;
  source: string;
  severity: string;
}

export default function TelemetryPage() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] =
    useState<TelemetryEvent | null>(null);

  const [form, setForm] = useState({
    event_type: "",
    source: "",
    severity: "medium",
  });

  async function loadEvents() {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:8000/telemetry/"
      );

      setEvents(response.data);
    } catch (error) {
      console.error("Erro ao carregar telemetria:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function openCreateModal() {
    setEditingEvent(null);

    setForm({
      event_type: "",
      source: "",
      severity: "medium",
    });

    setShowModal(true);
  }

  function openEditModal(event: TelemetryEvent) {
    setEditingEvent(event);

    setForm({
      event_type: event.event_type,
      source: event.source,
      severity: event.severity,
    });

    setShowModal(true);
  }

  async function handleSave() {
    try {
      if (editingEvent) {
        await axios.put(
          `http://localhost:8000/telemetry/${editingEvent.id}`,
          form
        );

        alert("Evento atualizado com sucesso.");
      } else {
        await axios.post(
          "http://localhost:8000/telemetry/",
          form
        );

        alert("Evento criado com sucesso.");
      }

      setShowModal(false);

      setEditingEvent(null);

      setForm({
        event_type: "",
        source: "",
        severity: "medium",
      });

      loadEvents();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      alert("Erro ao salvar evento.");
    }
  }

  async function handleDelete(id: number) {
    const confirmDelete = window.confirm(
      "Deseja realmente excluir este evento?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:8000/telemetry/${id}`
      );

      alert("Evento excluído com sucesso.");

      loadEvents();
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      alert("Erro ao excluir evento.");
    }
  }

  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ fontSize: "3rem" }}>
          Telemetria
        </h1>

        <button
          onClick={openCreateModal}
          style={newButtonStyle}
        >
          Novo Evento
        </button>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#16213e",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Tipo</th>
            <th style={thStyle}>Origem</th>
            <th style={thStyle}>Severidade</th>
            <th style={thStyle}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} style={tdStyle}>
                Carregando...
              </td>
            </tr>
          ) : events.length === 0 ? (
            <tr>
              <td colSpan={5} style={tdStyle}>
                Nenhum evento encontrado
              </td>
            </tr>
          ) : (
            events.map((event) => (
              <tr key={event.id}>
                <td style={tdStyle}>{event.id}</td>

                <td style={tdStyle}>
                  {event.event_type}
                </td>

                <td style={tdStyle}>
                  {event.source}
                </td>

                <td style={tdStyle}>
                  {event.severity}
                </td>

                <td style={tdStyle}>
                  <button
                    onClick={() =>
                      openEditModal(event)
                    }
                    style={editButtonStyle}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(event.id)
                    }
                    style={deleteButtonStyle}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginBottom: "1.5rem" }}>
              {editingEvent
                ? "Editar Evento"
                : "Novo Evento"}
            </h2>

            <input
              placeholder="Tipo do Evento"
              value={form.event_type}
              onChange={(e) =>
                setForm({
                  ...form,
                  event_type: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="Origem"
              value={form.source}
              onChange={(e) =>
                setForm({
                  ...form,
                  source: e.target.value,
                })
              }
              style={inputStyle}
            />

            <select
              value={form.severity}
              onChange={(e) =>
                setForm({
                  ...form,
                  severity: e.target.value,
                })
              }
              style={inputStyle}
            >
              <option value="low">
                Baixa
              </option>

              <option value="medium">
                Média
              </option>

              <option value="high">
                Alta
              </option>
            </select>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <button
                onClick={() =>
                  setShowModal(false)
                }
                style={cancelButton}
              >
                Cancelar
              </button>

              <button
                onClick={handleSave}
                style={saveButton}
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

const thStyle = {
  padding: "1rem",
  textAlign: "left" as const,
  background: "#1f2a44",
};

const tdStyle = {
  padding: "1rem",
  borderTop: "1px solid #2d3748",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "1rem",
  background: "#334155",
  border: "none",
  borderRadius: "8px",
  color: "white",
};

const newButtonStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
};

const editButtonStyle = {
  background: "transparent",
  color: "#facc15",
  border: "none",
  cursor: "pointer",
  marginRight: "10px",
};

const deleteButtonStyle = {
  background: "transparent",
  color: "#ef4444",
  border: "none",
  cursor: "pointer",
};

const overlayStyle = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#1f2a44",
  padding: "2rem",
  borderRadius: "12px",
  width: "500px",
  color: "white",
};

const cancelButton = {
  padding: "10px 20px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const saveButton = {
  padding: "10px 20px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};
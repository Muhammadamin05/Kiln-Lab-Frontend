import React, { useState, useEffect, useCallback } from "react";

const API_BASE = "https://kiln-lab-production.up.railway.app/api";

const STAGE_COLORS = {
  "Принят": { bg: "#E6F1FB", text: "#0C447C" },
  "Модель": { bg: "#FCEBEB", text: "#791F1F" },
  "Каркас": { bg: "#FAEEDA", text: "#633806" },
  "Облицовка": { bg: "#FAEEDA", text: "#633806" },
  "Готово": { bg: "#EAF3DE", text: "#27500A" },
  "Отправлено": { bg: "#EAF3DE", text: "#27500A" },
};
const STAGES = ["Принят", "Модель", "Каркас", "Облицовка", "Готово", "Отправлено"];
const WORK_TYPES = ["Коронка, цирконий", "Винир Emax", "Коронка Emax", "Каркас", "Каппа"];
const SHADES = ["A1", "A2", "A3", "B1", "B2", "C2"];

function formatDue(dateStr) {
  return new Date(dateStr).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function OrderCard({ order, role, onAdvance }) {
  const colors = STAGE_COLORS[order.stage];
  const progressPct = Math.round(((order.stageIndex + 1) / STAGES.length) * 100);
  const canAdvance = role === "lab" && order.stageIndex < STAGES.length - 1;

  return (
    <div style={{ border: "0.5px solid #e3e1d9", borderRadius: 12, padding: "14px 16px", background: "#fff", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontWeight: 500, fontSize: 15 }}>{order.patient}</span>
        <span style={{ fontSize: 12, color: "#767468" }}>до {formatDue(order.dueDate)}</span>
      </div>
      <p style={{ fontSize: 13, color: "#767468", margin: 0 }}>{order.clinic} · {order.workType} · {order.shade || "—"}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: colors.bg, color: colors.text, fontWeight: 500 }}>{order.stage}</span>
        <div style={{ flex: 1, height: 4, background: "#efede4", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${progressPct}%`, height: "100%", background: colors.text, opacity: 0.6 }} />
        </div>
      </div>
      {canAdvance && (
        <button onClick={() => onAdvance(order.id)} style={{ alignSelf: "flex-start", fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>
          Следующий этап: {STAGES[order.stageIndex + 1]}
        </button>
      )}
    </div>
  );
}

function NewOrderForm({ clinics, onCreate, onCancel }) {
  const [patient, setPatient] = useState("");
  const [clinicId, setClinicId] = useState(clinics[0]?.id || "");
  const [workType, setWorkType] = useState(WORK_TYPES[0]);
  const [shade, setShade] = useState(SHADES[0]);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!patient.trim()) return setError("Укажите пациента");
    if (!dueDate) return setError("Укажите срок сдачи");
    setError("");
    setSubmitting(true);
    try {
      await onCreate({ patient: patient.trim(), clinicId, workType, shade, dueDate });
    } catch (err) {
      setError(err.message || "Не удалось создать заказ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ border: "0.5px solid #e3e1d9", borderRadius: 12, padding: 16, background: "#fff", display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <label style={{ fontSize: 12, color: "#767468", display: "block", marginBottom: 4 }}>Пациент</label>
        <input value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Фамилия и инициалы" style={{ width: "100%", height: 36, borderRadius: 8, border: "0.5px solid #c9c7bd", padding: "0 10px" }} />
      </div>
      <div>
        <label style={{ fontSize: 12, color: "#767468", display: "block", marginBottom: 4 }}>Клиника</label>
        <select value={clinicId} onChange={(e) => setClinicId(e.target.value)} style={{ width: "100%", height: 36, borderRadius: 8, border: "0.5px solid #c9c7bd" }}>
          {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 12, color: "#767468", display: "block", marginBottom: 4 }}>Тип работы</label>
        <select value={workType} onChange={(e) => setWorkType(e.target.value)} style={{ width: "100%", height: 36, borderRadius: 8, border: "0.5px solid #c9c7bd" }}>
          {WORK_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 12, color: "#767468", display: "block", marginBottom: 6 }}>Цвет по Vita</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SHADES.map((s) => (
            <span key={s} onClick={() => setShade(s)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 999, cursor: "pointer", border: shade === s ? "0.5px solid #185fa5" : "0.5px solid #c9c7bd", background: shade === s ? "#e6f1fb" : "transparent", color: shade === s ? "#0c447c" : "#767468" }}>{s}</span>
          ))}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 12, color: "#767468", display: "block", marginBottom: 4 }}>Срок сдачи</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ width: "100%", height: 36, borderRadius: 8, border: "0.5px solid #c9c7bd", padding: "0 10px" }} />
      </div>
      {error && <span style={{ fontSize: 13, color: "#a32d2d" }}>{error}</span>}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={submit} disabled={submitting} style={{ flex: 1, height: 38, borderRadius: 8, border: "none", background: "#1a1a18", color: "#fff", fontWeight: 500, cursor: "pointer" }}>
          {submitting ? "Отправка…" : "Отправить в лабораторию"}
        </button>
        <button onClick={onCancel} style={{ height: 38, padding: "0 14px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>Отмена</button>
      </div>
    </div>
  );
}

export default function DentalLabTracker() {
  const [orders, setOrders] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [role, setRole] = useState("lab");
  const [showForm, setShowForm] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) throw new Error("failed to load orders");
      setOrders(await res.json());
      setLoadError("");
    } catch (err) {
      setLoadError("Нет связи с сервером. Проверьте, что бэкенд запущен.");
    }
  }, []);

  const loadClinics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/clinics`);
      if (res.ok) setClinics(await res.json());
    } catch (err) {
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadClinics();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [loadOrders, loadClinics]);

  const advance = async (id) => {
    const res = await fetch(`${API_BASE}/orders/${id}/advance`, { method: "PATCH" });
    if (res.ok) loadOrders();
  };

  const createOrder = async (data) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Ошибка сервера");
    }
    setShowForm(false);
    loadOrders();
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", fontFamily: "system-ui, sans-serif", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4, background: "#efede4", borderRadius: 999, padding: 3 }}>
          <button onClick={() => setRole("lab")} style={{ fontSize: 13, padding: "6px 14px", borderRadius: 999, border: "none", cursor: "pointer", background: role === "lab" ? "#fff" : "transparent", fontWeight: role === "lab" ? 500 : 400 }}>Лаборатория</button>
          <button onClick={() => setRole("clinic")} style={{ fontSize: 13, padding: "6px 14px", borderRadius: 999, border: "none", cursor: "pointer", background: role === "clinic" ? "#fff" : "transparent", fontWeight: role === "clinic" ? 500 : 400 }}>Клиника</button>
        </div>
        {role === "clinic" && !showForm && (
          <button onClick={() => setShowForm(true)} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>+ Новый заказ</button>
        )}
      </div>

      {loadError && <span style={{ fontSize: 13, color: "#a32d2d" }}>{loadError}</span>}
      {showForm && <NewOrderForm clinics={clinics} onCreate={createOrder} onCancel={() => setShowForm(false)} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {orders.map((o) => <OrderCard key={o.id} order={o} role={role} onAdvance={advance} />)}
      </div>
    </div>
  );
}

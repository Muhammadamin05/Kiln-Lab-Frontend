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
const WORK_TYPES = ["Коронка, цирконий", "Виниры", "Съёмный протез", "Каркас", "Капа"];
const QUICK_SHADES = ["A1", "A2", "A3", "B1", "B2", "C2"];

// FDI tooth numbering: upper right 18-11, upper left 21-28, lower left 38-31, lower right 41-48
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

const inputStyle = { width: "100%", height: 36, borderRadius: 8, border: "0.5px solid #c9c7bd", padding: "0 10px", boxSizing: "border-box" };
const labelStyle = { fontSize: 12, color: "#767468", display: "block", marginBottom: 4 };

function formatDue(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function ToothChart({ selected, onToggle }) {
  const renderTooth = (num) => {
    const isSelected = selected.includes(num);
    return (
      <button
        key={num}
        type="button"
        onClick={() => onToggle(num)}
        style={{
          width: 28, height: 28, borderRadius: 6, fontSize: 10, cursor: "pointer",
          border: isSelected ? "1.5px solid #185fa5" : "0.5px solid #c9c7bd",
          background: isSelected ? "#0c447c" : "#fff",
          color: isSelected ? "#fff" : "#767468",
          fontWeight: isSelected ? 600 : 400,
        }}
      >{num}</button>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
      <div style={{ display: "flex", gap: 3 }}>
        {UPPER_RIGHT.map(renderTooth)}
        <div style={{ width: 8 }} />
        {UPPER_LEFT.map(renderTooth)}
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {LOWER_RIGHT.map(renderTooth)}
        <div style={{ width: 8 }} />
        {LOWER_LEFT.map(renderTooth)}
      </div>
    </div>
  );
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !password) return setError("Заполните оба поля");
    setError("");
    setSubmitting(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login" ? { name: name.trim(), password } : { clinicName: name.trim(), password };
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Ошибка");
      onLogin(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "60px auto", fontFamily: "system-ui, sans-serif", padding: 16 }}>
      <div style={{ display: "flex", gap: 4, background: "#efede4", borderRadius: 999, padding: 3, marginBottom: 20 }}>
        <button onClick={() => setMode("login")} style={{ flex: 1, fontSize: 13, padding: "8px 0", borderRadius: 999, border: "none", cursor: "pointer", background: mode === "login" ? "#fff" : "transparent", fontWeight: mode === "login" ? 500 : 400 }}>Вход</button>
        <button onClick={() => setMode("register")} style={{ flex: 1, fontSize: 13, padding: "8px 0", borderRadius: 999, border: "none", cursor: "pointer", background: mode === "register" ? "#fff" : "transparent", fontWeight: mode === "register" ? 500 : 400 }}>Регистрация клиники</button>
      </div>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={labelStyle}>{mode === "login" ? "Имя (Лаборатория или название клиники)" : "Название клиники"}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Дентал+" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Пароль</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        </div>
        {error && <span style={{ fontSize: 13, color: "#a32d2d" }}>{error}</span>}
        <button type="submit" disabled={submitting} style={{ height: 42, borderRadius: 8, border: "none", background: "#1a1a18", color: "#fff", fontWeight: 500, cursor: "pointer" }}>
          {submitting ? "Подождите…" : mode === "login" ? "Войти" : "Создать аккаунт клиники"}
        </button>
      </form>
    </div>
  );
}

function AssignRow({ label, task, taskType, orderId, onAssign }) {
  const [technician, setTechnician] = useState(task.technician || "");
  const [quantity, setQuantity] = useState(task.quantity || "");
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onAssign(orderId, taskType, { technician: technician.trim(), quantity: quantity ? Number(quantity) : null, dueDate: dueDate || null });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ border: "0.5px solid #e3e1d9", borderRadius: 8, padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#767468" }}>{label}</span>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={technician} onChange={(e) => setTechnician(e.target.value)} placeholder="Техник" style={{ ...inputStyle, height: 32, flex: 2 }} />
        <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Кол-во" type="number" min="0" style={{ ...inputStyle, height: 32, flex: 1 }} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" style={{ ...inputStyle, height: 32, flex: 1 }} />
        <button onClick={save} disabled={saving} style={{ height: 32, padding: "0 10px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", fontSize: 12, cursor: "pointer" }}>
          {saving ? "…" : "Сохранить"}
        </button>
      </div>
    </div>
  );
}

function OrderCard({ order, role, onAdvance, onAssign }) {
  const colors = STAGE_COLORS[order.stage];
  const progressPct = Math.round(((order.stageIndex + 1) / STAGES.length) * 100);
  const canAdvance = role === "lab" && order.stageIndex < STAGES.length - 1;
  const [showAssign, setShowAssign] = useState(false);
  const fittingDates = (order.fittingDates || []).filter(Boolean);

  return (
    <div style={{ border: "0.5px solid #e3e1d9", borderRadius: 12, padding: "14px 16px", background: "#fff", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontWeight: 500, fontSize: 15 }}>{order.patient}</span>
        <span style={{ fontSize: 12, color: "#767468" }}>до {formatDue(order.dueDate)}</span>
      </div>
      <p style={{ fontSize: 13, color: "#767468", margin: 0 }}>
        {order.clinic} · {order.workType} · оттенок {order.shade || "—"}
      </p>
      {(order.doctor || order.toothCount || order.toothPositions) && (
        <p style={{ fontSize: 12, color: "#9a988c", margin: 0 }}>
          {order.doctor && `Врач: ${order.doctor}`}
          {order.toothCount ? ` · Зубов: ${order.toothCount}` : ""}
          {order.toothPositions ? ` · Зубы: ${order.toothPositions}` : ""}
        </p>
      )}
      {(order.trayInfo || fittingDates.length > 0) && (
        <p style={{ fontSize: 12, color: "#9a988c", margin: 0 }}>
          {order.trayInfo && `Ложка/оттиск: ${order.trayInfo}`}
          {fittingDates.length > 0 ? ` · Примерки: ${fittingDates.map(formatDue).join(", ")}` : ""}
        </p>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: colors.bg, color: colors.text, fontWeight: 500 }}>{order.stage}</span>
        <div style={{ flex: 1, height: 4, background: "#efede4", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${progressPct}%`, height: "100%", background: colors.text, opacity: 0.6 }} />
        </div>
      </div>

      {(order.modeling.technician || order.ceramist.technician) && (
        <p style={{ fontSize: 12, color: "#767468", margin: 0 }}>
          {order.modeling.technician && `Моделировка: ${order.modeling.technician} (${order.modeling.quantity ?? "—"}) до ${formatDue(order.modeling.dueDate)}`}
          {order.modeling.technician && order.ceramist.technician ? " · " : ""}
          {order.ceramist.technician && `Керамист: ${order.ceramist.technician} (${order.ceramist.quantity ?? "—"}) до ${formatDue(order.ceramist.dueDate)}`}
        </p>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {canAdvance && (
          <button onClick={() => onAdvance(order.id)} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>
            Следующий этап: {STAGES[order.stageIndex + 1]}
          </button>
        )}
        {role === "lab" && (
          <button onClick={() => setShowAssign((v) => !v)} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>
            {showAssign ? "Скрыть назначение" : "Назначить исполнителей"}
          </button>
        )}
      </div>

      {showAssign && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <AssignRow label="Моделировка" task={order.modeling} taskType="modeling" orderId={order.id} onAssign={onAssign} />
          <AssignRow label="Керамист" task={order.ceramist} taskType="ceramist" orderId={order.id} onAssign={onAssign} />
        </div>
      )}
    </div>
  );
}

function NewOrderForm({ doctors, onAddDoctor, onCreate, onCancel }) {
  const [patient, setPatient] = useState("");
  const [doctor, setDoctor] = useState("");
  const [newDoctorName, setNewDoctorName] = useState("");
  const [selectedTeeth, setSelectedTeeth] = useState([]);
  const [workType, setWorkType] = useState(WORK_TYPES[0]);
  const [shade, setShade] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [trayInfo, setTrayInfo] = useState("");
  const [fittingDate1, setFittingDate1] = useState("");
  const [fittingDate2, setFittingDate2] = useState("");
  const [fittingDate3, setFittingDate3] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleTooth = (num) => {
    setSelectedTeeth((prev) => prev.includes(num) ? prev.filter((t) => t !== num) : [...prev, num].sort((a, b) => a - b));
  };

  const addDoctor = async () => {
    if (!newDoctorName.trim()) return;
    const created = await onAddDoctor(newDoctorName.trim());
    setNewDoctorName("");
    if (created) setDoctor(created.name);
  };

  const submit = async () => {
    if (!patient.trim()) return setError("Укажите пациента");
    if (!dueDate) return setError("Укажите срок сдачи");
    setError("");
    setSubmitting(true);
    try {
      await onCreate({
        patient: patient.trim(),
        doctor,
        toothCount: selectedTeeth.length || null,
        toothPositions: selectedTeeth.join(", "),
        workType,
        shade: shade.trim(),
        dueDate,
        trayInfo: trayInfo.trim(),
        fittingDates: [fittingDate1, fittingDate2, fittingDate3],
      });
    } catch (err) {
      setError(err.message || "Не удалось создать заказ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ border: "0.5px solid #e3e1d9", borderRadius: 12, padding: 16, background: "#fff", display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <label style={labelStyle}>Пациент</label>
        <input value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Фамилия и инициалы" style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Врач</label>
        <select value={doctor} onChange={(e) => setDoctor(e.target.value)} style={{ ...inputStyle, marginBottom: 6 }}>
          <option value="">— выбрать —</option>
          {doctors.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={newDoctorName} onChange={(e) => setNewDoctorName(e.target.value)} placeholder="Добавить нового врача" style={{ ...inputStyle, height: 32 }} />
          <button type="button" onClick={addDoctor} style={{ height: 32, padding: "0 10px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", fontSize: 12, cursor: "pointer" }}>+</button>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Зубы (нажми, чтобы выбрать) {selectedTeeth.length > 0 && `— выбрано ${selectedTeeth.length}`}</label>
        <ToothChart selected={selectedTeeth} onToggle={toggleTooth} />
      </div>

      <div>
        <label style={labelStyle}>Тип работы</label>
        <select value={workType} onChange={(e) => setWorkType(e.target.value)} style={inputStyle}>
          {WORK_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Цвет по Vita (можно точный, например 3.5)</label>
        <input value={shade} onChange={(e) => setShade(e.target.value)} placeholder="Например: A2 или 3.5" style={{ ...inputStyle, marginBottom: 6 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {QUICK_SHADES.map((s) => (
            <span key={s} onClick={() => setShade(s)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 999, cursor: "pointer", border: shade === s ? "0.5px solid #185fa5" : "0.5px solid #c9c7bd", background: shade === s ? "#e6f1fb" : "transparent", color: shade === s ? "#0c447c" : "#767468" }}>{s}</span>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Ложка / оттиск</label>
        <input value={trayInfo} onChange={(e) => setTrayInfo(e.target.value)} placeholder="Например: 2 сл. локи, трансфер" style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Срок сдачи</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Даты примерок (необязательно)</label>
        <div style={{ display: "flex", gap: 6 }}>
          <input type="date" value={fittingDate1} onChange={(e) => setFittingDate1(e.target.value)} style={inputStyle} />
          <input type="date" value={fittingDate2} onChange={(e) => setFittingDate2(e.target.value)} style={inputStyle} />
          <input type="date" value={fittingDate3} onChange={(e) => setFittingDate3(e.target.value)} style={inputStyle} />
        </div>
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

function ClinicsPanel({ authHeader }) {
  const [clinics, setClinics] = useState([]);
  const [newClinicName, setNewClinicName] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`${API_BASE}/clinics`, { headers: authHeader() });
    if (res.ok) setClinics(await res.json());
  }, [authHeader]);

  useEffect(() => { load(); }, [load]);

  const addClinic = async () => {
    if (!newClinicName.trim()) return;
    setError("");
    const res = await fetch(`${API_BASE}/clinics`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ name: newClinicName.trim() }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Ошибка");
      return;
    }
    setNewClinicName("");
    load();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={newClinicName} onChange={(e) => setNewClinicName(e.target.value)} placeholder="Название новой клиники" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={addClinic} style={{ height: 36, padding: "0 14px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>Добавить</button>
      </div>
      {error && <span style={{ fontSize: 13, color: "#a32d2d" }}>{error}</span>}
      {clinics.map((c) => (
        <div key={c.id} style={{ border: "0.5px solid #e3e1d9", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</span>
          <span style={{ fontSize: 12, color: "#767468" }}>врачей: {c.doctorCount} · заказов: {c.orderCount}</span>
        </div>
      ))}
    </div>
  );
}

export default function DentalLabTracker() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem("kiln-lab-session");
    return saved ? JSON.parse(saved) : null;
  });
  const [orders, setOrders] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState("orders"); // "orders" | "clinics"
  const [loadError, setLoadError] = useState("");

  const authHeader = useCallback(() => ({ Authorization: `Bearer ${session?.token}` }), [session]);

  const loadOrders = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`${API_BASE}/orders`, { headers: authHeader() });
      if (res.status === 401) {
        setSession(null);
        localStorage.removeItem("kiln-lab-session");
        return;
      }
      if (!res.ok) throw new Error("failed to load orders");
      setOrders(await res.json());
      setLoadError("");
    } catch (err) {
      setLoadError("Нет связи с сервером.");
    }
  }, [session, authHeader]);

  const loadDoctors = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`${API_BASE}/doctors`, { headers: authHeader() });
      if (res.ok) setDoctors(await res.json());
    } catch (err) {}
  }, [session, authHeader]);

  useEffect(() => {
    if (!session) return;
    loadOrders();
    loadDoctors();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [session, loadOrders, loadDoctors]);

  const handleLogin = (data) => {
    setSession(data);
    localStorage.setItem("kiln-lab-session", JSON.stringify(data));
  };

  const handleLogout = () => {
    setSession(null);
    setOrders([]);
    localStorage.removeItem("kiln-lab-session");
  };

  const advance = async (id) => {
    const res = await fetch(`${API_BASE}/orders/${id}/advance`, { method: "PATCH", headers: authHeader() });
    if (res.ok) loadOrders();
  };

  const assign = async (orderId, taskType, data) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ taskType, ...data }),
    });
    if (res.ok) loadOrders();
  };

  const addDoctor = async (name) => {
    const res = await fetch(`${API_BASE}/doctors`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const created = await res.json();
      loadDoctors();
      return created;
    }
    return null;
  };

  const createOrder = async (data) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Ошибка сервера");
    }
    setShowForm(false);
    loadOrders();
  };

  if (!session) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", fontFamily: "system-ui, sans-serif", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontWeight: 500, fontSize: 15 }}>{session.name}</span>
          <span style={{ fontSize: 12, color: "#767468", marginLeft: 8 }}>{session.role === "lab" ? "Лаборатория" : "Клиника"}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {session.role === "clinic" && view === "orders" && !showForm && (
            <button onClick={() => setShowForm(true)} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>+ Новый заказ</button>
          )}
          <button onClick={handleLogout} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>Выйти</button>
        </div>
      </div>

      {session.role === "lab" && (
        <div style={{ display: "flex", gap: 4, background: "#efede4", borderRadius: 999, padding: 3 }}>
          <button onClick={() => setView("orders")} style={{ flex: 1, fontSize: 13, padding: "8px 0", borderRadius: 999, border: "none", cursor: "pointer", background: view === "orders" ? "#fff" : "transparent", fontWeight: view === "orders" ? 500 : 400 }}>Заказы</button>
          <button onClick={() => setView("clinics")} style={{ flex: 1, fontSize: 13, padding: "8px 0", borderRadius: 999, border: "none", cursor: "pointer", background: view === "clinics" ? "#fff" : "transparent", fontWeight: view === "clinics" ? 500 : 400 }}>Клиники</button>
        </div>
      )}

      {loadError && <span style={{ fontSize: 13, color: "#a32d2d" }}>{loadError}</span>}

      {view === "clinics" ? (
        <ClinicsPanel authHeader={authHeader} />
      ) : (
        <>
          {showForm && <NewOrderForm doctors={doctors} onAddDoctor={addDoctor} onCreate={createOrder} onCancel={() => setShowForm(false)} />}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orders.map((o) => <OrderCard key={o.id} order={o} role={session.role} onAdvance={advance} onAssign={assign} />)}
          </div>
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";

const API_BASE = "https://kiln-lab-nest-production.up.railway.app/api";

const STAGE_COLORS = {
  "Принят": { bg: "#E6F1FB", text: "#0C447C" },
  "Модель": { bg: "#FCEBEB", text: "#791F1F" },
  "Каркас": { bg: "#FAEEDA", text: "#633806" },
  "Облицовка": { bg: "#FAEEDA", text: "#633806" },
  "Готово": { bg: "#EAF3DE", text: "#27500A" },
  "Отправлено": { bg: "#EAF3DE", text: "#27500A" },
};
const STAGES = ["Принят", "Модель", "Каркас", "Облицовка", "Готово", "Отправлено"];
const WORK_TYPES = [
  // Цельнокерамические реставрации
  "e.max Коронка/Винир (индивид. наслоение)",
  "e.max Винир (раскрашивание)",
  "e.max Коронка/Вкладка (раскрашивание)",
  "e.max Коронка на импланте (раскрашивание)",
  "e.max Коронка на импланте (индивид. наслоение)",
  "Noritake Коронка/Винир на рефрактере",
  "Noritake Восстановление центр. резца на рефрактере",
  "Nacera Коронка CAD/CAM (циркон)",
  "Nacera Коронка CAD/CAM на абатменте",
  "Nacera Коронка CAD/CAM с винтовой фиксацией",
  "MODULAYER Коронка (циркон, послойно окрашена)",
  "MODULAYER Коронка на импланте (циркон, послойно окрашена)",
  "Керамическая десна",
  "Циркониевая вкладка Prettau (CAD/CAM)",
  "Культевая циркониевая вкладка (CAD/CAM)",
  "Запорный штифт для вкладки (циркон)",
  "Цельноциркониевая коронка PRETTAU",
  "Цельноциркониевая коронка на импланте PRETTAU",
  "STL: e.max Коронка/Вкладка (без модели)",
  "STL: MODULAYER Коронка (без модели)",
  "STL: MODULAYER Коронка на импланте (без модели)",
  // Временные и композитные реставрации
  "Временная коронка CAD/CAM PMMA",
  "Временная коронка CAD/CAM на импланте PMMA",
  "Временная коронка MODULAYER CAD/CAM",
  "Временная коронка MODULAYER CAD/CAM на импланте",
  "Коронка из композита",
  "Вкладка композитная восстановительная",
  "Культевая вкладка из композита (стекловолокно)",
  "STL: Временная коронка PMMA (без модели)",
  "STL: Временная коронка на импланте PMMA (без модели)",
  // Дополнительные работы
  "Wax up цифровой",
  "Культевая вкладка (CrCO)",
  "Культевая вкладка (CrCO) с облицовкой E.max",
  "Запорный штифт для вкладки (CrCO)",
  "Титановый абатмент цельнофрезерованный (PREMILL)",
  "Абатмент КХС цельнофрезерованный",
  "Индивидуальный циркониевый абатмент",
  "Изготовление абатмент чека",
  "Изготовление трансфер чека",
  "Индивидуальная прикусная ложка",
  "Индивидуальный прикусной шаблон",
  "Диагностические модели",
  "Цифровой анализ улыбки / 3D-моделирование",
  "Печать моделей на 3D принтере",
  "Дублирование восковой моделировки в цифровую",
  "Изготовление силиконового ключа",
];
const QUICK_SHADES = ["A1", "A2", "A3", "B1", "B2", "C2"];
const TASK_TYPES = ["modeling", "ceramist", "cadcam"];
const TASK_LABELS = { modeling: "Моделировка", ceramist: "Керамист", cadcam: "Cad/Cam моделирование" };
const TASK_STATUS_LABEL = { pending: "Не начато", in_progress: "В работе", done: "Готово" };
const FREE_CLINIC_LIMIT_LABEL = 2;
const FREE_TECH_LIMIT_LABEL = 1;
const INVOICE_STATUS_LABEL = { draft: "Черновик", issued: "Выставлен", partially_paid: "Оплачен частично", paid: "Оплачен" };
const DELIVERY_STATUS_LABEL = { unassigned: "Без курьера", assigned: "Назначен", en_route: "В пути", arrived: "На месте", picked_up: "Забрал", delivered: "Доставлено" };

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
      <button key={num} type="button" onClick={() => onToggle(num)} style={{
        width: 28, height: 28, borderRadius: 6, fontSize: 10, cursor: "pointer",
        border: isSelected ? "1.5px solid #185fa5" : "0.5px solid #c9c7bd",
        background: isSelected ? "#0c447c" : "#fff", color: isSelected ? "#fff" : "#767468",
        fontWeight: isSelected ? 600 : 400,
      }}>{num}</button>
    );
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
      <div style={{ display: "flex", gap: 3 }}>{UPPER_RIGHT.map(renderTooth)}<div style={{ width: 8 }} />{UPPER_LEFT.map(renderTooth)}</div>
      <div style={{ display: "flex", gap: 3 }}>{LOWER_RIGHT.map(renderTooth)}<div style={{ width: 8 }} />{LOWER_LEFT.map(renderTooth)}</div>
    </div>
  );
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [labName, setLabName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "login" && (!name.trim() || !password)) return setError("Заполните оба поля");
    if (mode === "register-clinic" && (!labName.trim() || !name.trim() || !password)) return setError("Заполните все поля");
    if (mode === "register-lab" && (!name.trim() || !password)) return setError("Заполните оба поля");

    setSubmitting(true);
    try {
      let endpoint, payload;
      if (mode === "login") { endpoint = "/auth/login"; payload = { name: name.trim(), password }; }
      else if (mode === "register-clinic") { endpoint = "/auth/register"; payload = { labName: labName.trim(), clinicName: name.trim(), password }; }
      else { endpoint = "/auth/register-lab"; payload = { name: name.trim(), password }; }
      const res = await fetch(`${API_BASE}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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
      <div style={{ display: "flex", gap: 4, background: "#efede4", borderRadius: 999, padding: 3, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => setMode("login")} style={{ flex: "1 1 auto", fontSize: 12, padding: "8px 4px", borderRadius: 999, border: "none", cursor: "pointer", background: mode === "login" ? "#fff" : "transparent", fontWeight: mode === "login" ? 500 : 400 }}>Вход</button>
        <button onClick={() => setMode("register-clinic")} style={{ flex: "1 1 auto", fontSize: 12, padding: "8px 4px", borderRadius: 999, border: "none", cursor: "pointer", background: mode === "register-clinic" ? "#fff" : "transparent", fontWeight: mode === "register-clinic" ? 500 : 400 }}>Я клиника</button>
        <button onClick={() => setMode("register-lab")} style={{ flex: "1 1 auto", fontSize: 12, padding: "8px 4px", borderRadius: 999, border: "none", cursor: "pointer", background: mode === "register-lab" ? "#fff" : "transparent", fontWeight: mode === "register-lab" ? 500 : 400 }}>Я лаборатория</button>
      </div>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "login" && (
          <div><label style={labelStyle}>Имя (лаборатория, клиника, техник, курьер)</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Дентал+" style={inputStyle} /></div>
        )}
        {mode === "register-clinic" && (
          <>
            <div><label style={labelStyle}>Название лаборатории (к которой подключаетесь)</label><input value={labName} onChange={(e) => setLabName(e.target.value)} placeholder="Точное название лаборатории" style={inputStyle} /></div>
            <div><label style={labelStyle}>Название клиники</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Дентал+" style={inputStyle} /></div>
          </>
        )}
        {mode === "register-lab" && (
          <div><label style={labelStyle}>Название лаборатории</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название вашей лаборатории" style={inputStyle} /></div>
        )}
        <div><label style={labelStyle}>Пароль</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} /></div>
        {error && <span style={{ fontSize: 13, color: "#a32d2d" }}>{error}</span>}
        <button type="submit" disabled={submitting} style={{ height: 42, borderRadius: 8, border: "none", background: "#1a1a18", color: "#fff", fontWeight: 500, cursor: "pointer" }}>
          {submitting ? "Подождите…" : mode === "login" ? "Войти" : mode === "register-clinic" ? "Создать аккаунт клиники" : "Создать лабораторию (14 дней бесплатно)"}
        </button>
      </form>
      <p style={{ fontSize: 12, color: "#9a988c", marginTop: 12, textAlign: "center" }}>Аккаунты техников и курьеров создаёт лаборатория из своего кабинета.</p>
    </div>
  );
}

function AssignRow({ label, task, taskType, orderId, technicians, priceList, workType, onAssign }) {
  const [technicianId, setTechnicianId] = useState(task.technicianId || "");
  const [quantity, setQuantity] = useState(task.quantity || "");
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [price, setPrice] = useState(task.price || "");
  const [saving, setSaving] = useState(false);
  const suggested = priceList.find((p) => p.workType === workType && p.taskType === taskType);

  const save = async () => {
    setSaving(true);
    try {
      await onAssign(orderId, taskType, { technicianId: technicianId || null, quantity: quantity ? Number(quantity) : null, dueDate: dueDate || null, price: price ? Number(price) : null });
    } finally { setSaving(false); }
  };

  return (
    <div style={{ border: "0.5px solid #e3e1d9", borderRadius: 8, padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#767468" }}>{label}{task.status && task.technicianId ? ` · ${TASK_STATUS_LABEL[task.status] || task.status}` : ""}</span>
      <select value={technicianId} onChange={(e) => setTechnicianId(e.target.value)} style={{ ...inputStyle, height: 32 }}>
        <option value="">— техник —</option>
        {technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Кол-во" type="number" min="0" style={{ ...inputStyle, height: 32, flex: 1 }} />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Сумма ₽" type="number" min="0" style={{ ...inputStyle, height: 32, flex: 1 }} />
      </div>
      {suggested && String(suggested.price) !== price && (
        <span onClick={() => setPrice(String(suggested.price))} style={{ fontSize: 11, color: "#185fa5", cursor: "pointer" }}>Из прайса: {suggested.price} ₽ — применить</span>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" style={{ ...inputStyle, height: 32, flex: 1 }} />
        <button onClick={save} disabled={saving} style={{ height: 32, padding: "0 10px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", fontSize: 12, cursor: "pointer" }}>{saving ? "…" : "Сохранить"}</button>
      </div>
    </div>
  );
}

function OrderHistory({ orderId, authHeader }) {
  const [events, setEvents] = useState(null);
  useEffect(() => {
    fetch(`${API_BASE}/orders/${orderId}/history`, { headers: authHeader() }).then((res) => res.ok ? res.json() : []).then(setEvents);
  }, [orderId, authHeader]);
  if (events === null) return <p style={{ fontSize: 12, color: "#9a988c" }}>Загрузка…</p>;
  if (events.length === 0) return <p style={{ fontSize: 12, color: "#9a988c" }}>История пуста.</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {events.map((e, i) => (
        <div key={i} style={{ fontSize: 12, color: "#767468", display: "flex", justifyContent: "space-between" }}>
          <span>{e.stage}</span>
          <span>{new Date(e.changedAt).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      ))}
    </div>
  );
}

function OrderComments({ orderId, authHeader }) {
  const [comments, setComments] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const load = useCallback(() => {
    fetch(`${API_BASE}/orders/${orderId}/comments`, { headers: authHeader() }).then((res) => res.ok ? res.json() : []).then(setComments);
  }, [orderId, authHeader]);
  useEffect(() => { load(); }, [load]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/comments`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ text: text.trim() }) });
      if (res.ok) { setText(""); load(); }
    } finally { setSending(false); }
  };

  if (comments === null) return <p style={{ fontSize: 12, color: "#9a988c" }}>Загрузка…</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {comments.length === 0 && <p style={{ fontSize: 12, color: "#9a988c", margin: 0 }}>Пока нет комментариев.</p>}
      {comments.map((c) => (
        <div key={c.id} style={{ fontSize: 12 }}>
          <span style={{ fontWeight: 500 }}>{c.authorName}</span>
          <span style={{ color: "#9a988c" }}> · {new Date(c.createdAt).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
          <p style={{ margin: "2px 0 0", color: "#767468" }}>{c.text}</p>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Написать комментарий…" style={{ ...inputStyle, height: 32, flex: 1 }} onKeyDown={(e) => e.key === "Enter" && send()} />
        <button onClick={send} disabled={sending} style={{ height: 32, padding: "0 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", fontSize: 12, cursor: "pointer" }}>Отправить</button>
      </div>
    </div>
  );
}

function OrderCard({ order, role, technicians, priceList, authHeader, onAdvance, onAssign, onDuplicate, onCreateInvoice, onArrangeDelivery }) {
  const colors = STAGE_COLORS[order.stage];
  const progressPct = Math.round(((order.stageIndex + 1) / STAGES.length) * 100);
  const canAdvance = role === "lab" && order.stageIndex < STAGES.length - 1;
  const [showAssign, setShowAssign] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const fittingDates = (order.fittingDates || []).filter(Boolean);
  const assignedTasks = TASK_TYPES.filter((t) => order[t].technicianName);
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = order.dueDate < today && order.stage !== "Отправлено";
  const isDueSoon = !isOverdue && order.dueDate <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) && order.stage !== "Отправлено";

  const printOrder = () => {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Заказ — ${order.patient}</title>
      <style>body{font-family:system-ui,sans-serif;padding:24px;color:#1a1a18} h1{font-size:18px} table{width:100%;border-collapse:collapse;margin-top:12px} td{padding:6px 0;border-bottom:1px solid #e3e1d9;font-size:14px} td:first-child{color:#767468;width:40%}</style>
      </head><body><h1>Бланк заказа — ${order.patient}</h1><table>
      <tr><td>Клиника</td><td>${order.clinic}</td></tr>
      <tr><td>Врач</td><td>${order.doctor || "—"}</td></tr>
      <tr><td>Тип работы</td><td>${order.workType}</td></tr>
      <tr><td>Оттенок</td><td>${order.shade || "—"}</td></tr>
      <tr><td>Зубы</td><td>${order.toothPositions || "—"}</td></tr>
      <tr><td>Ложка/оттиск</td><td>${order.trayInfo || "—"}</td></tr>
      <tr><td>Срок сдачи</td><td>${formatDue(order.dueDate)}</td></tr>
      <tr><td>Этап</td><td>${order.stage}</td></tr>
      </table></body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div style={{ border: isOverdue ? "1px solid #a32d2d" : isDueSoon ? "1px solid #b8860b" : "0.5px solid #e3e1d9", borderRadius: 12, padding: "14px 16px", background: "#fff", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontWeight: 500, fontSize: 15 }}>{order.patient}</span>
        <span style={{ fontSize: 12, color: isOverdue ? "#a32d2d" : isDueSoon ? "#b8860b" : "#767468", fontWeight: isOverdue || isDueSoon ? 600 : 400 }}>{isOverdue ? "Просрочено · " : isDueSoon ? "Скоро · " : ""}до {formatDue(order.dueDate)}</span>
      </div>
      <p style={{ fontSize: 13, color: "#767468", margin: 0 }}>{order.clinic} · {order.workType} · оттенок {order.shade || "—"}</p>
      {(order.doctor || order.toothCount || order.toothPositions) && (
        <p style={{ fontSize: 12, color: "#9a988c", margin: 0 }}>{order.doctor && `Врач: ${order.doctor}`}{order.toothCount ? ` · Зубов: ${order.toothCount}` : ""}{order.toothPositions ? ` · Зубы: ${order.toothPositions}` : ""}</p>
      )}
      {(order.trayInfo || fittingDates.length > 0) && (
        <p style={{ fontSize: 12, color: "#9a988c", margin: 0 }}>{order.trayInfo && `Ложка/оттиск: ${order.trayInfo}`}{fittingDates.length > 0 ? ` · Примерки: ${fittingDates.map(formatDue).join(", ")}` : ""}</p>
      )}
      {order.fileLink && (
        <p style={{ fontSize: 12, margin: 0 }}><a href={order.fileLink} target="_blank" rel="noreferrer" style={{ color: "#185fa5" }}>Файл (STL/скан) — ссылка</a></p>
      )}
      {order.clinicPriceSnapshot != null && (
        <p style={{ fontSize: 12, color: "#9a988c", margin: 0 }}>Цена клинике: {order.clinicPriceSnapshot} ₽</p>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: colors.bg, color: colors.text, fontWeight: 500 }}>{order.stage}</span>
        <div style={{ flex: 1, height: 4, background: "#efede4", borderRadius: 999, overflow: "hidden" }}><div style={{ width: `${progressPct}%`, height: "100%", background: colors.text, opacity: 0.6 }} /></div>
      </div>
      {assignedTasks.length > 0 && (
        <p style={{ fontSize: 12, color: "#767468", margin: 0 }}>
          {assignedTasks.map((t) => `${TASK_LABELS[t]}: ${order[t].technicianName} (${order[t].quantity ?? "—"}) до ${formatDue(order[t].dueDate)} · ${TASK_STATUS_LABEL[order[t].status] || ""}`).join(" · ")}
        </p>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {canAdvance && <button onClick={() => onAdvance(order.id)} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>Следующий этап: {STAGES[order.stageIndex + 1]}</button>}
        {role === "lab" && <button onClick={() => setShowAssign((v) => !v)} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>{showAssign ? "Скрыть назначение" : "Назначить исполнителей"}</button>}
        <button onClick={() => setShowHistory((v) => !v)} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>{showHistory ? "Скрыть историю" : "История"}</button>
        <button onClick={() => setShowComments((v) => !v)} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>{showComments ? "Скрыть комментарии" : "Комментарии"}</button>
        <button onClick={printOrder} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>Печать</button>
        {role === "clinic" && onDuplicate && <button onClick={() => onDuplicate(order)} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>Дублировать</button>}
        {role === "lab" && onCreateInvoice && <button onClick={() => onCreateInvoice(order.id)} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>Выставить счёт</button>}
        {role === "lab" && onArrangeDelivery && <button onClick={() => onArrangeDelivery(order.id)} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>Доставка</button>}
      </div>
      {showAssign && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TASK_TYPES.map((t) => <AssignRow key={t} label={TASK_LABELS[t]} task={order[t]} taskType={t} orderId={order.id} technicians={technicians} priceList={priceList} workType={order.workType} onAssign={onAssign} />)}
        </div>
      )}
      {showHistory && <OrderHistory orderId={order.id} authHeader={authHeader} />}
      {showComments && <OrderComments orderId={order.id} authHeader={authHeader} />}
    </div>
  );
}

function NewOrderForm({ doctors, onAddDoctor, onCreate, onCancel, initialValues }) {
  const iv = initialValues || {};
  const [patient, setPatient] = useState(iv.patient || "");
  const [doctor, setDoctor] = useState(iv.doctor || "");
  const [newDoctorName, setNewDoctorName] = useState("");
  const [selectedTeeth, setSelectedTeeth] = useState(iv.selectedTeeth || []);
  const [workType, setWorkType] = useState(iv.workType || WORK_TYPES[0]);
  const [shade, setShade] = useState(iv.shade || "");
  const [dueDate, setDueDate] = useState("");
  const [trayInfo, setTrayInfo] = useState(iv.trayInfo || "");
  const [fileLink, setFileLink] = useState("");
  const [fittingDate1, setFittingDate1] = useState("");
  const [fittingDate2, setFittingDate2] = useState("");
  const [fittingDate3, setFittingDate3] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleTooth = (num) => setSelectedTeeth((prev) => prev.includes(num) ? prev.filter((t) => t !== num) : [...prev, num].sort((a, b) => a - b));
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
        patient: patient.trim(), doctor, toothCount: selectedTeeth.length || null, toothPositions: selectedTeeth.join(", "),
        workType, shade: shade.trim(), dueDate, trayInfo: trayInfo.trim(), fileLink: fileLink.trim(),
        fittingDates: [fittingDate1, fittingDate2, fittingDate3],
      });
    } catch (err) {
      setError(err.message || "Не удалось создать заказ");
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ border: "0.5px solid #e3e1d9", borderRadius: 12, padding: 16, background: "#fff", display: "flex", flexDirection: "column", gap: 12 }}>
      <div><label style={labelStyle}>Пациент</label><input value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Фамилия и инициалы" style={inputStyle} /></div>
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
      <div><label style={labelStyle}>Зубы (нажми, чтобы выбрать) {selectedTeeth.length > 0 && `— выбрано ${selectedTeeth.length}`}</label><ToothChart selected={selectedTeeth} onToggle={toggleTooth} /></div>
      <div><label style={labelStyle}>Тип работы</label><select value={workType} onChange={(e) => setWorkType(e.target.value)} style={inputStyle}>{WORK_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}</select></div>
      <div>
        <label style={labelStyle}>Цвет по Vita (можно точный, например 3.5)</label>
        <input value={shade} onChange={(e) => setShade(e.target.value)} placeholder="Например: A2 или 3.5" style={{ ...inputStyle, marginBottom: 6 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {QUICK_SHADES.map((s) => <span key={s} onClick={() => setShade(s)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 999, cursor: "pointer", border: shade === s ? "0.5px solid #185fa5" : "0.5px solid #c9c7bd", background: shade === s ? "#e6f1fb" : "transparent", color: shade === s ? "#0c447c" : "#767468" }}>{s}</span>)}
        </div>
      </div>
      <div><label style={labelStyle}>Ложка / оттиск</label><input value={trayInfo} onChange={(e) => setTrayInfo(e.target.value)} placeholder="Например: 2 сл. локи, трансфер" style={inputStyle} /></div>
      <div><label style={labelStyle}>Ссылка на файл (STL/скан, необязательно)</label><input value={fileLink} onChange={(e) => setFileLink(e.target.value)} placeholder="Ссылка на Google Drive и т.п." style={inputStyle} /></div>
      <div><label style={labelStyle}>Срок сдачи</label><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} /></div>
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
        <button onClick={submit} disabled={submitting} style={{ flex: 1, height: 38, borderRadius: 8, border: "none", background: "#1a1a18", color: "#fff", fontWeight: 500, cursor: "pointer" }}>{submitting ? "Отправка…" : "Отправить в лабораторию"}</button>
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
    const res = await fetch(`${API_BASE}/clinics`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ name: newClinicName.trim() }) });
    if (!res.ok) { const body = await res.json().catch(() => ({})); setError(body.error || "Ошибка"); return; }
    setNewClinicName(""); load();
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
          <span style={{ fontSize: 12, color: "#767468" }}>врачей: {c.doctorCount} · заказов: {c.orderCount}{c.lastOrderAt ? ` · последний: ${formatDue(c.lastOrderAt)}` : ""}</span>
        </div>
      ))}
    </div>
  );
}

function TechniciansPanel({ technicians, onAdd, onDelete }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSenior, setIsSenior] = useState(false);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const add = async () => {
    if (!name.trim() || !password) return setError("Заполните оба поля");
    setError("");
    try { await onAdd(name.trim(), password, isSenior); setName(""); setPassword(""); setIsSenior(false); }
    catch (err) { setError(err.message); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя техника" style={{ ...inputStyle, flex: 1 }} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={add} style={{ height: 36, padding: "0 14px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>+</button>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#767468" }}>
        <input type="checkbox" checked={isSenior} onChange={(e) => setIsSenior(e.target.checked)} />Старший техник (видит очередь всей смены)
      </label>
      {error && <span style={{ fontSize: 13, color: "#a32d2d" }}>{error}</span>}
      {technicians.map((t) => (
        <div key={t.id} style={{ border: "0.5px solid #e3e1d9", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 500, fontSize: 14 }}>{t.name}{t.isSenior ? " · старший" : ""}</span>
          {confirmDeleteId === t.id ? (
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => { onDelete(t.id); setConfirmDeleteId(null); }} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, border: "0.5px solid #a32d2d", color: "#a32d2d", background: "transparent", cursor: "pointer" }}>Удалить</button>
              <button onClick={() => setConfirmDeleteId(null)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>Отмена</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDeleteId(t.id)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer", color: "#767468" }}>Удалить</button>
          )}
        </div>
      ))}
    </div>
  );
}

function CouriersPanel({ couriers, onAdd }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const add = async () => {
    if (!name.trim() || !password) return setError("Заполните оба поля");
    setError("");
    try { await onAdd(name.trim(), password); setName(""); setPassword(""); }
    catch (err) { setError(err.message); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя курьера" style={{ ...inputStyle, flex: 1 }} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={add} style={{ height: 36, padding: "0 14px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>+</button>
      </div>
      {error && <span style={{ fontSize: 13, color: "#a32d2d" }}>{error}</span>}
      {couriers.map((c) => (
        <div key={c.id} style={{ border: "0.5px solid #e3e1d9", borderRadius: 10, padding: "10px 14px" }}><span style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</span></div>
      ))}
    </div>
  );
}

function PriceListPanel({ priceList, onSave }) {
  const [values, setValues] = useState({});
  const key = (w, t) => `${w}__${t}`;
  const getValue = (w, t) => values[key(w, t)] !== undefined ? values[key(w, t)] : (priceList.find((p) => p.workType === w && p.taskType === t)?.price ?? "");
  const setValue = (w, t, v) => setValues((prev) => ({ ...prev, [key(w, t)]: v }));
  const save = (w, t) => { const v = getValue(w, t); if (v !== "") onSave(w, t, Number(v)); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 12, color: "#767468", margin: 0 }}>Сколько лаборатория платит технику за каждый тип работы (для назначения исполнителей).</p>
      {WORK_TYPES.map((w) => (
        <div key={w} style={{ border: "0.5px solid #e3e1d9", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontWeight: 500, fontSize: 13 }}>{w}</span>
          {TASK_TYPES.map((t) => (
            <div key={t} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#767468", flex: 1 }}>{TASK_LABELS[t]}</span>
              <input value={getValue(w, t)} onChange={(e) => setValue(w, t, e.target.value)} type="number" min="0" placeholder="₽" style={{ ...inputStyle, height: 30, width: 90 }} />
              <button onClick={() => save(w, t)} style={{ height: 30, padding: "0 10px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", fontSize: 12, cursor: "pointer" }}>OK</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ClinicPriceBookPanel({ authHeader }) {
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState("");
  const [prices, setPrices] = useState([]);
  const [values, setValues] = useState({});

  useEffect(() => {
    fetch(`${API_BASE}/clinics`, { headers: authHeader() }).then((res) => res.ok ? res.json() : []).then((cs) => { setClinics(cs); if (cs[0]) setSelectedClinic(String(cs[0].id)); });
  }, [authHeader]);

  const loadPrices = useCallback(() => {
    if (!selectedClinic) return;
    fetch(`${API_BASE}/clinic-price-book/${selectedClinic}`, { headers: authHeader() }).then((res) => res.ok ? res.json() : []).then(setPrices);
  }, [selectedClinic, authHeader]);

  useEffect(() => { loadPrices(); }, [loadPrices]);

  const getValue = (w) => values[w] !== undefined ? values[w] : (prices.find((p) => p.workType === w)?.price ?? "");
  const setValue = (w, v) => setValues((prev) => ({ ...prev, [w]: v }));
  const save = async (w) => {
    const v = getValue(w);
    if (v === "") return;
    await fetch(`${API_BASE}/clinic-price-book/${selectedClinic}`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ workType: w, price: Number(v) }) });
    loadPrices();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 12, color: "#767468", margin: 0 }}>Сколько эта клиника платит лаборатории за каждый тип работы. Фиксируется в заказе на момент создания.</p>
      <select value={selectedClinic} onChange={(e) => setSelectedClinic(e.target.value)} style={inputStyle}>
        {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {WORK_TYPES.map((w) => (
        <div key={w} style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 13, flex: 1 }}>{w}</span>
          <input value={getValue(w)} onChange={(e) => setValue(w, e.target.value)} type="number" min="0" placeholder="₽" style={{ ...inputStyle, height: 32, width: 100 }} />
          <button onClick={() => save(w)} style={{ height: 32, padding: "0 10px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", fontSize: 12, cursor: "pointer" }}>OK</button>
        </div>
      ))}
    </div>
  );
}

function InvoicesPanel({ authHeader, role }) {
  const [invoices, setInvoices] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");

  const load = useCallback(() => {
    fetch(`${API_BASE}/invoices`, { headers: authHeader() }).then((res) => res.ok ? res.json() : []).then(setInvoices);
  }, [authHeader]);
  useEffect(() => { load(); }, [load]);

  const openInvoice = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    const res = await fetch(`${API_BASE}/invoices/${id}/payments`, { headers: authHeader() });
    setPayments(res.ok ? await res.json() : []);
  };

  const issue = async (id) => { await fetch(`${API_BASE}/invoices/${id}/issue`, { method: "PATCH", headers: authHeader() }); load(); };

  const addPayment = async (id) => {
    if (!amount) return;
    await fetch(`${API_BASE}/invoices/${id}/payments`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ amount: Number(amount), method, paidAt: new Date().toISOString().slice(0, 10) }) });
    setAmount("");
    load();
    openInvoice(id === expandedId ? -1 : id);
    setTimeout(() => openInvoice(id), 0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {invoices.length === 0 && <p style={{ fontSize: 13, color: "#767468" }}>Пока нет счетов.</p>}
      {invoices.map((inv) => (
        <div key={inv.id} style={{ border: "0.5px solid #e3e1d9", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 500, fontSize: 14 }}>{inv.patient}{inv.clinic ? ` · ${inv.clinic}` : ""}</span>
            <span style={{ fontSize: 12, color: "#767468" }}>{inv.amount} ₽</span>
          </div>
          <span style={{ fontSize: 12, color: "#767468" }}>Статус: {INVOICE_STATUS_LABEL[inv.status] || inv.status}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {role === "lab" && inv.status === "draft" && <button onClick={() => issue(inv.id)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>Выставить</button>}
            <button onClick={() => openInvoice(inv.id)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>{expandedId === inv.id ? "Скрыть" : "Платежи"}</button>
          </div>
          {expandedId === inv.id && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
              {payments.map((p) => <div key={p.id} style={{ fontSize: 12, color: "#767468" }}>{p.amount} ₽ · {p.method} · {formatDue(p.paidAt)}</div>)}
              {role === "lab" && (
                <div style={{ display: "flex", gap: 6 }}>
                  <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Сумма" style={{ ...inputStyle, height: 32, flex: 1 }} />
                  <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ ...inputStyle, height: 32, flex: 1 }}>
                    <option value="cash">Наличные</option><option value="bank_transfer">Перевод</option><option value="card">Карта</option><option value="other">Другое</option>
                  </select>
                  <button onClick={() => addPayment(inv.id)} style={{ height: 32, padding: "0 10px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", fontSize: 12, cursor: "pointer" }}>+</button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DeliveriesPanel({ authHeader, couriers }) {
  const [deliveries, setDeliveries] = useState([]);
  const load = useCallback(() => {
    fetch(`${API_BASE}/deliveries`, { headers: authHeader() }).then((res) => res.ok ? res.json() : []).then(setDeliveries);
  }, [authHeader]);
  useEffect(() => { load(); const i = setInterval(load, 6000); return () => clearInterval(i); }, [load]);

  const assign = async (id, courierId) => { await fetch(`${API_BASE}/deliveries/${id}/assign`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ courierId }) }); load(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {deliveries.length === 0 && <p style={{ fontSize: 13, color: "#767468" }}>Пока нет доставок.</p>}
      {deliveries.map((d) => (
        <div key={d.id} style={{ border: "0.5px solid #e3e1d9", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontWeight: 500, fontSize: 14 }}>{d.patient} · {d.clinic}</span>
          <span style={{ fontSize: 12, color: "#767468" }}>{d.deliveryType === "pickup_impression" ? "Забор слепка" : "Доставка готового"} · {d.address}</span>
          <span style={{ fontSize: 12, color: "#767468" }}>Статус: {DELIVERY_STATUS_LABEL[d.status] || d.status}{d.courierName ? ` · ${d.courierName}` : ""}</span>
          {!d.courierId && (
            <select onChange={(e) => e.target.value && assign(d.id, e.target.value)} defaultValue="" style={{ ...inputStyle, height: 32 }}>
              <option value="">— назначить курьера —</option>
              {couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>
      ))}
    </div>
  );
}

function DeliveryOrderModal({ orderId, onClose, onCreated }) {
  const [deliveryType, setDeliveryType] = useState("pickup_impression");
  const [address, setAddress] = useState("");
  const [windowStart, setWindowStart] = useState("");
  const [windowEnd, setWindowEnd] = useState("");

  const submit = async () => {
    if (!address.trim()) return;
    await onCreated(orderId, { deliveryType, address: address.trim(), windowStart, windowEnd });
    onClose();
  };

  return (
    <div style={{ border: "0.5px solid #e3e1d9", borderRadius: 12, padding: 16, background: "#fff", display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontWeight: 500, fontSize: 14 }}>Оформить доставку</span>
      <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)} style={inputStyle}>
        <option value="pickup_impression">Забор слепка у клиники</option>
        <option value="deliver_finished">Доставка готовой работы</option>
      </select>
      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Адрес" style={inputStyle} />
      <div style={{ display: "flex", gap: 6 }}>
        <input type="datetime-local" value={windowStart} onChange={(e) => setWindowStart(e.target.value)} style={inputStyle} />
        <input type="datetime-local" value={windowEnd} onChange={(e) => setWindowEnd(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={submit} style={{ flex: 1, height: 36, borderRadius: 8, border: "none", background: "#1a1a18", color: "#fff", cursor: "pointer" }}>Создать</button>
        <button onClick={onClose} style={{ height: 36, padding: "0 14px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>Отмена</button>
      </div>
    </div>
  );
}

function AuditLogPanel({ authHeader }) {
  const [events, setEvents] = useState(null);
  useEffect(() => { fetch(`${API_BASE}/audit-events`, { headers: authHeader() }).then((res) => res.ok ? res.json() : []).then(setEvents); }, [authHeader]);
  if (events === null) return <p style={{ fontSize: 13, color: "#767468" }}>Загрузка…</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {events.length === 0 && <p style={{ fontSize: 13, color: "#767468" }}>Пока нет событий.</p>}
      {events.map((e) => (
        <div key={e.id} style={{ border: "0.5px solid #e3e1d9", borderRadius: 10, padding: "10px 12px", fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 500 }}>{e.actorName} ({e.actorRole})</span>
            <span style={{ color: "#9a988c" }}>{new Date(e.createdAt).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <p style={{ margin: "4px 0 0", color: "#767468" }}>{e.entityType} #{e.entityId} — {e.action}</p>
        </div>
      ))}
    </div>
  );
}

function StatsPanel({ authHeader }) {
  const [stats, setStats] = useState([]);
  useEffect(() => { fetch(`${API_BASE}/stats/overview`, { headers: authHeader() }).then((res) => res.ok ? res.json() : []).then(setStats); }, [authHeader]);
  const maxEarned = Math.max(1, ...stats.map((s) => s.earnedTotal));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {stats.length === 0 && <p style={{ fontSize: 13, color: "#767468" }}>Пока нет техников или выполненных работ.</p>}
      {stats.map((s) => (
        <div key={s.id} style={{ border: "0.5px solid #e3e1d9", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontWeight: 500, fontSize: 14 }}>{s.name}</span>
          <div style={{ height: 8, background: "#efede4", borderRadius: 999, overflow: "hidden" }}><div style={{ width: `${(s.earnedTotal / maxEarned) * 100}%`, height: "100%", background: "#534AB7" }} /></div>
          <span style={{ fontSize: 12, color: "#767468" }}>Сегодня: {s.completedToday} шт · {s.earnedToday} ₽</span>
          <span style={{ fontSize: 12, color: "#767468" }}>Всего: {s.completedTotal} шт · {s.earnedTotal} ₽</span>
          <span style={{ fontSize: 12, color: "#767468" }}>В работе сейчас: {s.inProgress}</span>
        </div>
      ))}
    </div>
  );
}

function PlanPanel({ authHeader }) {
  const [status, setStatus] = useState(null);
  useEffect(() => { fetch(`${API_BASE}/lab/status`, { headers: authHeader() }).then((res) => res.ok ? res.json() : null).then(setStatus); }, [authHeader]);
  if (!status) return <p style={{ fontSize: 13, color: "#767468" }}>Загрузка…</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ border: "0.5px solid #e3e1d9", borderRadius: 10, padding: "14px 16px" }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 6px" }}>{status.labName}</p>
        {status.plan === "paid" ? <p style={{ fontSize: 13, color: "#27500A", margin: 0 }}>Платный тариф — без ограничений</p>
          : status.trialActive ? <p style={{ fontSize: 13, color: "#0C447C", margin: 0 }}>Пробный период — осталось {status.daysLeft} дн.</p>
          : <p style={{ fontSize: 13, color: "#791F1F", margin: 0 }}>Бесплатный тариф — действуют лимиты</p>}
        <p style={{ fontSize: 12, color: "#767468", margin: "8px 0 0" }}>Клиник: {status.clinicCount}{status.limits ? ` из ${status.limits.clinics}` : ""} · Техников: {status.techCount}{status.limits ? ` из ${status.limits.technicians}` : ""}</p>
      </div>
      {!status.unrestricted && (
        <div style={{ border: "0.5px solid #e3e1d9", borderRadius: 10, padding: "14px 16px" }}>
          <p style={{ fontSize: 13, margin: "0 0 6px" }}>На бесплатном тарифе: до {FREE_CLINIC_LIMIT_LABEL} клиник и {FREE_TECH_LIMIT_LABEL} техник(а/ов).</p>
          <p style={{ fontSize: 12, color: "#767468", margin: 0 }}>Чтобы снять ограничения — свяжитесь с нами для перехода на платный тариф.</p>
        </div>
      )}
    </div>
  );
}

function KanbanBoard({ orders, technicians, priceList, authHeader, onAdvance, onAssign }) {
  return (
    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
      {STAGES.map((stage) => {
        const stageOrders = orders.filter((o) => o.stage === stage);
        return (
          <div key={stage} style={{ minWidth: 220, flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#767468", padding: "0 4px" }}>{stage} ({stageOrders.length})</div>
            {stageOrders.map((o) => <div key={o.id} style={{ width: 220 }}><OrderCard order={o} role="lab" technicians={technicians} priceList={priceList} authHeader={authHeader} onAdvance={onAdvance} onAssign={onAssign} /></div>)}
            {stageOrders.length === 0 && <p style={{ fontSize: 12, color: "#c9c7bd", padding: "0 4px" }}>Пусто</p>}
          </div>
        );
      })}
    </div>
  );
}

function ActivityFeed({ authHeader }) {
  const [events, setEvents] = useState(null);
  useEffect(() => { fetch(`${API_BASE}/activity`, { headers: authHeader() }).then((res) => res.ok ? res.json() : []).then(setEvents); }, [authHeader]);
  if (events === null) return <p style={{ fontSize: 13, color: "#767468" }}>Загрузка…</p>;
  if (events.length === 0) return <p style={{ fontSize: 13, color: "#767468" }}>Пока нет активности.</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {events.map((e, i) => (
        <div key={i} style={{ border: "0.5px solid #e3e1d9", borderRadius: 10, padding: "10px 12px", fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 500 }}>{e.patient} · {e.clinic}</span>
            <span style={{ color: "#9a988c" }}>{new Date(e.at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          {e.type === "stage" ? <p style={{ margin: "4px 0 0", color: "#767468" }}>Этап изменён на «{e.stage}»</p> : <p style={{ margin: "4px 0 0", color: "#767468" }}>{e.author}: {e.text}</p>}
        </div>
      ))}
    </div>
  );
}

function NotificationsBell({ authHeader }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const load = useCallback(() => {
    fetch(`${API_BASE}/notifications`, { headers: authHeader() }).then((res) => res.ok ? res.json() : []).then(setItems);
  }, [authHeader]);
  useEffect(() => { load(); const i = setInterval(load, 10000); return () => clearInterval(i); }, [load]);

  const unread = items.filter((n) => !n.isRead).length;

  const markRead = async (id) => { await fetch(`${API_BASE}/notifications/${id}/read`, { method: "PATCH", headers: authHeader() }); load(); };

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen((v) => !v)} style={{ fontSize: 13, padding: "6px 10px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer", position: "relative" }}>
        🔔{unread > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#a32d2d", color: "#fff", borderRadius: 999, fontSize: 10, padding: "1px 5px" }}>{unread}</span>}
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: 36, width: 260, maxHeight: 300, overflowY: "auto", background: "#fff", border: "0.5px solid #e3e1d9", borderRadius: 10, padding: 8, zIndex: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
          {items.length === 0 && <p style={{ fontSize: 12, color: "#767468" }}>Пока пусто.</p>}
          {items.map((n) => (
            <div key={n.id} onClick={() => markRead(n.id)} style={{ fontSize: 12, padding: "6px 4px", borderBottom: "0.5px solid #efede4", background: n.isRead ? "transparent" : "#F5F4FF", cursor: "pointer" }}>
              <p style={{ margin: 0, color: "#1a1a18" }}>{n.message}</p>
              <span style={{ color: "#9a988c" }}>{new Date(n.createdAt).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TechnicianView({ authHeader, onLogout, name, isSenior }) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ inProgress: 0, completedToday: 0, earnedToday: 0 });
  const [viewAll, setViewAll] = useState(false);

  const load = useCallback(async () => {
    const query = viewAll ? "?all=true" : "";
    const [tasksRes, statsRes] = await Promise.all([
      fetch(`${API_BASE}/tasks/mine${query}`, { headers: authHeader() }),
      fetch(`${API_BASE}/tasks/stats`, { headers: authHeader() }),
    ]);
    if (tasksRes.ok) setTasks(await tasksRes.json());
    if (statsRes.ok) setStats(await statsRes.json());
  }, [authHeader, viewAll]);

  useEffect(() => { load(); const i = setInterval(load, 5000); return () => clearInterval(i); }, [load]);

  const act = async (orderId, taskType, action) => { const res = await fetch(`${API_BASE}/tasks/${orderId}/${taskType}/${action}`, { method: "PATCH", headers: authHeader() }); if (res.ok) load(); };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", fontFamily: "system-ui, sans-serif", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><span style={{ fontWeight: 500, fontSize: 15 }}>{name}</span><span style={{ fontSize: 12, color: "#767468", marginLeft: 8 }}>Техник</span></div>
        <button onClick={onLogout} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>Выйти</button>
      </div>
      {isSenior && (
        <div style={{ display: "flex", gap: 4, background: "#efede4", borderRadius: 999, padding: 3 }}>
          <button onClick={() => setViewAll(false)} style={{ flex: 1, fontSize: 13, padding: "8px 0", borderRadius: 999, border: "none", cursor: "pointer", background: !viewAll ? "#fff" : "transparent", fontWeight: !viewAll ? 500 : 400 }}>Моя очередь</button>
          <button onClick={() => setViewAll(true)} style={{ flex: 1, fontSize: 13, padding: "8px 0", borderRadius: 999, border: "none", cursor: "pointer", background: viewAll ? "#fff" : "transparent", fontWeight: viewAll ? 500 : 400 }}>Вся смена</button>
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, border: "0.5px solid #e3e1d9", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 600 }}>{stats.inProgress}</div><div style={{ fontSize: 11, color: "#767468" }}>в работе</div></div>
        <div style={{ flex: 1, border: "0.5px solid #e3e1d9", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 600 }}>{stats.completedToday}</div><div style={{ fontSize: 11, color: "#767468" }}>сегодня готово</div></div>
        <div style={{ flex: 1, border: "0.5px solid #e3e1d9", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 600 }}>{stats.earnedToday} ₽</div><div style={{ fontSize: 11, color: "#767468" }}>заработано</div></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tasks.length === 0 && <p style={{ fontSize: 13, color: "#767468" }}>Пока нет назначенных задач.</p>}
        {tasks.map((t) => (
          <div key={`${t.orderId}-${t.taskType}`} style={{ border: "0.5px solid #e3e1d9", borderRadius: 12, padding: "14px 16px", background: "#fff", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 500, fontSize: 15 }}>{t.patient}</span><span style={{ fontSize: 12, color: "#767468" }}>до {formatDue(t.dueDate)}</span></div>
            <p style={{ fontSize: 13, color: "#767468", margin: 0 }}>{t.clinic} · {t.workType} · {TASK_LABELS[t.taskType]}{t.technicianName ? ` · ${t.technicianName}` : ""}</p>
            <p style={{ fontSize: 12, color: "#9a988c", margin: 0 }}>Кол-во: {t.quantity ?? "—"}{t.mine !== false ? ` · Сумма: ${t.price ?? "—"} ₽` : ""}</p>
            <div style={{ display: "flex", gap: 8 }}>
              {t.mine === false ? (
                <span style={{ flex: 1, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#767468" }}>{TASK_STATUS_LABEL[t.status] || t.status}</span>
              ) : (
                <>
                  {t.status === "pending" && <button onClick={() => act(t.orderId, t.taskType, "start")} style={{ flex: 1, height: 34, borderRadius: 8, border: "none", background: "#1a1a18", color: "#fff", fontSize: 13, cursor: "pointer" }}>Взять в работу</button>}
                  {t.status === "in_progress" && <button onClick={() => act(t.orderId, t.taskType, "complete")} style={{ flex: 1, height: 34, borderRadius: 8, border: "none", background: "#1a1a18", color: "#fff", fontSize: 13, cursor: "pointer" }}>Завершить</button>}
                  {t.status === "done" && <span style={{ flex: 1, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#27500A", background: "#EAF3DE", borderRadius: 8 }}>Готово</span>}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourierView({ authHeader, onLogout, name }) {
  const [deliveries, setDeliveries] = useState([]);
  const load = useCallback(() => { fetch(`${API_BASE}/deliveries`, { headers: authHeader() }).then((res) => res.ok ? res.json() : []).then(setDeliveries); }, [authHeader]);
  useEffect(() => { load(); const i = setInterval(load, 6000); return () => clearInterval(i); }, [load]);

  const setStatus = async (id, status) => { await fetch(`${API_BASE}/deliveries/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ status }) }); load(); };

  const nextAction = { assigned: ["en_route", "В пути"], en_route: ["arrived", "На месте"], arrived: ["picked_up", "Забрал/Доставил"], picked_up: ["delivered", "Доставлено"] };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", fontFamily: "system-ui, sans-serif", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><span style={{ fontWeight: 500, fontSize: 15 }}>{name}</span><span style={{ fontSize: 12, color: "#767468", marginLeft: 8 }}>Курьер</span></div>
        <button onClick={onLogout} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>Выйти</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {deliveries.length === 0 && <p style={{ fontSize: 13, color: "#767468" }}>На сегодня доставок нет.</p>}
        {deliveries.filter((d) => d.status !== "delivered").map((d) => {
          const action = nextAction[d.status];
          return (
            <div key={d.id} style={{ border: "0.5px solid #e3e1d9", borderRadius: 12, padding: "14px 16px", background: "#fff", display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontWeight: 500, fontSize: 15 }}>{d.patient} · {d.clinic}</span>
              <p style={{ fontSize: 13, color: "#767468", margin: 0 }}>{d.deliveryType === "pickup_impression" ? "Забор слепка" : "Доставка готового"}</p>
              <p style={{ fontSize: 13, color: "#767468", margin: 0 }}>{d.address}</p>
              <span style={{ fontSize: 12, color: "#9a988c" }}>Статус: {DELIVERY_STATUS_LABEL[d.status] || d.status}</span>
              {action && <button onClick={() => setStatus(d.id, action[0])} style={{ height: 36, borderRadius: 8, border: "none", background: "#1a1a18", color: "#fff", fontSize: 13, cursor: "pointer" }}>{action[1]}</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DentalLabTracker() {
  const [session, setSession] = useState(() => { const saved = localStorage.getItem("kiln-lab-session"); return saved ? JSON.parse(saved) : null; });
  const [orders, setOrders] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [priceList, setPriceList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState("orders");
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [boardView, setBoardView] = useState(false);
  const [duplicateFrom, setDuplicateFrom] = useState(null);
  const [deliveryModalOrderId, setDeliveryModalOrderId] = useState(null);

  const authHeader = useCallback(() => ({ Authorization: `Bearer ${session?.token}` }), [session]);

  const loadOrders = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`${API_BASE}/orders`, { headers: authHeader() });
      if (res.status === 401) { setSession(null); localStorage.removeItem("kiln-lab-session"); return; }
      if (!res.ok) throw new Error("failed");
      setOrders(await res.json()); setLoadError("");
    } catch (err) { setLoadError("Нет связи с сервером."); }
  }, [session, authHeader]);

  const loadDoctors = useCallback(async () => { if (!session) return; try { const res = await fetch(`${API_BASE}/doctors`, { headers: authHeader() }); if (res.ok) setDoctors(await res.json()); } catch (err) {} }, [session, authHeader]);
  const loadTechnicians = useCallback(async () => { if (!session) return; try { const res = await fetch(`${API_BASE}/technicians`, { headers: authHeader() }); if (res.ok) setTechnicians(await res.json()); } catch (err) {} }, [session, authHeader]);
  const loadCouriers = useCallback(async () => { if (!session) return; try { const res = await fetch(`${API_BASE}/couriers`, { headers: authHeader() }); if (res.ok) setCouriers(await res.json()); } catch (err) {} }, [session, authHeader]);
  const loadPriceList = useCallback(async () => { if (!session) return; try { const res = await fetch(`${API_BASE}/price-list`, { headers: authHeader() }); if (res.ok) setPriceList(await res.json()); } catch (err) {} }, [session, authHeader]);

  useEffect(() => {
    if (!session || session.role === "technician" || session.role === "courier") return;
    loadOrders(); loadDoctors(); loadPriceList();
    if (session.role === "lab") { loadTechnicians(); loadCouriers(); }
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [session, loadOrders, loadDoctors, loadTechnicians, loadCouriers, loadPriceList]);

  const handleLogin = (data) => { setSession(data); localStorage.setItem("kiln-lab-session", JSON.stringify(data)); };
  const handleLogout = () => { setSession(null); setOrders([]); localStorage.removeItem("kiln-lab-session"); };

  const advance = async (id) => { const res = await fetch(`${API_BASE}/orders/${id}/advance`, { method: "PATCH", headers: authHeader() }); if (res.ok) loadOrders(); };
  const assign = async (orderId, taskType, data) => { const res = await fetch(`${API_BASE}/orders/${orderId}/assign`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ taskType, ...data }) }); if (res.ok) loadOrders(); };
  const addDoctor = async (name) => { const res = await fetch(`${API_BASE}/doctors`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ name }) }); if (res.ok) { const created = await res.json(); loadDoctors(); return created; } return null; };
  const addTechnician = async (name, password, isSenior) => { const res = await fetch(`${API_BASE}/technicians`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ name, password, isSenior }) }); if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.error || "Ошибка"); } loadTechnicians(); };
  const deleteTechnician = async (id) => { const res = await fetch(`${API_BASE}/technicians/${id}`, { method: "DELETE", headers: authHeader() }); if (res.ok) { loadTechnicians(); loadOrders(); } };
  const addCourier = async (name, password) => { const res = await fetch(`${API_BASE}/couriers`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ name, password }) }); if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.error || "Ошибка"); } loadCouriers(); };
  const savePrice = async (workType, taskType, price) => { const res = await fetch(`${API_BASE}/price-list`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ workType, taskType, price }) }); if (res.ok) loadPriceList(); };
  const createInvoice = async (orderId) => { await fetch(`${API_BASE}/orders/${orderId}/invoice`, { method: "POST", headers: authHeader() }); setView("invoices"); };
  const createDelivery = async (orderId, data) => { await fetch(`${API_BASE}/orders/${orderId}/delivery`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify(data) }); };

  const createOrder = async (data) => {
    const res = await fetch(`${API_BASE}/orders`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify(data) });
    if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.error || "Ошибка сервера"); }
    setShowForm(false); setDuplicateFrom(null); loadOrders();
  };

  const today = new Date().toISOString().slice(0, 10);
  const filteredOrders = orders.filter((o) => {
    if (stageFilter && o.stage !== stageFilter) return false;
    if (onlyOverdue && !(o.dueDate < today && o.stage !== "Отправлено")) return false;
    if (search.trim()) { const q = search.trim().toLowerCase(); if (!`${o.patient} ${o.clinic} ${o.doctor || ""}`.toLowerCase().includes(q)) return false; }
    return true;
  });

  const exportCsv = async () => {
    const res = await fetch(`${API_BASE}/orders/export.csv`, { headers: authHeader() });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "orders.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!session) return <AuthScreen onLogin={handleLogin} />;
  if (session.role === "technician") return <TechnicianView authHeader={authHeader} onLogout={handleLogout} name={session.name} isSenior={session.isSenior} />;
  if (session.role === "courier") return <CourierView authHeader={authHeader} onLogout={handleLogout} name={session.name} />;

  const labTabs = [
    ["orders", "Заказы"], ["clinics", "Клиники"], ["technicians", "Техники"], ["couriers", "Курьеры"],
    ["prices", "Прайс техникам"], ["clinicprices", "Прайс клиникам"], ["invoices", "Счета"], ["deliveries", "Доставки"],
    ["stats", "Статистика"], ["activity", "Активность"], ["audit", "Аудит"], ["plan", "Тариф"],
  ];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", fontFamily: "system-ui, sans-serif", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><span style={{ fontWeight: 500, fontSize: 15 }}>{session.name}</span><span style={{ fontSize: 12, color: "#767468", marginLeft: 8 }}>{session.role === "lab" ? "Лаборатория" : "Клиника"}</span></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <NotificationsBell authHeader={authHeader} />
          {session.role === "clinic" && view === "orders" && !showForm && <button onClick={() => setShowForm(true)} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>+ Новый заказ</button>}
          <button onClick={handleLogout} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", cursor: "pointer" }}>Выйти</button>
        </div>
      </div>

      {session.role === "lab" && (
        <div style={{ display: "flex", gap: 4, background: "#efede4", borderRadius: 999, padding: 3, flexWrap: "wrap" }}>
          {labTabs.map(([key, label]) => (
            <button key={key} onClick={() => setView(key)} style={{ flex: "1 1 auto", fontSize: 10, padding: "8px 4px", borderRadius: 999, border: "none", cursor: "pointer", background: view === key ? "#fff" : "transparent", fontWeight: view === key ? 500 : 400 }}>{label}</button>
          ))}
        </div>
      )}
      {session.role === "clinic" && (
        <div style={{ display: "flex", gap: 4, background: "#efede4", borderRadius: 999, padding: 3 }}>
          <button onClick={() => setView("orders")} style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 999, border: "none", cursor: "pointer", background: view === "orders" ? "#fff" : "transparent", fontWeight: view === "orders" ? 500 : 400 }}>Заказы</button>
          <button onClick={() => setView("invoices")} style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 999, border: "none", cursor: "pointer", background: view === "invoices" ? "#fff" : "transparent", fontWeight: view === "invoices" ? 500 : 400 }}>Счета</button>
        </div>
      )}

      {loadError && <span style={{ fontSize: 13, color: "#a32d2d" }}>{loadError}</span>}

      {view === "clinics" && <ClinicsPanel authHeader={authHeader} />}
      {view === "technicians" && <TechniciansPanel technicians={technicians} onAdd={addTechnician} onDelete={deleteTechnician} />}
      {view === "couriers" && <CouriersPanel couriers={couriers} onAdd={addCourier} />}
      {view === "prices" && <PriceListPanel priceList={priceList} onSave={savePrice} />}
      {view === "clinicprices" && <ClinicPriceBookPanel authHeader={authHeader} />}
      {view === "invoices" && <InvoicesPanel authHeader={authHeader} role={session.role} />}
      {view === "deliveries" && <DeliveriesPanel authHeader={authHeader} couriers={couriers} />}
      {view === "stats" && <StatsPanel authHeader={authHeader} />}
      {view === "activity" && <ActivityFeed authHeader={authHeader} />}
      {view === "audit" && <AuditLogPanel authHeader={authHeader} />}
      {view === "plan" && <PlanPanel authHeader={authHeader} />}

      {view === "orders" && (
        <>
          {showForm && <NewOrderForm doctors={doctors} onAddDoctor={addDoctor} onCreate={createOrder} onCancel={() => { setShowForm(false); setDuplicateFrom(null); }} initialValues={duplicateFrom} />}
          {deliveryModalOrderId && <DeliveryOrderModal orderId={deliveryModalOrderId} onClose={() => setDeliveryModalOrderId(null)} onCreated={createDelivery} />}

          <div style={{ display: "flex", gap: 8 }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск: пациент, клиника, врач" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={exportCsv} style={{ height: 36, padding: "0 12px", borderRadius: 8, border: "0.5px solid #c9c7bd", background: "transparent", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>Экспорт CSV</button>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} style={{ ...inputStyle, height: 32, flex: 1, minWidth: 140 }}>
              <option value="">Все этапы</option>{STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#767468" }}><input type="checkbox" checked={onlyOverdue} onChange={(e) => setOnlyOverdue(e.target.checked)} />Только просроченные</label>
            {session.role === "lab" && (
              <div style={{ display: "flex", gap: 4, background: "#efede4", borderRadius: 999, padding: 3 }}>
                <button onClick={() => setBoardView(false)} style={{ fontSize: 11, padding: "6px 10px", borderRadius: 999, border: "none", cursor: "pointer", background: !boardView ? "#fff" : "transparent", fontWeight: !boardView ? 500 : 400 }}>Список</button>
                <button onClick={() => setBoardView(true)} style={{ fontSize: 11, padding: "6px 10px", borderRadius: 999, border: "none", cursor: "pointer", background: boardView ? "#fff" : "transparent", fontWeight: boardView ? 500 : 400 }}>Канбан</button>
              </div>
            )}
          </div>

          {boardView && session.role === "lab" ? (
            <KanbanBoard orders={filteredOrders} technicians={technicians} priceList={priceList} authHeader={authHeader} onAdvance={advance} onAssign={assign} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredOrders.length === 0 && <p style={{ fontSize: 13, color: "#767468" }}>Ничего не найдено.</p>}
              {filteredOrders.map((o) => (
                <OrderCard
                  key={o.id} order={o} role={session.role} technicians={technicians} priceList={priceList} authHeader={authHeader}
                  onAdvance={advance} onAssign={assign}
                  onDuplicate={session.role === "clinic" ? (order) => { setDuplicateFrom({ patient: "", doctor: order.doctor, workType: order.workType, shade: order.shade, trayInfo: order.trayInfo, selectedTeeth: (order.toothPositions || "").split(",").map((s) => s.trim()).filter(Boolean).map(Number) }); setShowForm(true); } : null}
                  onCreateInvoice={session.role === "lab" ? createInvoice : null}
                  onArrangeDelivery={session.role === "lab" ? (id) => setDeliveryModalOrderId(id) : null}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

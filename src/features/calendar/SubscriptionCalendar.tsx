import React, { useState, useRef, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../../template/components/ui/modal";
import { useModal } from "../../template/hooks/useModal";
import PageMeta from "../../template/components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../template/components/ui/table";
import Badge from "../../template/components/ui/badge/Badge";
import { useFinancial } from "../../context/FinancialContext";

// --- MOCK DATA ---
const INITIAL_MOCK_DATA = [
  { id: "sub-1", name: "Spotify", amount: 120, billing_day: 15, frequency: "monthly", type: "subscription" },
  { id: "sub-2", name: "Amazon Prime", amount: 899, billing_day: 2, frequency: "yearly", type: "subscription" },
  { id: "service-1", name: "CFE (Luz)", amount: 400, billing_day: 5, frequency: "bimonthly", type: "service" },
  { id: "service-2", name: "Agua", amount: 250, billing_day: 12, frequency: "monthly", type: "service" },
  { id: "exp-1", name: "Declaración Anual", amount: 15000, billing_day: 30, frequency: "yearly", type: "expense" },
  { id: "exp-2", name: "Tenencia Vehicular", amount: 3500, billing_day: 15, frequency: "yearly", type: "expense" },
  { id: "exp-3", name: "Hipoteca", amount: 120000, billing_day: 1, frequency: "yearly", type: "expense" }
];

const SubscriptionCalendar: React.FC = () => {
  const [items, setItems] = useState(INITIAL_MOCK_DATA);
  const { isOpen, openModal, closeModal } = useModal();
  const { formatCurrency, currency } = useFinancial();
  
  // Modal Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    amount: "",
    billing_day: "",
    frequency: "monthly",
    type: "subscription"
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  // Generate Calendar Events based on the mock data
  const events = useMemo(() => {
    const evts: any[] = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    items.forEach((item) => {
      // In a real app we might calculate the exact date based on the user's timezone or frequency.
      // For this UI mockup, we project everything onto the current month for visibility.
      const day = String(item.billing_day).padStart(2, "0");
      
      // Color coding: Subscriptions in Primary, Services in Warning, Expenses in Danger
      let colorClass = "Primary";
      if (item.type === "service") colorClass = "Warning";
      if (item.type === "expense") colorClass = "Danger";

      evts.push({
        id: item.id,
        title: `${item.name} (${formatCurrency(item.amount)})`,
        start: `${year}-${month}-${day}`,
        allDay: true,
        extendedProps: {
          Calendar: colorClass,
          itemData: item,
        },
      });
    });
    return evts;
  }, [items]);

  // Calculate Annual Summaries
  const annualSummary = useMemo(() => {
    let totalServices = 0;
    let totalSubscriptions = 0;

    items.forEach(item => {
      let multiplier = 1;
      if (item.frequency === "monthly") multiplier = 12;
      if (item.frequency === "bimonthly") multiplier = 6;
      if (item.frequency === "yearly") multiplier = 1;
      
      const annualCost = item.amount * multiplier;
      
      if (item.type === "service") {
        totalServices += annualCost;
      } else {
        totalSubscriptions += annualCost;
      }
    });

    return {
      totalServices,
      totalSubscriptions,
      grandTotal: totalServices + totalSubscriptions
    };
  }, [items]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // When clicking a date, prefill the billing_day
    const dateObj = new Date(selectInfo.startStr);
    const day = dateObj.getDate() + 1; // +1 to adjust timezone issues locally if needed, but standardizing to 1-31
    
    resetForm();
    setFormData(prev => ({ ...prev, billing_day: String(day) }));
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const itemData = clickInfo.event.extendedProps.itemData;
    setFormData({
      id: itemData.id,
      name: itemData.name,
      amount: String(itemData.amount),
      billing_day: String(itemData.billing_day),
      frequency: itemData.frequency,
      type: itemData.type
    });
    setIsEditing(true);
    openModal();
  };

  const handleSave = () => {
    const newItem = {
      id: isEditing ? formData.id : `item-${Date.now()}`,
      name: formData.name,
      amount: Number(formData.amount) || 0,
      billing_day: Number(formData.billing_day) || 1,
      frequency: formData.frequency,
      type: formData.type
    };

    if (isEditing) {
      setItems(prev => prev.map(item => item.id === newItem.id ? newItem : item));
    } else {
      setItems(prev => [...prev, newItem]);
    }
    closeModal();
    resetForm();
  };

  const handleDelete = () => {
    if (isEditing && formData.id) {
      setItems(prev => prev.filter(item => item.id !== formData.id));
      closeModal();
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      amount: "",
      billing_day: "",
      frequency: "monthly",
      type: "subscription"
    });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    closeModal();
    resetForm();
  };

  const renderEventContent = (eventInfo: any) => {
    const colorClass = `fc-bg-${eventInfo.event.extendedProps.Calendar.toLowerCase()}`;
    return (
      <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm cursor-pointer`}>
        <div className="fc-daygrid-event-dot"></div>
        <div className="fc-event-time">{eventInfo.timeText}</div>
        <div className="fc-event-title font-medium truncate text-xs">
          {eventInfo.event.title}
        </div>
      </div>
    );
  };

  return (
    <>
      <PageMeta
        title="Calendario de Cargos | Finanzas IA"
        description="Seguimiento de cargos recurrentes y servicios."
      />
      
      <div className="flex flex-col gap-6">
        
        {/* Resumen Anual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Suscripciones (Anual)</h3>
            <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">
              {formatCurrency(annualSummary.totalSubscriptions)}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Servicios (Anual)</h3>
            <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">
              {formatCurrency(annualSummary.totalServices)}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-brand-500 p-6 text-white shadow-lg">
            <h3 className="text-sm font-medium text-white/80">Proyección Total (Anual)</h3>
            <p className="mt-2 text-3xl font-bold">
              {formatCurrency(annualSummary.grandTotal)}
            </p>
          </div>
        </div>

        {/* Calendar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="custom-calendar">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="es"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "addChargeButton",
              }}
              buttonText={{
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
              }}
              events={events}
              selectable={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              customButtons={{
                addChargeButton: {
                  text: "Agregar Cargo +",
                  click: () => {
                    resetForm();
                    openModal();
                  },
                },
              }}
            />
          </div>
        </div>
        
        {/* Desglose de Gastos Anuales */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Desglose de Gastos Anuales</h3>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Concepto</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Monto Anualizado</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Frecuencia</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tipo</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {items.filter(item => item.frequency === "yearly").map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-white/90 font-medium">{item.name}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatCurrency(item.amount)}</TableCell>
                      <TableCell className="px-5 py-4 text-start"><Badge size="sm" color="warning">Anual</Badge></TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 capitalize">{item.type === 'expense' ? 'Gasto Fijo' : item.type === 'subscription' ? 'Suscripción' : 'Servicio'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Adding/Editing */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-[500px] p-6 lg:p-8"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {isEditing ? "Editar Cargo Recurrente" : "Agregar Nuevo Cargo"}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Registra un nuevo servicio o suscripción para mantener tu proyección al día.
            </p>
          </div>
          
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Nombre del Servicio/Suscripción
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej. Netflix, Luz, Agua..."
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Monto Estimado ({currency})
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Día de Cobro (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.billing_day}
                  onChange={(e) => setFormData(prev => ({ ...prev, billing_day: e.target.value }))}
                  placeholder="Ej. 15"
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Frecuencia
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                >
                  <option value="monthly">Mensual</option>
                  <option value="bimonthly">Bimestral</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                >
                  <option value="subscription">Suscripción</option>
                  <option value="service">Servicio Básico</option>
                  <option value="expense">Gasto Fijo Anual</option>
                </select>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-3 mt-8 modal-footer sm:justify-end">
            {isEditing && (
              <button
                onClick={handleDelete}
                type="button"
                className="flex w-full justify-center rounded-lg border border-error-300 bg-white px-4 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50 dark:border-error-700 dark:bg-gray-800 dark:text-error-500 dark:hover:bg-error-900/30 sm:w-auto mr-auto"
              >
                Eliminar
              </button>
            )}
            <button
              onClick={handleCloseModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              type="button"
              className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              {isEditing ? "Guardar Cambios" : "Agregar Cargo"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SubscriptionCalendar;

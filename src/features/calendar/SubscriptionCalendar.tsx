import React, { useState, useRef, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../../template/components/ui/modal";
import { useModal } from "../../template/hooks/useModal";
import PageMeta from "../../template/components/common/PageMeta";
import { useFinancial } from "../../context/FinancialContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../template/components/ui/table";
import Badge from "../../template/components/ui/badge/Badge";
// Custom Month Picker replaces flatpickr
import { CalenderIcon, AngleLeftIcon, AngleRightIcon } from "../../template/icons";

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
  const [summaryMode, setSummaryMode] = useState<"monthly" | "yearly">("yearly");
  
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
  const [calendarTitle, setCalendarTitle] = useState("");
  
  // Custom Month/Year Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempMonth, setTempMonth] = useState(new Date().getMonth());
  const [tempYear, setTempYear] = useState(new Date().getFullYear());

  const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const YEARS = Array.from({length: 10}, (_, i) => new Date().getFullYear() - 3 + i);

  useEffect(() => {
    if (showDatePicker && calendarRef.current) {
      calendarRef.current.getApi().gotoDate(new Date(tempYear, tempMonth, 1));
    }
  }, [tempMonth, tempYear, showDatePicker]);

  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();
  const handleToday = () => calendarRef.current?.getApi().today();

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

  // Calculate Summaries based on mode
  const projectedSummary = useMemo(() => {
    let totalServices = 0;
    let totalSubscriptions = 0;

    items.forEach(item => {
      let multiplier = 1;
      
      if (summaryMode === "yearly") {
        if (item.frequency === "monthly") multiplier = 12;
        if (item.frequency === "bimonthly") multiplier = 6;
        if (item.frequency === "yearly") multiplier = 1;
      } else {
        // monthly mode
        if (item.frequency === "monthly") multiplier = 1;
        if (item.frequency === "bimonthly") multiplier = 0.5; // Half of bimonthly cost per month
        if (item.frequency === "yearly") multiplier = 1 / 12; // 1/12th of yearly cost per month
      }
      
      const cost = item.amount * multiplier;
      
      if (item.type === "subscription") {
        totalSubscriptions += cost;
      } else {
        totalServices += cost;
      }
    });

    return {
      totalServices,
      totalSubscriptions,
      grandTotal: totalServices + totalSubscriptions
    };
  }, [items, summaryMode]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // When clicking a date, prefill the billing_day
    const dateObj = new Date(selectInfo.startStr);
    const day = dateObj.getDate() + 1; // +1 to adjust timezone issues locally if needed, but standardizing to 1-31
    
    resetForm();
    setFormData(prev => ({ ...prev, billing_day: String(day) }));
    openModal();
    selectInfo.view.calendar.unselect(); // Remove the blue highlight after clicking
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
        
        {/* Resumen Anual Cards Header & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Resumen de Proyección
          </h2>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
            <button
              onClick={() => setSummaryMode("monthly")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                summaryMode === "monthly" 
                  ? "bg-brand-500 text-white" 
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setSummaryMode("yearly")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                summaryMode === "yearly" 
                  ? "bg-brand-500 text-white" 
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Anual
            </button>
          </div>
        </div>

        {/* Resumen Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Suscripciones ({summaryMode === 'yearly' ? 'Anual' : 'Mensual'})</h3>
            <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">
              {formatCurrency(projectedSummary.totalSubscriptions)}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Servicios y Gastos ({summaryMode === 'yearly' ? 'Anual' : 'Mensual'})</h3>
            <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">
              {formatCurrency(projectedSummary.totalServices)}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-brand-500 p-6 text-white shadow-lg">
            <h3 className="text-sm font-medium text-white/80">Proyección Total ({summaryMode === 'yearly' ? 'Anual' : 'Mensual'})</h3>
            <p className="mt-2 text-3xl font-bold">
              {formatCurrency(projectedSummary.grandTotal)}
            </p>
          </div>
        </div>

        {/* Calendar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          
          {/* Custom Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4 px-2 pt-2">
            <div className="flex items-center gap-1">
              <button onClick={handlePrev} className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors">
                 <AngleLeftIcon className="size-4" />
              </button>
              <button onClick={handleNext} className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors">
                 <AngleRightIcon className="size-4" />
              </button>
              <button onClick={handleToday} className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-300 ml-2 transition-colors">
                Hoy
              </button>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => {
                  if (!showDatePicker && calendarRef.current) {
                    const d = calendarRef.current.getApi().getDate();
                    setTempMonth(d.getMonth());
                    setTempYear(d.getFullYear());
                  }
                  setShowDatePicker(!showDatePicker);
                }}
                className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] transition-colors cursor-pointer outline-none group"
                aria-label="Seleccionar fecha"
              >
                <CalenderIcon className="size-5 text-gray-600 dark:text-gray-300 group-hover:text-brand-500 transition-colors" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white/90 capitalize group-hover:text-brand-500 transition-colors">
                  {calendarTitle}
                </h2>
              </button>

              {/* Custom Month/Year Dropdown */}
              {showDatePicker && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDatePicker(false)}
                  />
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex text-center font-semibold text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-white/[0.05] pb-2 mb-2">
                      <div className="flex-1">Mes</div>
                      <div className="flex-1">Año</div>
                    </div>
                    <div className="flex h-48 overflow-hidden relative">
                       {/* Gradient overlays for the "wheel" effect */}
                       <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white dark:from-gray-900 to-transparent pointer-events-none z-10" />
                       <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none z-10" />
                       
                       {/* Months Column */}
                       <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
                         {MONTHS.map((month, idx) => (
                           <button 
                             key={month}
                             onClick={() => setTempMonth(idx)}
                             className={`block w-full py-2 text-center transition-all ${tempMonth === idx ? 'text-lg font-bold text-brand-500 scale-110' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                           >
                             {month}
                           </button>
                         ))}
                       </div>

                       {/* Years Column */}
                       <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
                         {YEARS.map(year => (
                           <button 
                             key={year}
                             onClick={() => setTempYear(year)}
                             className={`block w-full py-2 text-center transition-all ${tempYear === year ? 'text-lg font-bold text-brand-500 scale-110' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                           >
                             {year}
                           </button>
                         ))}
                       </div>
                    </div>
                    <button 
                      onClick={() => setShowDatePicker(false)} 
                      className="w-full mt-4 py-2 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-xl font-medium transition-colors"
                    >
                      Listo
                    </button>
                  </div>
                </>
              )}
            </div>

            <div>
              <button onClick={() => { resetForm(); openModal(); }} className="px-4 py-2 bg-brand-500 text-white rounded-lg font-medium text-sm hover:bg-brand-600 shadow-sm transition-colors">
                Agregar Cargo +
              </button>
            </div>
          </div>

          <div className="custom-calendar">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="es"
              headerToolbar={false}
              datesSet={(arg) => setCalendarTitle(arg.view.title)}
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
            />
          </div>
        </div>
        
        {/* Desglose de Gastos Anuales */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Desglose de Gastos Fijos ({summaryMode === 'yearly' ? 'Anual' : 'Mensual'})</h3>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Concepto</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Monto {summaryMode === 'yearly' ? 'Anualizado' : 'Mensualizado'}</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Frecuencia Original</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tipo</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {items.filter(item => item.frequency === "yearly").map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-white/90 font-medium">{item.name}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatCurrency(summaryMode === 'yearly' ? item.amount : item.amount / 12)}</TableCell>
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

import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventoInput, DateSelectArg, EventoClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";

interface CalendarioEvento extends EventoInput {
  extendedProps: {
    Calendario: string;
  };
}

const Calendario: React.FC = () => {
  const [selectedEvento, setSelectedEvento] = useState<CalendarioEvento | null>(
    null
  );
  const [EventoTitle, setEventoTitle] = useState("");
  const [EventoStartDate, setEventoStartDate] = useState("");
  const [EventoEndDate, setEventoEndDate] = useState("");
  const [EventoLevel, setEventoLevel] = useState("");
  const [Eventos, setEventos] = useState<CalendarioEvento[]>([]);
  const CalendarioRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const CalendariosEventos = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  useEffect(() => {
    // Initialize with some Eventos
    setEventos([
      {
        id: "1",
        title: "Evento Conf.",
        start: new Date().toISOString().split("T")[0],
        extendedProps: { Calendario: "Danger" },
      },
      {
        id: "2",
        title: "Meeting",
        start: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        extendedProps: { Calendario: "Success" },
      },
      {
        id: "3",
        title: "Workshop",
        start: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        end: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        extendedProps: { Calendario: "Primary" },
      },
    ]);
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventoStartDate(selectInfo.startStr);
    setEventoEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventoClick = (clickInfo: EventoClickArg) => {
    const Evento = clickInfo.Evento;
    setSelectedEvento(Evento as unknown as CalendarioEvento);
    setEventoTitle(Evento.title);
    setEventoStartDate(Evento.start?.toISOString().split("T")[0] || "");
    setEventoEndDate(Evento.end?.toISOString().split("T")[0] || "");
    setEventoLevel(Evento.extendedProps.Calendario);
    openModal();
  };

  const handleAddOrUpdateEvento = () => {
    if (selectedEvento) {
      // Update existing Evento
      setEventos((prevEventos) =>
        prevEventos.map((Evento) =>
          Evento.id === selectedEvento.id
            ? {
                ...Evento,
                title: EventoTitle,
                start: EventoStartDate,
                end: EventoEndDate,
                extendedProps: { Calendario: EventoLevel },
              }
            : Evento
        )
      );
    } else {
      // Add new Evento
      const newEvento: CalendarioEvento = {
        id: Date.now().toString(),
        title: EventoTitle,
        start: EventoStartDate,
        end: EventoEndDate,
        allDay: true,
        extendedProps: { Calendario: EventoLevel },
      };
      setEventos((prevEventos) => [...prevEventos, newEvento]);
    }
    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventoTitle("");
    setEventoStartDate("");
    setEventoEndDate("");
    setEventoLevel("");
    setSelectedEvento(null);
  };

  return (
    <>
      <PageMeta
        title="React.js Calendario Dashboard | Faid - Next.js Admin Dashboard Template"
        description="This is React.js Calendario Dashboard page for Faid - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-Calendario">
          <FullCalendar
            ref={CalendarioRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next addEventoButton",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            Eventos={Eventos}
            selectable={true}
            select={handleDateSelect}
            EventoClick={handleEventoClick}
            EventoContent={renderEventoContent}
            customButtons={{
              addEventoButton: {
                text: "Add Evento +",
                click: openModal,
              },
            }}
          />
        </div>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] p-6 lg:p-10"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                {selectedEvento ? "Edit Evento" : "Add Evento"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Plan your next big moment: schedule or edit an Evento to stay on
                track
              </p>
            </div>
            <div className="mt-8">
              <div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Evento Title
                  </label>
                  <input
                    id="Evento-title"
                    type="text"
                    value={EventoTitle}
                    onChange={(e) => setEventoTitle(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Evento Color
                </label>
                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                  {Object.entries(CalendariosEventos).map(([key, value]) => (
                    <div key={key} className="n-chk">
                      <div
                        className={`form-check form-check-${value} form-check-inline`}
                      >
                        <label
                          className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                          htmlFor={`modal${key}`}
                        >
                          <span className="relative">
                            <input
                              className="sr-only form-check-input"
                              type="radio"
                              name="Evento-level"
                              value={key}
                              id={`modal${key}`}
                              checked={EventoLevel === key}
                              onChange={() => setEventoLevel(key)}
                            />
                            <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                              <span
                                className={`h-2 w-2 rounded-full bg-white ${
                                  EventoLevel === key ? "block" : "hidden"
                                }`}
                              ></span>
                            </span>
                          </span>
                          {key}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Enter Start Date
                </label>
                <div className="relative">
                  <input
                    id="Evento-start-date"
                    type="date"
                    value={EventoStartDate}
                    onChange={(e) => setEventoStartDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Enter End Date
                </label>
                <div className="relative">
                  <input
                    id="Evento-end-date"
                    type="date"
                    value={EventoEndDate}
                    onChange={(e) => setEventoEndDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Close
              </button>
              <button
                onClick={handleAddOrUpdateEvento}
                type="button"
                className="btn btn-success btn-update-Evento flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
                {selectedEvento ? "Update Changes" : "Add Evento"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

const renderEventoContent = (EventoInfo: any) => {
  const colorClass = `fc-bg-${EventoInfo.Evento.extendedProps.Calendario.toLowerCase()}`;
  return (
    <div
      className={`Evento-fc-color flex fc-Evento-main ${colorClass} p-1 rounded-sm`}
    >
      <div className="fc-daygrid-Evento-dot"></div>
      <div className="fc-Evento-time">{EventoInfo.timeText}</div>
      <div className="fc-Evento-title">{EventoInfo.Evento.title}</div>
    </div>
  );
};

export default Calendario;

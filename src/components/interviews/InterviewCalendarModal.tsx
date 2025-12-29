"use client";

import { useState, useEffect } from "react";
import type { InterviewFormData, InterviewType } from "@/types/interviews";
import { useToast } from "@/contexts/ToastContext";

interface InterviewCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InterviewFormData) => Promise<void>;
  defaultTitle: string;
  jobOfferId: string;
}

type ViewMode = "month" | "week";

export default function InterviewCalendarModal({
  isOpen,
  onClose,
  onSave,
  defaultTitle,
  jobOfferId,
}: InterviewCalendarModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [title, setTitle] = useState<string>(defaultTitle);
  const [notes, setNotes] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [interviewType, setInterviewType] = useState<InterviewType>("video");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle);
      setSelectedDate(new Date());
      setSelectedTime("09:00");
      setNotes("");
      setLocation("");
      setInterviewType("video");
    }
  }, [isOpen, defaultTitle]);

  if (!isOpen) return null;

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast({
        type: "error",
        message: "El título es requerido",
      });
      return;
    }

    setLoading(true);
    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      await onSave({
        title: title.trim(),
        scheduled_at: scheduledAt,
        notes: notes.trim() || undefined,
        location: location.trim() || undefined,
        interview_type: interviewType,
        status: "scheduled",
      });

      showToast({
        type: "success",
        message: "Entrevista programada correctamente",
      });
      onClose();
    } catch (error) {
      console.error("Error saving interview:", error);
      showToast({
        type: "error",
        message: "Error al programar la entrevista",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getWeekDays = (date: Date) => {
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    weekStart.setDate(diff);

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      const days = direction === "prev" ? -7 : 7;
      newDate.setDate(prev.getDate() + days);
      return newDate;
    });
  };

  const monthDays = getDaysInMonth(selectedDate);
  const weekDays = getWeekDays(selectedDate);
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Programar Entrevista</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Section */}
            <div className="space-y-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setViewMode("month")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === "month"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Mes
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === "week"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Semana
                </button>
              </div>

              {/* Calendar */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => (viewMode === "month" ? navigateMonth("prev") : navigateWeek("prev"))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-600">chevron_left</span>
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {viewMode === "month"
                      ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
                      : `Semana del ${weekDays[0].getDate()} ${monthNames[weekDays[0].getMonth()]}`}
                  </h3>
                  <button
                    onClick={() => (viewMode === "month" ? navigateMonth("next") : navigateWeek("next"))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-600">chevron_right</span>
                  </button>
                </div>

                {/* Month View */}
                {viewMode === "month" && (
                  <div>
                    {/* Day names */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {dayNames.map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-semibold text-gray-500 py-2"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                      {monthDays.map((date, idx) => {
                        if (!date) {
                          return <div key={`empty-${idx}`} className="aspect-square" />;
                        }
                        return (
                          <button
                            key={date.toISOString()}
                            onClick={() => handleDateClick(date)}
                            className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                              isSelected(date)
                                ? "bg-primary text-white"
                                : isToday(date)
                                ? "bg-primary/10 text-primary border-2 border-primary"
                                : "hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Week View */}
                {viewMode === "week" && (
                  <div>
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {dayNames.map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-semibold text-gray-500 py-2"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((date) => (
                        <button
                          key={date.toISOString()}
                          onClick={() => handleDateClick(date)}
                          className={`p-3 rounded-lg text-sm font-medium transition-all ${
                            isSelected(date)
                              ? "bg-primary text-white"
                              : isToday(date)
                              ? "bg-primary/10 text-primary border-2 border-primary"
                              : "hover:bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            {dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                          </div>
                          <div className="text-lg font-bold">{date.getDate()}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hora
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                />
              </div>
            </div>

            {/* Form Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                  placeholder="Ej. Entrevista Senior UX Designer Google"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Entrevista
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                >
                  <option value="phone">Teléfono</option>
                  <option value="video">Videollamada</option>
                  <option value="in-person">Presencial</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ubicación / Enlace
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                  placeholder="Ej. Zoom, Google Meet, Oficina..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all resize-none"
                  placeholder="Notas adicionales sobre la entrevista..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={handleSkip}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Omitir
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Guardando..." : "Programar Entrevista"}
          </button>
        </div>
      </div>
    </div>
  );
}


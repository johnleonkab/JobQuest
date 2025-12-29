"use client";

import { useState, useEffect } from "react";
import type { ContactFormData, ContactChannel, ContactChannelType } from "@/types/contacts";
import { useToast } from "@/contexts/ToastContext";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContactFormData) => Promise<void>;
  jobOfferId: string;
  contact?: {
    id: string;
    name: string;
    email?: string;
    role?: string;
    contact_channels: ContactChannel[];
    notes?: string;
  } | null;
}

const CHANNEL_TYPES: { value: ContactChannelType; label: string; icon: string }[] = [
  { value: "email", label: "Email", icon: "email" },
  { value: "linkedin", label: "LinkedIn", icon: "link" },
  { value: "phone", label: "Teléfono", icon: "phone" },
  { value: "whatsapp", label: "WhatsApp", icon: "chat" },
  { value: "other", label: "Otro", icon: "more_horiz" },
];

export default function ContactModal({
  isOpen,
  onClose,
  onSave,
  jobOfferId,
  contact,
}: ContactModalProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    role: "",
    contact_channels: [],
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (contact) {
        setFormData({
          name: contact.name || "",
          email: contact.email || "",
          role: contact.role || "",
          contact_channels: contact.contact_channels || [],
          notes: contact.notes || "",
        });
      } else {
        setFormData({
          name: "",
          email: "",
          role: "",
          contact_channels: [],
          notes: "",
        });
      }
    }
  }, [isOpen, contact]);

  if (!isOpen) return null;

  const handleAddChannel = () => {
    setFormData({
      ...formData,
      contact_channels: [
        ...formData.contact_channels,
        { type: "email", value: "" },
      ],
    });
  };

  const handleRemoveChannel = (index: number) => {
    setFormData({
      ...formData,
      contact_channels: formData.contact_channels.filter((_, i) => i !== index),
    });
  };

  const handleUpdateChannel = (index: number, field: "type" | "value", value: string) => {
    const updatedChannels = [...formData.contact_channels];
    updatedChannels[index] = {
      ...updatedChannels[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      contact_channels: updatedChannels,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast({
        type: "error",
        message: "El nombre es requerido",
      });
      return;
    }

    setLoading(true);
    try {
      // Filter out empty channels
      const validChannels = formData.contact_channels.filter(
        (channel) => channel.value.trim() !== ""
      );

      await onSave({
        name: formData.name.trim(),
        email: formData.email?.trim() || undefined,
        role: formData.role?.trim() || undefined,
        contact_channels: validChannels,
        notes: formData.notes?.trim() || undefined,
      });

      showToast({
        type: "success",
        message: contact ? "Contacto actualizado correctamente" : "Contacto añadido correctamente",
      });
      onClose();
    } catch (error) {
      console.error("Error saving contact:", error);
      showToast({
        type: "error",
        message: "Error al guardar el contacto",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {contact ? "Editar Contacto" : "Añadir Persona de Contacto"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                placeholder="Ej. Juan Pérez"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                placeholder="ejemplo@empresa.com"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Rol
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                placeholder="Ej. Recruiter, HR Manager, Hiring Manager..."
              />
            </div>

            {/* Contact Channels */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Canales de Contacto
                </label>
                <button
                  type="button"
                  onClick={handleAddChannel}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Añadir Canal
                </button>
              </div>
              {formData.contact_channels.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No hay canales de contacto añadidos
                </p>
              ) : (
                <div className="space-y-3">
                  {formData.contact_channels.map((channel, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <select
                        value={channel.type}
                        onChange={(e) =>
                          handleUpdateChannel(index, "type", e.target.value)
                        }
                        className="flex-shrink-0 w-32 rounded-lg border-gray-200 bg-white text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-2 px-3 transition-all"
                      >
                        {CHANNEL_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={channel.value}
                        onChange={(e) =>
                          handleUpdateChannel(index, "value", e.target.value)
                        }
                        className="flex-1 rounded-lg border-gray-200 bg-white text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-2 px-3 transition-all"
                        placeholder={
                          channel.type === "email"
                            ? "email@ejemplo.com"
                            : channel.type === "linkedin"
                            ? "linkedin.com/in/perfil"
                            : channel.type === "phone"
                            ? "+34 600 000 000"
                            : channel.type === "whatsapp"
                            ? "+34 600 000 000"
                            : "Valor del canal"
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveChannel(index)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-500 hover:text-red-600"
                        title="Eliminar canal"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all resize-none"
                placeholder="Notas adicionales sobre este contacto..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Guardando..." : contact ? "Actualizar" : "Añadir Contacto"}
          </button>
        </div>
      </div>
    </div>
  );
}


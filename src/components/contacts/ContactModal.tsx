"use client";

import { useState, useEffect } from "react";
import type { ContactFormData, ContactChannel, ContactChannelType } from "@/types/contacts";
import { useToast } from "@/contexts/ToastContext";
import { useTranslations } from "next-intl";

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
  const t = useTranslations('contacts');

  const CHANNEL_TYPES: { value: ContactChannelType; label: string; icon: string }[] = [
    { value: "email", label: t('channelTypes.email'), icon: "email" },
    { value: "linkedin", label: t('channelTypes.linkedin'), icon: "link" },
    { value: "phone", label: t('channelTypes.phone'), icon: "phone" },
    { value: "whatsapp", label: t('channelTypes.whatsapp'), icon: "chat" },
    { value: "other", label: t('channelTypes.other'), icon: "more_horiz" },
  ];

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
        message: t('toasts.nameRequired'),
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
        message: contact ? t('toasts.successUpdate') : t('toasts.successAdd'),
      });
      onClose();
    } catch (error) {
      console.error("Error saving contact:", error);
      showToast({
        type: "error",
        message: t('toasts.errorSave'),
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
            {contact ? t('titleEdit') : t('titleAdd')}
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
                {t('labels.name')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                placeholder={t('placeholders.name')}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('labels.email')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                placeholder={t('placeholders.email')}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('labels.role')}
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                placeholder={t('placeholders.role')}
              />
            </div>

            {/* Contact Channels */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {t('labels.channels')}
                </label>
                <button
                  type="button"
                  onClick={handleAddChannel}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  {t('labels.addChannel')}
                </button>
              </div>
              {formData.contact_channels.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  {t('labels.noChannels')}
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
                            ? "email@example.com"
                            : channel.type === "linkedin"
                              ? "linkedin.com/in/profile"
                              : channel.type === "phone"
                                ? "+1234567890"
                                : channel.type === "whatsapp"
                                  ? "+1234567890"
                                  : t('placeholders.channelValue')
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveChannel(index)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-500 hover:text-red-600"
                        title="Delete channel"
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
                {t('labels.notes')}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all resize-none"
                placeholder={t('placeholders.notes')}
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
            {t('buttons.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? t('buttons.saving') : contact ? t('buttons.update') : t('buttons.save')}
          </button>
        </div>
      </div>
    </div>
  );
}



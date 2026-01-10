"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useGamification } from "@/hooks/useGamification";
import { ProfileSkeleton } from "@/components/LoadingSkeleton";
import { useTranslations } from "next-intl";

interface ProfileData {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  headline?: string;
  linkedin_url?: string;
  gender?: string;
  birth_date?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const { recordEvent } = useGamification();
  const t = useTranslations('CVBuilder.profile');
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    linkedinUrl: "",
    gender: "",
    birthDate: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setFormData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            headline: data.headline || "",
            linkedinUrl: data.linkedin_url || "",
            gender: data.gender || "",
            birthDate: data.birth_date || "",
          });
          if (data.avatar_url) {
            setAvatarPreview(data.avatar_url);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('title')}</h1>
            <p className="text-slate-600">{t('subtitle')}</p>
          </div>
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("first_name", formData.firstName);
      formDataToSend.append("last_name", formData.lastName);
      formDataToSend.append("headline", formData.headline);
      formDataToSend.append("linkedin_url", formData.linkedinUrl);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("birth_date", formData.birthDate);

      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile);
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: formDataToSend,
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        showToast({
          type: "success",
          message: t('success'),
        });
        // Registrar evento de gamificación
        await recordEvent("profile.updated");
      } else {
        console.error("Error updating profile");
        showToast({
          type: "error",
          message: t('error'),
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatar_url: null }),
      });

      if (response.ok) {
        setAvatarPreview(null);
        setAvatarFile(null);
        setProfile((prev) => (prev ? { ...prev, avatar_url: undefined } : null));
      }
    } catch (error) {
      console.error("Error removing avatar:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-500">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold text-slate-900">{t('title')}</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 sm:space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="size-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-4xl">
                  person
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                <span className="material-symbols-outlined text-lg">
                  photo_camera
                </span>
                {t('changePhoto')}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
              >
                <span className="material-symbols-outlined text-lg">
                  delete
                </span>
                {t('deletePhoto')}
              </button>
            )}
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {t('firstName')}
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {t('lastName')}
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Headline */}
        <div>
          <label
            htmlFor="headline"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            {t('headline')}
          </label>
          <input
            id="headline"
            type="text"
            value={formData.headline}
            onChange={(e) =>
              setFormData({ ...formData, headline: e.target.value })
            }
            placeholder={t('headlinePlaceholder')}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label
            htmlFor="linkedinUrl"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            {t('linkedinUrl')}
          </label>
          <input
            id="linkedinUrl"
            type="url"
            value={formData.linkedinUrl}
            onChange={(e) =>
              setFormData({ ...formData, linkedinUrl: e.target.value })
            }
            placeholder={t('linkedinPlaceholder')}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Gender */}
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            {t('gender')}
          </label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{t('select')}</option>
            <option value="male">{t('male')}</option>
            <option value="female">{t('female')}</option>
            <option value="other">{t('other')}</option>
            <option value="prefer_not_to_say">{t('preferNotToSay')}</option>
          </select>
        </div>

        {/* Birth Date */}
        <div>
          <label
            htmlFor="birthDate"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            {t('birthDate')}
          </label>
          <input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) =>
              setFormData({ ...formData, birthDate: e.target.value })
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50 min-h-[44px]"
          >
            {submitting ? t('saving') : t('saveBtn')}
          </button>
        </div>
      </form>
    </div>
  );
}


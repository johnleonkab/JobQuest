"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}


export default function HelpPage() {
  const t = useTranslations('CVBuilder.help');
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const categories = [
    { id: "all", label: t('categories.all'), icon: "apps" },
    { id: "empezando", label: t('categories.empezando'), icon: "rocket_launch" },
    { id: "cv-builder", label: t('categories.cv-builder'), icon: "description" },
    { id: "job-offers", label: t('categories.job-offers'), icon: "work" },
    { id: "gamificacion", label: t('categories.gamificacion'), icon: "emoji_events" },
    { id: "ai-features", label: t('categories.ai-features'), icon: "smart_toy" },
    { id: "troubleshooting", label: t('categories.troubleshooting'), icon: "help" },
  ];

  const faqData: FAQItem[] = [
    // Empezando
    {
      question: t('faqs.account-create.q'),
      answer: t('faqs.account-create.a'),
      category: "empezando",
    },
    {
      question: t('faqs.profile-complete.q'),
      answer: t('faqs.profile-complete.a'),
      category: "empezando",
    },
    {
      question: t('faqs.password-change.q'),
      answer: t('faqs.password-change.a'),
      category: "empezando",
    },
    // CV Builder
    {
      question: t('faqs.cv-create.q'),
      answer: t('faqs.cv-create.a'),
      category: "cv-builder",
    },
    {
      question: t('faqs.cv-export.q'),
      answer: t('faqs.cv-export.a'),
      category: "cv-builder",
    },
    {
      question: t('faqs.cv-ai.q'),
      answer: t('faqs.cv-ai.a'),
      category: "cv-builder",
    },
    {
      question: t('faqs.ai-insights.q'),
      answer: t('faqs.ai-insights.a'),
      category: "cv-builder",
    },
    // Job Offers
    {
      question: t('faqs.job-add.q'),
      answer: t('faqs.job-add.a'),
      category: "job-offers",
    },
    {
      question: t('faqs.job-status.q'),
      answer: t('faqs.job-status.a'),
      category: "job-offers",
    },
    {
      question: t('faqs.interview-schedule.q'),
      answer: t('faqs.interview-schedule.a'),
      category: "job-offers",
    },
    {
      question: t('faqs.contact-add.q'),
      answer: t('faqs.contact-add.a'),
      category: "job-offers",
    },
    {
      question: t('faqs.job-filter.q'),
      answer: t('faqs.job-filter.a'),
      category: "job-offers",
    },
    // Gamificación
    {
      question: t('faqs.xp-works.q'),
      answer: t('faqs.xp-works.a'),
      category: "gamificacion",
    },
    {
      question: t('faqs.level-up.q'),
      answer: t('faqs.level-up.a'),
      category: "gamificacion",
    },
    {
      question: t('faqs.badges-what.q'),
      answer: t('faqs.badges-what.a'),
      category: "gamificacion",
    },
    {
      question: t('faqs.badges-view.q'),
      answer: t('faqs.badges-view.a'),
      category: "gamificacion",
    },
    // AI Features
    {
      question: t('faqs.ai-insights-what.q'),
      answer: t('faqs.ai-insights-what.a'),
      category: "ai-features",
    },
    {
      question: t('faqs.ai-recommender.q'),
      answer: t('faqs.ai-recommender.a'),
      category: "ai-features",
    },
    // Troubleshooting
    {
      question: t('faqs.login-issue.q'),
      answer: t('faqs.login-issue.a'),
      category: "troubleshooting",
    },
    {
      question: t('faqs.save-issue.q'),
      answer: t('faqs.save-issue.a'),
      category: "troubleshooting",
    },
    {
      question: t('faqs.account-delete.q'),
      answer: t('faqs.account-delete.a'),
      category: "troubleshooting",
    },
    {
      question: t('faqs.data-export.q'),
      answer: t('faqs.data-export.a'),
      category: "troubleshooting",
    },
    {
      question: t('faqs.contact-support.q'),
      answer: t('faqs.contact-support.a'),
      category: "troubleshooting",
    },
  ];

  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-lg text-slate-600">
            {t('subtitle')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-3 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/cv-builder"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-2xl">
                description
              </span>
            </div>
            <div>
              <div className="font-semibold text-slate-900">{t('quickLinks.cvBuilder.title')}</div>
              <div className="text-sm text-slate-600">{t('quickLinks.cvBuilder.description')}</div>
            </div>
          </Link>

          <Link
            href="/job-openings"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined text-2xl">work</span>
            </div>
            <div>
              <div className="font-semibold text-slate-900">{t('quickLinks.jobOpenings.title')}</div>
              <div className="text-sm text-slate-600">{t('quickLinks.jobOpenings.description')}</div>
            </div>
          </Link>

          <Link
            href="/gamification"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex size-12 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
              <span className="material-symbols-outlined text-2xl">
                emoji_events
              </span>
            </div>
            <div>
              <div className="font-semibold text-slate-900">{t('quickLinks.gamification.title')}</div>
              <div className="text-sm text-slate-600">{t('quickLinks.gamification.description')}</div>
            </div>
          </Link>

          <Link
            href="/privacy-settings"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex size-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <span className="material-symbols-outlined text-2xl">
                privacy_tip
              </span>
            </div>
            <div>
              <div className="font-semibold text-slate-900">{t('quickLinks.privacy.title')}</div>
              <div className="text-sm text-slate-600">{t('quickLinks.privacy.description')}</div>
            </div>
          </Link>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${selectedCategory === category.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {category.icon}
                </span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {t('faqTitle')}
          </h2>
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">
                  search_off
                </span>
                <p className="text-slate-600">
                  {t('noResults')}
                </p>
              </div>
            ) : (
              filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedFAQ(expandedFAQ === index ? null : index)
                    }
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                  >
                    <h3 className="font-semibold text-slate-900 pr-4">
                      {faq.question}
                    </h3>
                    <span
                      className={`material-symbols-outlined text-slate-400 transition-transform ${expandedFAQ === index ? "rotate-180" : ""
                        }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-6 pb-6 pt-0">
                      <p className="text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-br from-primary/10 to-purple-100 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            {t('contactTitle')}
          </h2>
          <p className="text-slate-600 mb-6">
            {t('contactSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              <span className="material-symbols-outlined">description</span>
              {t('links.privacy')}
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              <span className="material-symbols-outlined">gavel</span>
              {t('links.terms')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



import { useLanguage } from "@/utils/LanguageContext";
import { CheckCircle2, ChevronDown, ChevronUp, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import React, { useState } from "react";

const ContactPage = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = t("contact.faq.items");

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const INFO_ITEMS = [
    { icon: <Phone className="w-5 h-5" />, label: t("contact.info.phone"), value: t("contact.info.phoneValue") },
    { icon: <Mail className="w-5 h-5" />, label: t("contact.info.email"), value: t("contact.info.emailValue") },
    { icon: <MapPin className="w-5 h-5" />, label: t("contact.info.address"), value: t("contact.info.addressValue") },
    { icon: <Clock className="w-5 h-5" />, label: t("contact.info.hours"), value: t("contact.info.hoursValue") },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-slate-900 py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">{t("contact.title")}</h1>
          <p className="text-slate-400 max-w-xl mx-auto">{t("contact.subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{t("contact.form.title")}</h2>

            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-(--main) mb-4" />
                <p className="text-slate-700 font-medium max-w-md">{t("contact.form.success")}</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 text-sm text-(--main) font-semibold hover:underline"
                >
                  {t("common.close")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("contact.form.name")}</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder={t("contact.form.namePlaceholder")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("contact.form.email")}</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder={t("contact.form.emailPlaceholder")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("contact.form.phone")}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder={t("contact.form.phonePlaceholder")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("contact.form.subject")}</label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder={t("contact.form.subjectPlaceholder")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("contact.form.message")}</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder={t("contact.form.messagePlaceholder")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 bg-(--main) hover:bg-[#52DBA9] disabled:opacity-60 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg shadow-(--main)/20 active:scale-95"
                >
                  {sending ? (
                    <span className="animate-spin border-2 border-white/30 border-t-white w-4 h-4 rounded-full" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {sending ? t("contact.form.sending") : t("contact.form.submit")}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">{t("contact.info.title")}</h2>
              <div className="space-y-5">
                {INFO_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#ECFDF5] rounded-xl flex items-center justify-center text-(--main) shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                      <p className="text-sm text-slate-700 font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-52">
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <MapPin className="w-10 h-10 mx-auto mb-2 text-(--main)" />
                  <p className="text-sm font-medium">Cần Thơ, Việt Nam</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">{t("contact.faq.title")}</h2>
          <div className="space-y-3">
            {Array.isArray(faqs) && faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-slate-800 text-sm pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-(--main) shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-gray-50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

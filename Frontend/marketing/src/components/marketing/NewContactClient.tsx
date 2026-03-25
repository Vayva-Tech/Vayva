"use client";

import React, { useState } from "react";
import { Button, Icon } from "@vayva/ui";
import { motion } from "framer-motion";
import {
  IconBrandX as Twitter,
  IconBrandLinkedin as Linkedin,
  IconBrandInstagram as Instagram,
} from "@tabler/icons-react";
import { contactContent } from "@/data/marketing-content";
import { MarketingSnapItem, MarketingSnapRow } from "@/components/marketing/MarketingSnapRow";

const SOCIAL_ICONS = {
  Twitter,
  LinkedIn: Linkedin,
  Instagram,
};

type SocialKey = keyof typeof SOCIAL_ICONS;

type FormStatus = "idle" | "submitting" | "success" | "error";

export function NewContactClient(): React.JSX.Element {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
        website: "",
      });
    } catch (error: unknown) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="relative w-full min-w-0 overflow-x-hidden py-24 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto px-2 sm:px-6 min-w-0">
        <div className="text-center max-w-3xl mx-auto px-1">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900"
          >
            {contactContent.heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-base sm:text-lg text-slate-600"
          >
            <span className="lg:hidden">Support, sales, and partnerships—pick a channel below.</span>
            <span className="hidden lg:inline">{contactContent.heroDescription}</span>
          </motion.p>
        </div>

        <div className="mt-16 grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-12 min-w-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 min-w-0"
          >
            <div className="hidden lg:block space-y-8">
              {contactContent.sections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{section.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{section.description}</p>
                  {section.email && (
                    <a
                      href={`mailto:${section.email}`}
                      className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      {section.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
            <div className="lg:hidden -mx-1">
              <MarketingSnapRow
                ariaLabel="Contact options"
                hint="Swipe for support, inquiries, office"
                showDots
                dotCount={contactContent.sections.length}
              >
                {contactContent.sections.map((section) => (
                  <MarketingSnapItem key={section.title}>
                    <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm h-full">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{section.title}</h3>
                      <p className="text-sm text-slate-600 mb-3 leading-relaxed">{section.description}</p>
                      {section.email && (
                        <a
                          href={`mailto:${section.email}`}
                          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          {section.email}
                        </a>
                      )}
                    </div>
                  </MarketingSnapItem>
                ))}
              </MarketingSnapRow>
            </div>

            <div className="flex gap-3 justify-center lg:justify-start">
              {contactContent.socials.map((social) => {
                const IconComponent = SOCIAL_ICONS[social.label as SocialKey];

                if (!IconComponent) return null;

                return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="w-11 h-11 rounded-full border border-slate-200/80 bg-white flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:border-slate-300 transition-all shadow-sm"
                      aria-label={social.label}
                    >
                      <IconComponent size={18} />
                    </a>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-[32px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm min-w-0"
          >
            {status === "success" ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <Icon name="Check" size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">Ticket Opened!</h3>
                <p className="text-slate-600 max-w-sm mx-auto mb-8">
                  Thank you for reaching out. A support ticket has been created and we’ve sent a confirmation to your email address.
                </p>
                <Button
                  onClick={() => setStatus("idle")}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    type="text"
                    id="contact-website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-firstName" className="text-sm font-semibold text-slate-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="contact-firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full h-12 rounded-xl bg-white/70 border border-slate-200 px-4 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-lastName" className="text-sm font-semibold text-slate-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="contact-lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full h-12 rounded-xl bg-white/70 border border-slate-200 px-4 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-email" className="text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full h-12 rounded-xl bg-white/70 border border-slate-200 px-4 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="john@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-subject" className="text-sm font-semibold text-slate-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full h-12 rounded-xl bg-white/70 border border-slate-200 px-4 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="How can we help?"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-sm font-semibold text-slate-700">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full h-32 rounded-xl bg-white/70 border border-slate-200 p-4 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? "Sending..." : "Send Message"}
                </Button>
                {status === "error" && (
                  <p role="alert" aria-live="assertive" className="text-rose-600 text-center text-sm font-semibold">
                    Something went wrong. Please try again or email us directly.
                  </p>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

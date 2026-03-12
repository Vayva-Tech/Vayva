"use client";

import React from "react";
import { Button, Icon } from "@vayva/ui";

interface ContactClientProps {
  contact: {
    email?: string;
    phone?: string;
    businessHours?: string;
    address?: string;
  } | null;
}

export function ContactClient({ contact }: ContactClientProps) {
  return (
    <div className="bg-background/70 backdrop-blur-xl min-h-screen">
      <div className="max-w-[1280px] mx-auto px-6 py-24 md:py-32 lg:flex lg:gap-20">
        {/* Left Side: Contact Info */}
        <div className="lg:w-1/3 mb-16 lg:mb-0">
          <div className="inline-block px-3 py-1 bg-background/40 backdrop-blur-sm rounded-full text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-[0.2em]">
            GET IN TOUCH
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#0B0B0B] mb-8 tracking-tighter font-serif">
            Contact Us
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed font-medium mb-12">
            Have a question about your order or our products? We're here to help
            you.
          </p>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-background/40 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                <Icon name="Mail" size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Email Us
                </p>
                <a
                  href={`mailto:${contact?.email || "support@vayva.ng"}`}
                  className="text-black font-bold hover:underline break-all"
                >
                  {contact?.email || "support@vayva.ng"}
                </a>
              </div>
            </div>

            {contact?.phone && (
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-background/40 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                  <Icon name="Phone" size={20} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Call Us
                  </p>
                  <p className="text-black font-bold">{contact.phone}</p>
                </div>
              </div>
            )}

            {contact?.businessHours && (
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-background/40 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                  <Icon name="Clock" size={20} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Operating Hours
                  </p>
                  <p className="text-black font-bold">
                    {contact.businessHours}
                  </p>
                </div>
              </div>
            )}

            {contact?.address && (
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-background/40 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                  <Icon name="MapPin" size={20} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Location
                  </p>
                  <p className="text-black font-bold">{contact.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="flex-1 max-w-[700px]">
          <div className="p-8 md:p-12 bg-background/40 backdrop-blur-sm rounded-[40px] border border-gray-100">
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label
                    htmlFor="contact-name"
                    className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1"
                  >
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="John Doe"
                    className="w-full h-14 bg-background/70 backdrop-blur-xl rounded-2xl border border-gray-100 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="contact-email"
                    className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="john@example.com"
                    className="w-full h-14 bg-background/70 backdrop-blur-xl rounded-2xl border border-gray-100 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="contact-order-number"
                  className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1"
                >
                  Order Number (Optional)
                </label>
                <input
                  id="contact-order-number"
                  type="text"
                  placeholder="#12345"
                  className="w-full h-14 bg-background/70 backdrop-blur-xl rounded-2xl border border-gray-100 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="contact-message"
                  className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  className="w-full min-h-[180px] bg-background/70 backdrop-blur-xl rounded-3xl border border-gray-100 p-6 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow resize-none"
                  placeholder="How can we help you today?"
                ></textarea>
              </div>

              <Button className="w-full !h-16 !rounded-2xl !bg-black !text-white text-lg font-bold shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-1 transition-all">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

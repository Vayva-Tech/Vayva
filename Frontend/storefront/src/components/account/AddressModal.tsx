"use client";

import { useState } from "react";
import { LocaleKey, LOCALES } from "@/data/locales";
import { X, MapPin } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";

interface AddressModalProps {
  lang: LocaleKey;
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (address: any) => void;
}

export function AddressModal({
  lang,
  isOpen,
  onClose,
  onSave,
}: AddressModalProps) {
  const t = LOCALES[lang].account.addresses.form;

  // Form State
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      city,
      district,
      neighborhood,
      address,
      notes,
      isDefault: false,
    });
    // Reset
    setTitle("");
    setDistrict("");
    setNeighborhood("");
    setAddress("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MapPin size={20} />
            {t.titleAdd}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors h-auto"
            aria-label="Close address modal"
          >
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="address-title"
              className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
            >
              {t.titleLabel}
            </label>
            <input
              id="address-title"
              required
              type="text"
              value={title}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e: any) => setTitle(e.target.value)}
              placeholder="Ev, İş, Annemler..."
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="address-city"
                className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
              >
                {t.city}
              </label>
              <select
                id="address-city"
                value={city}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => setCity(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-medium"
              >
                <option value="İstanbul">İstanbul</option>
                <option value="Ankara">Ankara</option>
                <option value="İzmir">İzmir</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="address-district"
                className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
              >
                {t.district}
              </label>
              <input
                id="address-district"
                required
                type="text"
                value={district}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => setDistrict(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="address-neighborhood"
              className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
            >
              {t.neighborhood}
            </label>
            <input
              id="address-neighborhood"
              required
              type="text"
              value={neighborhood}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e: any) => setNeighborhood(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl"
            />
          </div>

          <div>
            <label
              htmlFor="address-details"
              className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
            >
              {t.address}
            </label>
            <textarea
              id="address-details"
              required
              rows={3}
              value={address}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e: any) => setAddress(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="address-notes"
              className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
            >
              {t.notes}
            </label>
            <input
              id="address-notes"
              type="text"
              value={notes}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e: any) => setNotes(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-xl h-auto"
              aria-label="Cancel"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              className="flex-1 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors h-auto"
              aria-label="Save address"
            >
              {t.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

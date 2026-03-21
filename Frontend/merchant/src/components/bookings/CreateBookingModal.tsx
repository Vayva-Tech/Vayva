"use client";

import { useState } from "react";
import { Button, Modal } from "@vayva/ui";
import { Plus } from "@phosphor-icons/react/ssr";
import { BookingForm } from "./BookingForm";

interface CreateBookingModalProps {
  services: { id: string; name: string }[];
  customers: { id: string; name: string }[];
}

export function CreateBookingModal({
  services,
  customers,
}: CreateBookingModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2" size={16} /> New Booking
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Booking"
        className="max-w-xl"
      >
        <BookingForm
          services={services}
          customers={customers}
          onSuccess={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
}

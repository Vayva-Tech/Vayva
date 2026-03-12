"use client";

import { useState } from "react";
import { Button, Modal } from "@vayva/ui";
import { Plus } from "@phosphor-icons/react/ssr";
import { RealEstateForm } from "./RealEstateForm";

export function CreatePropertyModal({
  isFirst = false,
}: {
  isFirst?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2" size={16} />{" "}
        {isFirst ? "Add First Property" : "Add Property"}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="List New Property"
        className="max-w-xl"
      >
        <RealEstateForm onSuccess={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}

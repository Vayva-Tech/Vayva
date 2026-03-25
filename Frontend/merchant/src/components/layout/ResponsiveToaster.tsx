"use client";

import { useEffect, useState } from "react";
import { Toaster, type ToasterProps } from "sonner";

const MOBILE_MAX = 768;

export function ResponsiveToaster(props: ToasterProps) {
  const [position, setPosition] = useState<ToasterProps["position"]>("top-right");

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX - 1}px)`);
    const apply = () => setPosition(mq.matches ? "top-center" : "top-right");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return <Toaster {...props} position={position} />;
}

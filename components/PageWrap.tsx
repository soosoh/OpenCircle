"use client";
import { useEffect, useRef } from "react";
import { pageEnter } from "@/lib/gsap/pages";

export default function PageWrap({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) pageEnter(ref.current);
  }, []);
  return (
    <section ref={ref} className="enter-anim">
      {children}
    </section>
  );
}

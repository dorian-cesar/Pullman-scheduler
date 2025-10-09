"use client";

import { useState, useEffect } from "react";
import { DepartureBoard } from "@/components/departure-board";
import { AdvertisingView } from "@/components/advertising-view";

export default function Home() {
  const [showAdvertising, setShowAdvertising] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const getInterval = () => (showAdvertising ? 15000 : 40000);

    const scheduleNext = () => {
      return setTimeout(() => {
        setIsFading(true);

        setTimeout(() => {
          setShowAdvertising((prev) => !prev);
          setIsFading(false);
        }, 500); // 500ms fade out duration
      }, getInterval());
    };

    const timeout = scheduleNext();

    return () => clearTimeout(timeout);
  }, [showAdvertising]);

  return (
    <main className="min-h-screen">
      <div
        className={`transition-opacity duration-500 ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
      >
        {showAdvertising ? <AdvertisingView /> : <DepartureBoard />}
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import DepartureBoard from "@/components/departure-board";
import AdvertisingView from "@/components/advertising-view";

export default function Home() {
  const [showAdvertising, setShowAdvertising] = useState(true);
  const [departuresData, setDeparturesData] = useState([]);

  const SLIDESHOW_DURATION = 3 * 5000; // duración total del slideshow (3 slides * 5s cada uno)
  const BOARD_DURATION = 35000; // duración del board en ms

  const fetchDepartures = async () => {
    try {
      const res = await fetch("/api/departures");
      const data = await res.json();
      setDeparturesData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let timeout;

    if (showAdvertising) {
      // mientras se ve publicidad, actualizamos la data
      fetchDepartures();

      timeout = setTimeout(() => {
        setShowAdvertising(false); // pasamos al board
      }, SLIDESHOW_DURATION);
    } else {
      // duración del board
      timeout = setTimeout(() => {
        setShowAdvertising(true); // volvemos a publicidad
      }, BOARD_DURATION);
    }

    return () => clearTimeout(timeout);
  }, [showAdvertising]);

  return (
    <main className="min-h-screen relative">
      {!showAdvertising && <DepartureBoard departures={departuresData} />}
      {showAdvertising && <AdvertisingView />}
    </main>
  );
}

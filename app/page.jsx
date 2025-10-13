"use client";

import { useState, useEffect } from "react";
import DepartureBoard from "@/components/departure-board";
import AdvertisingView from "@/components/advertising-view";

export default function Home() {
  const [showAdvertising, setShowAdvertising] = useState(true);
  const [departuresData, setDeparturesData] = useState([]);
  const [adsData, setAdsData] = useState([]);

  const SLIDESHOW_DURATION = 3 * 5000; // 3 slides * 5s
  const BOARD_DURATION = 35000; // duración del board en ms

  const fetchDepartures = async () => {
    try {
      const res = await fetch("/api/departures");
      const data = await res.json();
      setDeparturesData(data);
    } catch (err) {
      console.error("Error fetch departures:", err);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await fetch("/api/advertisements", { cache: "no-store" });
      const data = await res.json();
      setAdsData(data);
    } catch (err) {
      console.error("Error fetch ads:", err);
      setAdsData([]);
    }
  };

  // Efecto para manejar cambios de slide y fetch correspondientes
  useEffect(() => {
    let timeout;

    if (showAdvertising) {
      // Si estamos mostrando publicidad, cargamos departures
      fetchDepartures();

      timeout = setTimeout(() => {
        setShowAdvertising(false); // pasamos al board
      }, SLIDESHOW_DURATION);
    } else {
      // Si estamos mostrando board, cargamos anuncios
      fetchAds();

      timeout = setTimeout(() => {
        setShowAdvertising(true); // volvemos a publicidad
      }, BOARD_DURATION);
    }

    return () => clearTimeout(timeout);
  }, [showAdvertising]);

  // Fetch inicial de advertisements al cargar la app por primera vez
  useEffect(() => {
    fetchAds();
  }, []);

  return (
    <main className="min-h-screen relative">
      {!showAdvertising && <DepartureBoard departures={departuresData} />}
      {showAdvertising && <AdvertisingView ads={adsData} />}
    </main>
  );
}

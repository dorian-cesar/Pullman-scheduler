"use client";

import { useEffect, useRef, useState } from "react";
import DepartureBoard from "@/components/departure-board";
import AdvertisingView from "@/components/advertising-view";

export default function Home() {
  const [showAdvertising, setShowAdvertising] = useState(true);
  const [departuresData, setDeparturesData] = useState([]);
  const [adsData, setAdsData] = useState([]);

  const SLIDESHOW_DURATION = 3 * 5000;
  const BOARD_DURATION = 35000;

  // Cache de últimos departures recibidos
  const lastDeparturesRef = useRef([]);

  // Contador de ciclos para controlar cada 5 vueltas
  const advertisingCyclesRef = useRef(0);

  // Fetch departures
  const fetchDepartures = async () => {
    try {
      const storedCity = localStorage.getItem("selectedCity");
      const originId = storedCity ? JSON.parse(storedCity).value : 1646;

      const res = await fetch(`/api/departures?originId=${originId}`);
      const data = await res.json();

      setDeparturesData(data);
      lastDeparturesRef.current = data;
    } catch (err) {
      console.error("Error fetch departures:", err);
    }
  };

  // Fetch ads
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

  // Alternancia publicidad / board
  useEffect(() => {
    let timeout;

    if (showAdvertising) {
      // Cada vez que se entra a publicidad, subir contador
      advertisingCyclesRef.current += 1;

      console.log("Ciclo publicidad #", advertisingCyclesRef.current);

      // Solo hacer fetch cada 5 ciclos
      if (advertisingCyclesRef.current >= 5) {
        fetchDepartures();
        advertisingCyclesRef.current = 0; // reset
      } else {
        // Usar cache mientras no toca fetch
        setDeparturesData(lastDeparturesRef.current);
      }

      timeout = setTimeout(() => setShowAdvertising(false), SLIDESHOW_DURATION);
    } else {
      fetchAds();
      timeout = setTimeout(() => setShowAdvertising(true), BOARD_DURATION);
    }

    return () => clearTimeout(timeout);
  }, [showAdvertising]);

  // Fetch inicial de publicidad
  useEffect(() => {
    fetchAds();
    fetchDepartures(); // inicial
  }, []);

  return (
    <main className="min-h-screen relative">
      {showAdvertising ? (
        <AdvertisingView ads={adsData} />
      ) : (
        <DepartureBoard departures={departuresData} />
      )}
    </main>
  );
}

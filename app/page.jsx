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

  // Último departures recibido
  const lastDeparturesRef = useRef([]);

  // Fetch departures
  const fetchDepartures = async () => {
    try {
      const res = await fetch("/api/departures");
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
      // Mientras publicidad, fetch departures
      fetchDepartures();
      timeout = setTimeout(() => setShowAdvertising(false), SLIDESHOW_DURATION);
    } else {
      // Mientras board, fetch ads
      fetchAds();
      timeout = setTimeout(() => setShowAdvertising(true), BOARD_DURATION);
    }

    return () => clearTimeout(timeout);
  }, [showAdvertising]);

  // Fetch inicial de publicidad
  useEffect(() => {
    fetchAds();
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

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

  // Cache persistente
  const weatherCache = useRef({});

  // Último departures recibido
  const lastDeparturesRef = useRef([]);

  // Fetch departures
  const fetchDepartures = async () => {
    try {
      const res = await fetch("/api/departures");
      const data = await res.json();
      setDeparturesData(data);
      lastDeparturesRef.current = data;

      fetchWeatherForDepartures(data);
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

  // Fetch weather
  const fetchWeatherForDepartures = async (departures) => {
    const delayPerCall = 1100;
    const uniqueCities = [...new Set(departures.map((d) => d.destination))];

    for (let city of uniqueCities) {
      // si está cacheada, usar cache y continuar
      if (weatherCache.current[city]) {
        updateDeparturesWithWeather(city, weatherCache.current[city]);
        continue;
      }

      try {
        const res = await fetch(
          `/api/weather?city=${encodeURIComponent(city)}`
        );
        const data = await res.json();

        const weatherData = {
          weather: data.weather || "sunny",
          temp: data.temp ?? "--",
        };

        weatherCache.current[city] = weatherData;
        updateDeparturesWithWeather(city, weatherData);
      } catch {
        const fallback = { weather: "sunny", temp: "--" };
        weatherCache.current[city] = fallback;
        updateDeparturesWithWeather(city, fallback);
      }

      await new Promise((res) => setTimeout(res, delayPerCall));
    }
  };

  // Actualizar departures con clima de ciudad
  const updateDeparturesWithWeather = (city, weatherData) => {
    setDeparturesData((prev) =>
      prev.map((d) => (d.destination === city ? { ...d, ...weatherData } : d))
    );
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

  // Refrescar clima cada cierto tiempo
  useEffect(() => {
    const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutos

    const interval = setInterval(() => {
      console.log("Refrescando clima...");
      weatherCache.current = {}; // limpia cache local
      if (lastDeparturesRef.current.length > 0) {
        fetchWeatherForDepartures(lastDeparturesRef.current);
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen relative">
      {showAdvertising ? (
        <AdvertisingView ads={adsData} />
      ) : (
        <DepartureBoard
          departures={departuresData}
          weatherCache={weatherCache}
        />
      )}
    </main>
  );
}

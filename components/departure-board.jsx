"use client";

import { useEffect, useState, useRef } from "react";
import { Bus, Clock, Sun, Cloud, CloudRain, CloudSun } from "lucide-react";
import useFadeIn from "@/hooks/useFadeIn";
import info from "../info.json";

function WeatherIcon({ weather }) {
  const iconClass = "h-7 w-7";
  switch (weather) {
    case "sunny":
      return <Sun className={`${iconClass} text-yellow-400`} />;
    case "cloudy":
      return <Cloud className={`${iconClass} text-gray-400`} />;
    case "rainy":
      return <CloudRain className={`${iconClass} text-blue-400`} />;
    case "partly-cloudy":
      return <CloudSun className={`${iconClass} text-yellow-300`} />;
    default:
      return <Sun className={`${iconClass} text-yellow-400`} />;
  }
}

export default function DepartureBoard({ departures = [], weatherCache = {} }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [updatedDepartures, setUpdatedDepartures] = useState([]);
  const scrollRef = useRef(null);
  const rowHeight = 85;
  const isVisible = useFadeIn();

  // Cada vez que cambian los departures, se cargan inmediatamente
  useEffect(() => {
    // mostrar de inmediato sin esperar el clima
    const initial = departures.map((d) => ({
      ...d,
      weather: "sunny",
      temp: "--",
    }));
    setUpdatedDepartures(initial);
  }, [departures]);

  // Cuando llega el cache del clima, solo actualizamos los valores, sin bloquear
  useEffect(() => {
    if (!departures.length) return;
    setUpdatedDepartures((prev) =>
      prev.map((d) => ({
        ...d,
        ...(weatherCache[d.destination] || {}),
      }))
    );
  }, [weatherCache]);

  // Reloj
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll infinito
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollTop = 0;
    container.style.scrollBehavior = "auto";

    const timeout = setTimeout(() => {
      container.style.scrollBehavior = "smooth";
      let frameId;

      const scrollStep = () => {
        if (!container) return;
        container.scrollTop += 1;
        if (
          container.scrollTop >=
          container.scrollHeight - container.clientHeight
        ) {
          container.scrollTop = 0;
        }
        frameId = requestAnimationFrame(scrollStep);
      };

      frameId = requestAnimationFrame(scrollStep);

      // Cleanup
      return () => cancelAnimationFrame(frameId);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`h-screen transition-opacity duration-700 ${
        isVisible ? "opacity-100 animate-fade-in" : "opacity-0"
      } bg-black bg-gradient-to-br from-[#0a1628] via-[#0d1d35] to-[#0a1628] p-8 flex flex-col overflow-hidden`}
    >
      {/* Header */}
      <header className="mb-4 animate-fade-in flex-shrink-0">
        <div className="flex items-center justify-between bg-[#1a2942] border-4 border-[#2a3952] rounded-lg p-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <img
              src="/img/logos/logo-pullman-nuevo-blanco.svg"
              alt="Pullman Bus"
              className="h-8 w-auto brightness-110 pl-2"
            />
            <div className="h-8 w-px bg-white/20" />
            <h1 className="text-2xl font-bold text-white tracking-wider uppercase font-mono pt-1">
              {info.sitio}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-white">
            <Clock className="h-6 w-6 text-white" />
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold font-mono tracking-wider tabular-nums text-white">
                {currentTime.toLocaleTimeString("es-CL", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </div>
              <div className="text-lg opacity-90 uppercase tracking-wide">
                {currentTime.toLocaleDateString("es-CL", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabla */}
      <div className="bg-[#1a2942] border-4 border-[#2a3952] rounded-lg shadow-2xl flex-grow flex flex-col overflow-hidden">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-[#2a3952] flex-shrink-0">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Bus className="h-6 w-6 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wider uppercase font-mono">
              Próximas Salidas
            </h2>
          </div>

          <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-[#0d1d35] border-2 border-[#2a3952] rounded-lg mb-2 flex-shrink-0">
            <div className="col-span-4 text-white/70 font-bold text-lg uppercase tracking-widest font-mono">
              Destino
            </div>
            <div className="col-span-1 text-white/70 font-bold text-lg uppercase tracking-widest font-mono">
              Clima
            </div>
            <div className="col-span-2 text-white/70 font-bold text-lg uppercase tracking-widest font-mono">
              Hora
            </div>
            <div className="col-span-2 text-white/70 font-bold text-lg uppercase tracking-widest font-mono">
              Servicio
            </div>
            <div className="col-span-3 text-white/70 font-bold text-lg uppercase tracking-widest font-mono">
              Estado
            </div>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-hidden relative">
            {departures.map((d) => (
              <div
                key={d.id}
                className="grid grid-cols-12 gap-3 px-4 py-5 bg-[#0d1d35] border-2 border-[#2a3952] rounded-lg mb-2"
                style={{ height: `${rowHeight}px` }}
              >
                <div className="col-span-4 flex items-center text-white text-3xl font-bold font-mono tracking-wider uppercase">
                  {d.destination}
                </div>
                <div className="col-span-1 flex items-center justify-start gap-1">
                  <WeatherIcon weather={d.weather} />
                  <span className="text-white/70 font-mono font-bold">
                    {d.temp}°
                  </span>
                </div>
                <div className="col-span-2 flex items-center text-white text-4xl font-bold font-mono tracking-widest">
                  {d.time}
                </div>
                <div className="col-span-2 flex items-center text-white/80 text-xl font-mono tracking-wide uppercase">
                  {d.service}
                </div>
                <div className="col-span-3">
                  <span
                    className={`inline-flex items-center px-3 py-2 border-2 rounded text-sm font-bold font-mono uppercase tracking-wide ${
                      d.status === "A TIEMPO"
                        ? "text-green-400 border-green-400/50 bg-green-400/10"
                        : d.status === "LLEGANDO"
                        ? "text-blue-300 border-blue-300/50 bg-blue-300/10 animate-pulse"
                        : d.status === "RETRASADO"
                        ? "text-red-400 border-red-400/50 bg-red-400/10"
                        : "text-blue-400 border-blue-400/50 bg-blue-400/10"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

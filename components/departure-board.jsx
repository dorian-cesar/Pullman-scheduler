"use client";

import { useEffect, useState, useRef } from "react";
import { Bus, Clock } from "lucide-react";
import useFadeIn from "@/hooks/useFadeIn";

export default function DepartureBoard({ departures = [], weatherCache = {} }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [updatedDepartures, setUpdatedDepartures] = useState([]);
  const [currentCity, setCurrentCity] = useState("SANTIAGO");
  const scrollRef = useRef(null);
  const rowHeight = 125;
  const isVisible = useFadeIn();

  // Reloj
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedCity = localStorage.getItem("selectedCity");
    if (storedCity) {
      try {
        const cityObj = JSON.parse(storedCity);
        if (cityObj.label) {
          setCurrentCity(cityObj.label.toUpperCase());
        }
      } catch (e) {
        console.error("Error parsing selectedCity from localStorage:", e);
      }
    }
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
    }, 4000);

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
            <h1 className="text-5xl font-bold text-white tracking-wider uppercase font-mono pt-1">
              {currentCity}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-white">
            <Clock className="h-6 w-6 text-white" />
            <div className="flex items-baseline gap-3">
              <div className="text-5xl font-bold font-mono tracking-wider tabular-nums text-white">
                {currentTime.toLocaleTimeString("es-CL", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </div>
              <div className="text-3xl opacity-90 uppercase tracking-wide">
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

          <div className="grid grid-cols-13 gap-3 px-4 py-3 bg-[#0d1d35] border-2 border-[#2a3952] rounded-lg mb-2 flex-shrink-0">
            <div className="col-span-4 text-white/70 font-bold text-3xl uppercase tracking-widest font-mono">
              Destino
            </div>
            <div className="col-span-2 text-white/70 font-bold text-3xl uppercase tracking-widest font-mono">
              Hora
            </div>
            <div className="col-span-2 text-white/70 font-bold text-3xl uppercase tracking-widest font-mono">
              Servicio
            </div>
            <div className="col-span-3 text-white/70 font-bold text-3xl uppercase tracking-widest font-mono">
              Estado
            </div>
            <div className="col-span-2 text-white/70 font-bold text-3xl uppercase tracking-widest font-mono">
              Salida
            </div>
          </div>

          {/* Filas */}
          <div ref={scrollRef} className="flex-grow overflow-hidden relative">
            {departures.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white text-4xl font-bold font-mono tracking-wide uppercase">
                No hay servicios disponibles
              </div>
            ) : (
              departures.map((d) => (
                <div
                  key={d.id}
                  className="grid grid-cols-13 gap-3 px-4 bg-[#0d1d35] border-2 border-[#2a3952] rounded-lg mb-2"
                  style={{ height: `${rowHeight}px` }}
                >
                  {/* Destino */}
                  <div className="col-span-4 flex items-center text-white text-4xl font-bold font-mono tracking-wide uppercase leading-none">
                    {d.destination}
                  </div>

                  {/* Hora */}
                  <div className="col-span-2 flex items-center text-white text-4xl font-bold font-mono tracking-wide leading-none">
                    {d.time}
                  </div>

                  {/* Servicio */}
                  <div className="col-span-2 flex items-center text-white text-4xl font-bold font-mono tracking-wide uppercase leading-none">
                    {d.service}
                  </div>

                  {/* Estado */}
                  <div className="col-span-2 flex items-center">
                    <span
                      className={`inline-flex items-center px-4 py-2 border-2 rounded text-4xl font-bold font-mono uppercase tracking-wide ${
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

                  {/* Terminal / Salida */}
                  <div className="col-span-3 flex items-center h-full text-white text-4xl font-bold font-mono tracking-wide uppercase leading-none">
                    {d.terminal}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

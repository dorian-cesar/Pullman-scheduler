"use client";

import { useEffect, useState, useRef } from "react";
import { Bus, Cloud, CloudRain, CloudSun, Sun, Clock } from "lucide-react";
import { sitio } from "../info.json";

interface Departure {
  id: string;
  destination: string;
  time: string;
  platform: string;
  status: "A TIEMPO" | "ABORDANDO" | "RETRASADO" | "PROXIMO";
  service: string;
  weather: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
}

const departures: Departure[] = [
  {
    id: "1",
    destination: "VIÑA DEL MAR",
    time: "08:30",
    platform: "3",
    status: "ABORDANDO",
    service: "PREMIUM",
    weather: "sunny",
  },
  {
    id: "2",
    destination: "ALGARROBO",
    time: "09:00",
    platform: "1",
    status: "A TIEMPO",
    service: "CLASICO",
    weather: "partly-cloudy",
  },
  {
    id: "3",
    destination: "CARTAGENA",
    time: "09:15",
    platform: "5",
    status: "A TIEMPO",
    service: "CLASICO",
    weather: "sunny",
  },
  {
    id: "4",
    destination: "VALPARAISO",
    time: "09:45",
    platform: "2",
    status: "PROXIMO",
    service: "PREMIUM",
    weather: "cloudy",
  },
  {
    id: "5",
    destination: "LA SERENA",
    time: "10:00",
    platform: "7",
    status: "A TIEMPO",
    service: "PREMIUM",
    weather: "sunny",
  },
  {
    id: "6",
    destination: "VENTANA",
    time: "10:30",
    platform: "3",
    status: "A TIEMPO",
    service: "CLASICO",
    weather: "partly-cloudy",
  },
  {
    id: "7",
    destination: "CONCON",
    time: "11:00",
    platform: "4",
    status: "A TIEMPO",
    service: "CLASICO",
    weather: "sunny",
  },
  {
    id: "8",
    destination: "ALGARROBO",
    time: "11:30",
    platform: "1",
    status: "A TIEMPO",
    service: "PREMIUM",
    weather: "rainy",
  },
  {
    id: "9",
    destination: "SAN ANTONIO",
    time: "12:00",
    platform: "6",
    status: "A TIEMPO",
    service: "CLASICO",
    weather: "cloudy",
  },
  {
    id: "10",
    destination: "CARTAGENA",
    time: "12:30",
    platform: "5",
    status: "A TIEMPO",
    service: "PREMIUM",
    weather: "sunny",
  },
];

function WeatherIcon({ weather }: { weather: string }) {
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

export function DepartureBoard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  const rowHeight = 88;
  const itemsPerPage = 8;

  // Duplicamos la lista para hacer scroll infinito
  const displayList = [...departures, ...departures];
  const totalHeight = departures.length * rowHeight;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let frameId: number;
    let startScrollingTimeout: NodeJS.Timeout;

    const scrollStep = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop += 1;

        if (scrollRef.current.scrollTop >= totalHeight) {
          scrollRef.current.scrollTop = 0;
        }
      }
      frameId = requestAnimationFrame(scrollStep);
    };

    // Esperar 5 segundos antes de iniciar el scroll automático
    startScrollingTimeout = setTimeout(() => {
      frameId = requestAnimationFrame(scrollStep);
    }, 5000);

    return () => {
      clearTimeout(startScrollingTimeout);
      cancelAnimationFrame(frameId);
    };
  }, [totalHeight]);

  return (
    <div className="h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1d35] to-[#0a1628] p-8 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="mb-4 animate-fade-in flex-shrink-0">
        <div className="flex items-center justify-between bg-[#1a2942] border-4 border-[#2a3952] rounded-lg p-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <img
              src="/images/design-mode/logo-pullmanbus-new.webp"
              alt="Pullman Bus"
              className="h-8 w-auto brightness-110"
            />
            <div className="h-8 w-px bg-white/20" />
            <h1 className="text-2xl font-bold text-white tracking-wider uppercase font-mono">
              {sitio}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-white">
            <Clock className="h-6 w-6 text-white" />
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold font-mono tracking-wider tabular-nums text-white">
                {currentTime.toLocaleTimeString("es-CL", {
                  hour: "2-digit",
                  minute: "2-digit",
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
            <div className="col-span-1" />
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

          <div
            ref={scrollRef}
            className="flex-grow overflow-hidden relative"
            style={{ scrollBehavior: "smooth" }}
          >
            <div>
              {displayList.map((departure, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 px-4 py-5 bg-[#0d1d35] border-2 border-[#2a3952] rounded-lg mb-2"
                  style={{ height: `${rowHeight}px` }}
                >
                  <div className="col-span-4 text-white text-3xl font-bold font-mono tracking-wider uppercase">
                    {departure.destination}
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <WeatherIcon weather={departure.weather} />
                  </div>
                  <div className="col-span-2 text-white text-4xl font-bold font-mono tracking-widest">
                    {departure.time}
                  </div>
                  <div className="col-span-2 text-white/80 text-xl font-mono tracking-wide uppercase">
                    {departure.service}
                  </div>
                  <div className="col-span-3">
                    <span
                      className={`inline-flex items-center px-3 py-2 border-2 rounded text-sm font-bold font-mono uppercase tracking-wide ${
                        departure.status === "A TIEMPO"
                          ? "text-green-400 border-green-400/50 bg-green-400/10"
                          : departure.status === "ABORDANDO"
                          ? "text-accent border-accent/50 bg-accent/10 animate-pulse"
                          : departure.status === "RETRASADO"
                          ? "text-red-400 border-red-400/50 bg-red-400/10"
                          : "text-blue-400 border-blue-400/50 bg-blue-400/10"
                      }`}
                    >
                      {departure.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

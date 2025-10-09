"use client";

import { useState, useEffect } from "react";

const advertisements = [
  {
    id: 1,
    type: "image" as const,
    content: "/beautiful-beach-destination-vi-a-del-mar-chile.jpg",
    title: "Descubre Viña del Mar",
    description: "El destino perfecto para tus vacaciones",
  },
  {
    id: 2,
    type: "image" as const,
    content: "/modern-comfortable-bus-interior-premium-seats.jpg",
    title: "Viaja con Comodidad",
    description: "Buses Premium con asientos reclinables",
  },
  {
    id: 3,
    type: "image" as const,
    content: "/chilean-coastal-city-sunset-la-serena.jpg",
    title: "La Serena te espera",
    description: "Playas hermosas y atardeceres inolvidables",
  },
];

export function AdvertisingView() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Auto-advance carousel every 5 seconds
    const interval = setInterval(() => {
      handleTransition((prev) => (prev + 1) % advertisements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleTransition = (getNextIndex: (prev: number) => number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(getNextIndex);
      setIsTransitioning(false);
    }, 300);
  };

  const currentAd = advertisements[currentIndex];

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="absolute top-8 left-8 z-20 animate-fade-in">
        <img
          src="/images/design-mode/logo-pullmanbus-new.webp"
          alt="Pullman Bus"
          className="h-16 w-auto drop-shadow-2xl"
        />
      </div>

      <div
        className={`relative w-full h-screen transition-opacity duration-500 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {currentAd.type === "image" ? (
          <div className="relative w-full h-full">
            <img
              src={currentAd.content || "/placeholder.svg"}
              alt={currentAd.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
        ) : (
          <video
            key={currentAd.id}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
          >
            <source src={currentAd.content} type="video/mp4" />
          </video>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-12 text-white animate-slide-up-fade-in">
          <h2 className="text-6xl font-bold mb-4 text-balance">
            {currentAd.title}
          </h2>
          <p className="text-3xl text-white/90 text-balance">
            {currentAd.description}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-accent shadow-lg shadow-accent/50 transition-all duration-500 ease-out"
          style={{
            width: `${((currentIndex + 1) / advertisements.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

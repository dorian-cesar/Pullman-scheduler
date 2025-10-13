"use client";

import { useState, useEffect } from "react";

export default function AdvertisingView({ ads }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!ads || ads.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads]);

  const currentAd = ads[currentIndex];
  if (!currentAd) return null;

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="absolute top-8 left-8 z-20 animate-fade-in">
        <img
          src="/img/logos/logo-pullman-nuevo-blanco.svg"
          alt="Pullman Bus"
          className="h-16 w-auto drop-shadow-[0_0_10px_rgba(0,0,0,0.7)] transition-all duration-500"
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
          <h2 className="text-6xl font-bold mb-4 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
            {currentAd.title}
          </h2>
          <p className="text-3xl text-white/90 drop-shadow-[1px_1px_3px_rgba(0,0,0,0.7)]">
            {currentAd.description}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-accent shadow-lg shadow-accent/50 transition-all duration-500 ease-out"
          style={{
            width: `${((currentIndex + 1) / ads.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

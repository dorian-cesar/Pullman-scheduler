import { NextResponse } from "next/server";

const weatherCache = {};
let callsThisMinute = 0;
let lastReset = Date.now();

const MAX_CALLS_PER_MIN = 60;
// const CACHE_TTL = 10 * 60 * 1000; // 10 min
const CACHE_TTL = 30 * 1000; // 30 segundos

export async function GET(req) {
  const { searchParams } = req.nextUrl;
  const city = searchParams.get("city");

  if (!city)
    return NextResponse.json({ error: "City required" }, { status: 400 });

  const now = Date.now();

  // Reinicia el contador cada minuto
  if (now - lastReset > 60 * 1000) {
    callsThisMinute = 0;
    lastReset = now;
  }

  const cached = weatherCache[city];
  const isCacheFresh = cached && now - cached.timestamp < CACHE_TTL;

  // Si cache es válido y aún no toca refrescar, úsalo
  if (isCacheFresh) {
    return NextResponse.json({ weather: cached.weather, temp: cached.temp });
  }

  // Si superamos el límite de llamadas, usamos cache o fallback
  if (callsThisMinute >= MAX_CALLS_PER_MIN) {
    if (cached)
      return NextResponse.json({ weather: cached.weather, temp: cached.temp });
    return NextResponse.json({ weather: "sunny", temp: "--" });
  }

  callsThisMinute++;

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=metric&lang=es&appid=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather API error");
    const data = await res.json();

    let weather = "sunny";
    const main = data.weather[0].main.toLowerCase();
    if (main.includes("cloud")) weather = "cloudy";
    else if (main.includes("rain") || main.includes("drizzle"))
      weather = "rainy";
    else if (main.includes("partly")) weather = "partly-cloudy";
    else if (main.includes("clear")) weather = "sunny";

    const temp = Math.round(data.main.temp);

    weatherCache[city] = { weather, temp, timestamp: now };

    return NextResponse.json({ weather, temp });
  } catch (err) {
    console.error("Weather fetch failed:", err);

    // Si falla la API, usamos el cache si existe
    if (cached)
      return NextResponse.json({ weather: cached.weather, temp: cached.temp });
    return NextResponse.json({ weather: "sunny", temp: "" });
  }
}

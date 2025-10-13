import { NextResponse } from "next/server";

const weatherCache = {};
let callsThisMinute = 0;
let lastReset = Date.now();

const MAX_CALLS_PER_MIN = 60;
const CACHE_TTL = 10 * 60 * 1000; // 10 min

export async function GET(req) {
  const { searchParams } = req.nextUrl;
  const city = searchParams.get("city");

  if (!city)
    return NextResponse.json({ error: "City required" }, { status: 400 });

  const now = Date.now();

  if (now - lastReset > 60 * 1000) {
    callsThisMinute = 0;
    lastReset = now;
  }

  // Fallback: si hay cache reciente, devolvemos eso aunque la API falle
  const cached = weatherCache[city];
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ weather: cached.weather, temp: cached.temp });
  }

  if (callsThisMinute >= MAX_CALLS_PER_MIN) {
    // Si excede rate limit, devolvemos fallback
    if (cached)
      return NextResponse.json({ weather: cached.weather, temp: cached.temp });
    return NextResponse.json({ weather: "sunny", temp: "--" });
  }

  callsThisMinute++;

  const apiKey = process.env.OPENWEATHER_KEY;
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

    // fallback: cache o valor por defecto
    if (cached)
      return NextResponse.json({ weather: cached.weather, temp: cached.temp });
    return NextResponse.json({ weather: "sunny", temp: "--" });
  }
}

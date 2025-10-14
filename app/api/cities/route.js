import { NextResponse } from "next/server";

const KUPOS_API_KEY = process.env.KUPOS_API_KEY;

export async function GET() {
  try {
    const res = await fetch(
      `https://gds.kupos.com/gds/api/cities.json?api_key=${KUPOS_API_KEY}`
    );
    const data = await res.json();

    if (!data.result || data.result.length <= 1) {
      return NextResponse.json({ cities: [] });
    }

    // data.result[0] son los headers, data.result[1..] son las ciudades
    const cities = data.result
      .slice(1)
      .map((c) => ({
        id: c[0],
        name: c[1],
        origin_count: c[2],
        destination_count: c[3],
      }))
      // .filter((c) => c.destination_count > 0) // solo ciudades con destinos
      .sort((a, b) => a.name.localeCompare(b.name)); // orden alfabético

    return NextResponse.json({ cities });
  } catch (err) {
    console.error("Error fetching cities:", err);
    return NextResponse.json({ cities: [] }, { status: 500 });
  }
}

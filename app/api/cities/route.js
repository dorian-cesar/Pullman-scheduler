import { NextResponse } from "next/server";

const NEXT_PUBLIC_KUPOS_API_KEY = process.env.NEXT_PUBLIC_KUPOS_API_KEY;

export async function GET() {
  try {
    const res = await fetch(
      `https://gds.kupos.com/gds/api/cities.json?api_key=${NEXT_PUBLIC_KUPOS_API_KEY}`
    );
    const data = await res.json();

    if (!data.result || data.result.length <= 1) {
      return NextResponse.json({ cities: [] });
    }

    const seenNames = new Set();
    const cities = data.result
      .slice(1)
      .map((c) => ({
        id: c[0],
        name: c[1],
        origin_count: c[2],
        destination_count: c[3],
      }))
      .filter((c) => {
        // eliminar duplicados por nombre
        if (seenNames.has(c.name)) return false;
        seenNames.add(c.name);

        // eliminar nombres que comiencen con 'hackedbykode'
        if (/^hackedbykode/i.test(c.name)) return false;

        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // orden alfabético

    return NextResponse.json({ cities });
  } catch (err) {
    console.error("Error fetching cities:", err);
    return NextResponse.json({ cities: [] }, { status: 500 });
  }
}

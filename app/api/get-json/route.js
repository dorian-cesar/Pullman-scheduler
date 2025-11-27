import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";
const JSON_PUBLIC_ID = "mantenedor/advertisements.json";

// GET directo desde Cloudinary (sin cache CDN)
export async function GET() {
  try {
    const result = await cloudinary.api.resource(JSON_PUBLIC_ID, {
      resource_type: "raw",
    });

    // result.secure_url apunta al último upload, incluye ?v=timestamp interno
    const res = await fetch(result.secure_url);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error cargando JSON:", error);
    return NextResponse.json(
      { error: "No se pudo cargar JSON" },
      { status: 500 }
    );
  }
}

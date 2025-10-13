import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

export async function GET() {
  try {
    const cloudinaryJsonUrl =
      "https://res.cloudinary.com/" +
      CLOUD_NAME +
      "/raw/upload/mantenedor/advertisements.json";

    const res = await fetch(cloudinaryJsonUrl);
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

import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";

const JSON_PUBLIC_ID = "mantenedor/advertisements.json";

// GET: Leer JSON
export async function GET() {
  try {
    const result = await cloudinary.api.resource(JSON_PUBLIC_ID, {
      resource_type: "raw",
    });

    // result.secure_url tiene la versión más reciente
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

// PUT: Sobreescribir JSON
export async function PUT(req) {
  try {
    const data = await req.json();
    const jsonString = JSON.stringify(data, null, 2);

    const uploaded = await new Promise((resolve, reject) => {
      const buffer = Buffer.from(jsonString, "utf-8");
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "mantenedor",
          public_id: "advertisements.json",
          resource_type: "raw",
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      message: "JSON actualizado correctamente",
      url: uploaded.secure_url, // URL del JSON actualizado
    });
  } catch (error) {
    console.error("Error guardando JSON:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar JSON" },
      { status: 500 }
    );
  }
}

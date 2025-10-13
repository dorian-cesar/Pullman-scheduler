import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";

// URL de tu JSON raw en Cloudinary
const jsonPublicId = "mantenedor/advertisements";

export async function GET() {
  try {
    // Obtener la URL del raw file
    const url = cloudinary.url(jsonPublicId, { resource_type: "raw" });

    // Traer contenido del JSON
    const res = await fetch(url);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al leer JSON:", error);
    return NextResponse.json(
      { error: "No se pudo leer JSON" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();

    // Convertir JSON a buffer
    const buffer = Buffer.from(JSON.stringify(body));

    // Subir de nuevo a Cloudinary
    await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "mantenedor",
          public_id: "advertisements",
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ message: "JSON actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar JSON:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar JSON" },
      { status: 500 }
    );
  }
}

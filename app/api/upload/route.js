import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const adId = formData.get("adId");

    if (!file || !adId) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir a Cloudinary y esperar el resultado
    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "mantenedor",
          public_id: `foto${adId}`,
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
      message: "Imagen subida correctamente a Cloudinary",
      file: uploaded.secure_url,
    });
  } catch (error) {
    console.error("Error al subir a Cloudinary:", error);
    return NextResponse.json(
      { error: "Error al subir imagen" },
      { status: 500 }
    );
  }
}

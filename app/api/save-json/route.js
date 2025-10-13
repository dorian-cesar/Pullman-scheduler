import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";

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
      message: "JSON guardado correctamente",
      url: uploaded.secure_url,
    });
  } catch (error) {
    console.error("Error guardando JSON:", error);
    return NextResponse.json(
      { error: "Error al guardar JSON" },
      { status: 500 }
    );
  }
}

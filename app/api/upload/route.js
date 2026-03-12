import { getStore } from "@netlify/blobs";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const adId = formData.get("adId");

    if (!file || !adId) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    // Convertir el archivo a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Conectar con el "Store" de Netlify Blobs (llámalo como quieras, ej: 'imagenes-ads')
    const imagesStore = getStore("imagenes-ads");

    // 2. Guardar la imagen usando el adId como clave
    const fileName = `foto${adId}.jpg`;
    await imagesStore.set(fileName, buffer, {
      contentType: "image/jpeg",
    });

    // Nota: Para servir la imagen públicamente desde Blobs, 
    // usualmente necesitarás crear una ruta API de lectura (GET) 
    // que haga un imagesStore.get(fileName) y devuelva el stream.

    return NextResponse.json({
      message: "Imagen guardada permanentemente en Netlify Blobs",
      file: `/api/ads/${fileName}`, // Esta sería tu nueva ruta de lectura
    });
  } catch (error) {
    console.error("Error en Blobs:", error);
    return NextResponse.json({ error: "Error al subir" }, { status: 500 });
  }
}

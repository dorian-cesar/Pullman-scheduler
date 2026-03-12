import { getStore } from "@netlify/blobs";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { filename } = params;

  try {
    const imagesStore = getStore("imagenes-ads");
    
    // Obtener la imagen desde el almacenamiento de Blobs
    const blob = await imagesStore.get(filename, { type: "blob" });

    if (!blob) {
      return new NextResponse("Imagen no encontrada", { status: 404 });
    }

    // Retornar la imagen con el tipo de contenido correcto
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error al leer el Blob:", error);
    return new NextResponse("Error del servidor", { status: 500 });
  }
}

import { promises as fs } from "fs";
import path from "path";
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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Definir ruta de guardado: public/ads/foto{adId}.jpg (o mantener extensión original si es posible)
    // Para simplificar, asumiremos que se guardan con el nombre original o un nombre estandarizado
    // Aquí usamos `foto${adId}` y una extensión genérica o extraída del tipo mime si fuera necesario.
    // Usaremos .jpg por defecto como en el original, o mejor usar el nombre original del archivo para preservar extensión.

    // Mejor estrategia: usar un nombre único basado en adId y timestamp para evitar caché, 
    // pero el requerimiento original usaba `foto${adId}` sobrescribiendo. Mantendremos esa lógica.

    // Determinar extensión simple basada en tipo (opcional, o user .jpg por defecto)
    // El original no parecía importar la extensión en public_id de cloudinary.
    // Vamos a guardar como `foto{adId}.jpg` para simplificar, o usar el nombre original si queremos.
    // Dado que es un reemplazo directo, usaremos `foto{adId}.jpg`.

    const fileName = `foto${adId}.jpg`;
    const uploadDir = path.join(process.cwd(), "public", "ads");
    const filePath = path.join(uploadDir, fileName);

    // Asegurar que el directorio existe (aunque ya lo creamos en task)
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    await fs.writeFile(filePath, buffer);

    // URL pública para acceder al archivo
    const fileUrl = `/ads/${fileName}?t=${Date.now()}`; // timestamp para evitar caché del navegador

    return NextResponse.json({
      message: "Imagen subida correctamente a local",
      file: fileUrl,
    });
  } catch (error) {
    console.error("Error al subir a local:", error);
    return NextResponse.json(
      { error: "Error al subir imagen" },
      { status: 500 }
    );
  }
}

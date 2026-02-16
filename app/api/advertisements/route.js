import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "advertisements.json");

// Helper para leer el archivo JSON
async function readData() {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    // Si el archivo no existe, retornar array vacío
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

// Helper para guardar en el archivo JSON
async function saveData(data) {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// GET: Leer JSON local
export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error cargando JSON local:", error);
    return NextResponse.json(
      { error: "No se pudo cargar JSON local" },
      { status: 500 }
    );
  }
}

// PUT: Sobreescribir JSON local
export async function PUT(req) {
  try {
    const data = await req.json();
    await saveData(data);

    return NextResponse.json({
      message: "JSON actualizado correctamente en local",
    });
  } catch (error) {
    console.error("Error guardando JSON local:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar JSON local" },
      { status: 500 }
    );
  }
}

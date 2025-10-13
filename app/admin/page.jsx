"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [ads, setAds] = useState([]);

  // LOGIN
  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASS) {
      setLoggedIn(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  // CARGAR ADS DESDE CLOUDINARY
  useEffect(() => {
    if (loggedIn) {
      fetch("/api/get-json")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setAds(data);
          else setAds([]);
        })
        .catch(() => setAds([]));
    }
  }, [loggedIn]);

  // SUBIR IMAGEN
  const handleFileUpload = async (e, adId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("adId", adId.toString());

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok) {
        setAds((prev) =>
          prev.map((a) => (a.id === adId ? { ...a, content: json.file } : a))
        );
        alert(`Imagen del anuncio ${adId} reemplazada`);
      } else {
        alert(json.error || "Error al subir imagen");
      }
    } catch {
      alert("Error al subir imagen");
    } finally {
      e.target.value = "";
    }
  };

  // GUARDAR JSON EN CLOUDINARY
  const handleSave = async () => {
    try {
      const res = await fetch("/api/save-json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ads),
      });
      const json = await res.json();
      if (res.ok) {
        alert("JSON guardado en Cloudinary");
        console.log("URL JSON:", json.url);
      } else {
        alert(json.error || "Error guardando JSON");
      }
    } catch {
      alert("Error guardando JSON");
    }
  };

  if (!loggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm">
          <h2 className="text-2xl mb-4">Login Administrador</h2>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 rounded bg-gray-700 mb-4 w-full"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded w-full"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Mantenedor de Publicidad</h1>

      {ads.map((ad) => (
        <div key={ad.id} className="bg-gray-800 p-4 mb-6 rounded-lg">
          <h2 className="text-xl mb-2">Anuncio {ad.id}</h2>

          <div className="mb-4">
            <img
              src={ad.content}
              alt={ad.title}
              className="w-full max-w-xs rounded mb-2 object-cover"
              style={{ maxHeight: 160 }}
            />
            {ad.content && (
              <a
                href={ad.content}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                🔗 Ver Imagen
              </a>
            )}
          </div>

          <input
            className="p-2 rounded bg-gray-700 mb-2 w-full"
            value={ad.title}
            onChange={(e) =>
              setAds((prev) =>
                prev.map((a) =>
                  a.id === ad.id ? { ...a, title: e.target.value } : a
                )
              )
            }
            placeholder="Título"
          />
          <input
            className="p-2 rounded bg-gray-700 mb-2 w-full"
            value={ad.description}
            onChange={(e) =>
              setAds((prev) =>
                prev.map((a) =>
                  a.id === ad.id ? { ...a, description: e.target.value } : a
                )
              )
            }
            placeholder="Descripción"
          />

          <div className="flex items-center gap-4 mt-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, ad.id)}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

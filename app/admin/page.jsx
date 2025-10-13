"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const showToast = (message, icon = "info") => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  // LOGIN
  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASS) {
      setLoggedIn(true);
    } else {
      showToast("Contraseña incorrecta", "error");
    }
  };

  // CARGAR ADS DESDE CLOUDINARY
  useEffect(() => {
    if (loggedIn) {
      const fetchAds = async () => {
        try {
          setLoadingMessage("Cargando anuncios…");
          setLoading(true);
          const res = await fetch("/api/get-json");
          const data = await res.json();
          if (Array.isArray(data)) setAds(data);
          else setAds([]);
        } catch {
          setAds([]);
          showToast("No se pudieron cargar los anuncios", "error");
        } finally {
          setLoading(false);
          setLoadingMessage("");
        }
      };
      fetchAds();
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
      setLoadingMessage(`Subiendo imagen del anuncio ${adId}…`);
      setLoading(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok) {
        setAds((prev) =>
          prev.map((a) => (a.id === adId ? { ...a, content: json.file } : a))
        );
        showToast(`Imagen del anuncio ${adId} reemplazada`, "success");
      } else {
        showToast(json.error || "Error al subir imagen", "error");
      }
    } catch {
      showToast("Error al subir imagen", "error");
    } finally {
      setLoading(false);
      setLoadingMessage("");
      e.target.value = "";
    }
  };

  // CARGAR ADS
  useEffect(() => {
    if (loggedIn) {
      const fetchAds = async () => {
        try {
          setLoadingMessage("Cargando anuncios…");
          setLoading(true);

          const res = await fetch("/api/advertisements");
          const data = await res.json();
          if (Array.isArray(data)) setAds(data);
          else setAds([]);
        } catch {
          setAds([]);
          showToast("No se pudieron cargar los anuncios", "error");
        } finally {
          setLoading(false);
          setLoadingMessage("");
        }
      };
      fetchAds();
    }
  }, [loggedIn]);

  // GUARDAR ADS
  const handleSave = async () => {
    try {
      setLoadingMessage("Guardando datos de anuncios…");
      setLoading(true);

      const res = await fetch("/api/advertisements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ads),
      });

      const json = await res.json();
      if (res.ok) {
        showToast("Datos de anuncios guardados", "success");
        console.log("URL JSON:", json.url);
      } else {
        showToast(json.error || "Error guardando datos de anuncios", "error");
      }
    } catch {
      showToast("Error guardando datos de anuncios", "error");
    } finally {
      setLoading(false);
      setLoadingMessage("");
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
    <div className="relative p-8 bg-gray-900 min-h-screen text-white">
      {/* OVERLAY SPINNER CON MENSAJE */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-white rounded-full animate-spin mb-4" />
          <p className="text-white text-lg font-semibold">{loadingMessage}</p>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">
        Mantenedor de Publicidad - Tablero Pullman
      </h1>

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

          {/* INPUT TÍTULO */}
          <label
            className="block mb-1 font-semibold text-white"
            htmlFor={`title-${ad.id}`}
          >
            Título
          </label>
          <input
            id={`title-${ad.id}`}
            className="p-2 rounded bg-gray-700 mb-4 w-full"
            value={ad.title}
            onChange={(e) =>
              setAds((prev) =>
                prev.map((a) =>
                  a.id === ad.id ? { ...a, title: e.target.value } : a
                )
              )
            }
            placeholder="Escribe el título del anuncio"
          />

          {/* INPUT DESCRIPCIÓN */}
          <label
            className="block mb-1 font-semibold text-white"
            htmlFor={`description-${ad.id}`}
          >
            Descripción
          </label>
          <input
            id={`description-${ad.id}`}
            className="p-2 rounded bg-gray-700 mb-4 w-full"
            value={ad.description}
            onChange={(e) =>
              setAds((prev) =>
                prev.map((a) =>
                  a.id === ad.id ? { ...a, description: e.target.value } : a
                )
              )
            }
            placeholder="Escribe la descripción del anuncio"
          />

          <div className="flex flex-col gap-1 mt-3">
            <label
              className="block font-semibold text-white"
              htmlFor={`file-${ad.id}`}
            >
              Subir imagen
            </label>
            <input
              id={`file-${ad.id}`}
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

const KUPOS_API_KEY = process.env.KUPOS_API_KEY;
const ORIGIN_ID = 1646; // Santiago

let cache = null;
let cacheTime = 0;
const CACHE_DURATION = 30 * 1000; // 30 segundos

// Lista de IDs de ciudades permitidas
const allowedCityIds = [
  2070, // Viña del Mar
  2058, // Valparaíso
  1760, // El Tabo
  1757, // El Quisco
  1652, // Algarrobo
  2007, // San Antonio
  1643, // Quillota
  1641, // Limache
  2063, // Villa Alemana
  1981, // Quilpué
  2013, // San Felipe
  1856, // Los Andes
  1688, // Cartagena
  1725, // Concón
  1904, // Olmué
  1986, // Rancagua
];

export async function GET() {
  try {
    if (cache && Date.now() - cacheTime < CACHE_DURATION) {
      return new Response(JSON.stringify(cache), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const citiesRes = await fetch(
      `https://gds.kupos.com/gds/api/cities.json?api_key=${KUPOS_API_KEY}`
    );
    const citiesData = await citiesRes.json();

    if (!citiesData.result) {
      cache = [];
      cacheTime = Date.now();
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cities = citiesData.result
      .slice(1)
      .filter((c) => allowedCityIds.includes(c[0]));

    const departures = [];

    const now = new Date();
    const scheduleTime = new Date(now.getTime() + 1.5 * 60 * 60 * 1000); // +1 hora y media

    for (const c of cities) {
      const cityName = c[1];
      const cityId = c[0];

      console.log(`Procesando ciudad: ${cityName} (ID: ${cityId})`);

      try {
        const scheduleRes = await fetch(
          `https://gds.kupos.com/gds/api/ui_schedules/${ORIGIN_ID}/${cityId}/${
            new Date().toISOString().split("T")[0]
          }.json?api_key=${KUPOS_API_KEY}`
        );
        const scheduleData = await scheduleRes.json();

        if (!scheduleData.result || scheduleData.result.length <= 1) continue;

        let count = 0; // contador de servicios por ciudad

        for (let i = 1; i < scheduleData.result.length; i++) {
          const s = scheduleData.result[i];

          if (s[47] !== "Pullman Costa") continue; // solo Pullman Costa

          // Convertimos la hora de salida a Date
          const [hour, minute] = s[9].split(":").map(Number);
          const depTime = new Date();
          depTime.setHours(hour, minute, 0, 0);

          // Filtramos por hora de tiempo
          if (depTime < now || depTime > scheduleTime) continue;

          // Tomamos la parte antes de ":" del índice 15
          const service = s[15] ? s[15].split(":")[0] : "EJECUTIVO";

          // Calculamos el status según la diferencia en minutos
          const diffMinutes = (depTime - now) / (1000 * 60);
          const status = diffMinutes <= 20 ? "LLEGANDO" : "A TIEMPO";

          departures.push({
            id: `${cityId}-${count}`, // key único por ciudad + índice
            destination: cityName,
            time: s[9] || "Sin servicios",
            service,
            status,
          });

          count++;
          if (count >= 3) break; // máximo 3 viajes por ciudad
        }
      } catch (err) {
        console.error(`Error fetching schedule for ${cityName}:`, err);
      }
    }

    // Ordenamos por hora de salida, los más cercanos primero
    departures.sort((a, b) => {
      const [ah, am] = a.time.split(":").map(Number);
      const [bh, bm] = b.time.split(":").map(Number);

      const depA = new Date();
      depA.setHours(ah, am, 0, 0);

      const depB = new Date();
      depB.setHours(bh, bm, 0, 0);

      return depA - depB;
    });

    cache = departures;
    cacheTime = Date.now();

    return new Response(JSON.stringify(departures), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching departures:", err);
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

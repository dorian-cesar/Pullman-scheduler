import { DateTime } from "luxon";

const NEXT_PUBLIC_KUPOS_API_KEY = process.env.NEXT_PUBLIC_KUPOS_API_KEY;

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
  1646, // Santiago
  1642, // Llay Llay
];

export async function GET(req) {
  try {
    // Obtener originId desde query params, fallback 1646
    const url = new URL(req.url);
    const originId = url.searchParams.get("originId") || "1646";

    console.log(`[API] Fetching departures for originId: ${originId}`);
    console.log(`[API] API Key Present: ${!!NEXT_PUBLIC_KUPOS_API_KEY}`);

    const citiesRes = await fetch(
      `https://gds.kupos.com/gds/api/cities.json?api_key=${NEXT_PUBLIC_KUPOS_API_KEY}`
    );
    const citiesData = await citiesRes.json();

    if (!citiesData.result) {
      console.warn("[API] No cities found in API response");
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Todas las ciudades, filtrando solo las permitidas
    const cities = citiesData.result
      .slice(1)
      .filter((c) => allowedCityIds.includes(c[0]));

    console.log(`[API] Found ${cities.length} allowed destinations`);

    const departures = [];

    // Hora actual en Chile
    const now = DateTime.now().setZone("America/Santiago");
    console.log(`[API] Current time in Santiago: ${now.toISODate()} ${now.toFormat("HH:mm")}`);

    for (const c of cities) {
      const cityName = c[1];
      const cityId = c[0];

      try {
        const scheduleUrl = `https://gds.kupos.com/gds/api/ui_schedules/${originId}/${cityId}/${now.toISODate()}.json?api_key=${NEXT_PUBLIC_KUPOS_API_KEY}`;
        // console.log(`[API] Fetching schedule for ${cityName} (${cityId}): ${scheduleUrl}`);

        const scheduleRes = await fetch(scheduleUrl);
        const scheduleData = await scheduleRes.json();

        if (!scheduleData.result || scheduleData.result.length <= 1) {
          // console.log(`[API] No schedules for ${cityName}`);
          continue;
        }

        let addedCount = 0;
        for (let i = 1; i < scheduleData.result.length; i++) {
          const s = scheduleData.result[i];

          // Filtrar operador "Pullman Costa"
          // console.log(`[API] Checking service: ${s[47]}`);
          if (s[47] !== "Pullman Costa") continue;

          const [hour, minute] = s[9].split(":").map(Number);
          const depTime = now.set({ hour, minute, second: 0, millisecond: 0 });

          // Filtrar pasados? El código original no filtraba pasados explícitamente, pero calculaba status.
          // Añadamos log si es viejo.

          // Extraer tipo de servicio
          const service = s[15] ? s[15].split(":")[0] : "EJECUTIVO";

          // Estado según proximidad
          const diffMinutes = depTime.diff(now, "minutes").toObject().minutes;

          // Si el bus ya salió hace mucho, quizás no deberíamos mostrarlo?
          // El código original mostraba todo lo del día.

          const status = diffMinutes <= 20 ? "LLEGANDO" : "A TIEMPO";

          // Terminal de salida
          let departureTerminal = "Desconocido";
          if (s[22]) {
            // boarding_stages
            const stages = s[22].split(","); // separar cada stage
            if (stages.length > 0) {
              const firstStage = stages[0]; // primer stage
              const stageParts = firstStage.split("|");
              departureTerminal =
                stageParts[stageParts.length - 1] || "Desconocido";
            }
          }

          departures.push({
            id: `${cityId}-${i}`,
            destination: cityName,
            time: s[9] || "Sin servicios",
            service,
            status,
            terminal: departureTerminal,
          });
          addedCount++;
        }
        if (addedCount > 0) {
          console.log(`[API] Added ${addedCount} departures for ${cityName}`);
        }

      } catch (err) {
        console.error(`Error fetching schedule for ${cityName}:`, err);
      }
    }

    console.log(`[API] Total departures found: ${departures.length}`);

    // Ordenar por hora de salida real
    departures.sort((a, b) => {
      const timeA = DateTime.fromFormat(a.time, "HH:mm", {
        zone: "America/Santiago",
      });
      const timeB = DateTime.fromFormat(b.time, "HH:mm", {
        zone: "America/Santiago",
      });
      return timeA - timeB;
    });

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

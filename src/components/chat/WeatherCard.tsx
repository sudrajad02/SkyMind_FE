import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  Sun,
  Wind,
} from "lucide-react";

export function WeatherCard({ weatherData }: { weatherData: any }) {
  if (!weatherData) return null;

  // 1. Parsing jika data berupa string JSON
  let data = weatherData;
  if (typeof weatherData === "string") {
    try {
      data = JSON.parse(weatherData);
    } catch {
      return null;
    }
  }

  if (typeof data !== "object" || data === null) return null;

  // 2. Ekstrak Nama Kota/Wilayah dari Objek Lokasi BMKG
  let kota = "Info Cuaca";
  if (typeof data.kota === "string") {
    kota = data.kota;
  } else if (typeof data.wilayah === "string") {
    kota = data.wilayah;
  } else if (typeof data.lokasi === "string") {
    kota = data.lokasi;
  } else if (typeof data.lokasi === "object" && data.lokasi !== null) {
    // Ambil kecamatan & kotkab jika lokasi berbentuk objek BMKG
    const loc = data.lokasi;
    const parts = [loc.kecamatan, loc.kotkab].filter(Boolean);
    kota = parts.length > 0 ? parts.join(", ") : loc.provinsi || "Lokasi BMKG";
  }

  // 3. Ekstrak data cuaca dari format array BMKG (data.cuaca) atau format datar
  let currentCuaca: any = null;
  if (Array.isArray(data.cuaca)) {
    if (Array.isArray(data.cuaca[0])) {
      currentCuaca = data.cuaca[0][0]; // format BMKG 2D array [ [ { t, hu, ... } ] ]
    } else if (typeof data.cuaca[0] === "object") {
      currentCuaca = data.cuaca[0];
    }
  } else if (typeof data.cuaca === "object" && data.cuaca !== null) {
    currentCuaca = data.cuaca;
  }

  // 4. Ekstrak kondisi cuaca
  let kondisi = "Cerah Berawan";
  if (typeof data.kondisi === "string") {
    kondisi = data.kondisi;
  } else if (typeof data.cuaca === "string") {
    kondisi = data.cuaca;
  } else if (currentCuaca) {
    kondisi = currentCuaca.weather_desc || currentCuaca.kondisi || "Cerah Berawan";
  }

  // 5. Ekstrak suhu (°C)
  let suhu: string | null = null;
  if (data.suhu !== undefined && typeof data.suhu !== "object") {
    suhu = `${String(data.suhu).replace("°C", "")}°C`;
  } else if (currentCuaca?.t !== undefined) {
    suhu = `${currentCuaca.t}°C`;
  }

  // 6. Ekstrak kelembapan (%)
  let kelembapan: string | null = null;
  if (data.kelembapan !== undefined && typeof data.kelembapan !== "object") {
    kelembapan = `${String(data.kelembapan).replace("%", "")}%`;
  } else if (currentCuaca?.hu !== undefined) {
    kelembapan = `${currentCuaca.hu}%`;
  }

  // 7. Ekstrak angin (km/jam)
  let angin: string | null = null;
  if (data.kecepatan_angin !== undefined && typeof data.kecepatan_angin !== "object") {
    angin = `${data.kecepatan_angin} km/jam`;
  } else if (data.angin !== undefined && typeof data.angin !== "object") {
    angin = `${data.angin}`;
  } else if (currentCuaca?.ws !== undefined) {
    angin = `${currentCuaca.ws} km/jam`;
  }

  // Icon dinamis berdasarkan kondisi cuaca
  const getWeatherIcon = (text: string) => {
    const k = String(text).toLowerCase();
    if (k.includes("petir") || k.includes("badai")) return <CloudLightning className="h-8 w-8 text-amber-500" />;
    if (k.includes("hujan")) return <CloudRain className="h-8 w-8 text-blue-500" />;
    if (k.includes("kabut") || k.includes("asap")) return <CloudFog className="h-8 w-8 text-slate-400" />;
    if (k.includes("cerah berawan") || k.includes("sebagian")) return <CloudSun className="h-8 w-8 text-amber-500" />;
    if (k.includes("berawan") || k.includes("mendung")) return <Cloud className="h-8 w-8 text-slate-500" />;
    return <Sun className="h-8 w-8 text-amber-500" />;
  };

  return (
    <div className="mt-3 w-full max-w-sm overflow-hidden rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4 shadow-xs">
      {/* Header Kartu */}
      <div className="flex items-center justify-between border-b border-sky-100 pb-2">
        <div>
          <p className="text-[10px] font-bold tracking-wider uppercase text-sky-600">
            BMKG Real-time
          </p>
          <h4 className="text-sm font-bold text-slate-900">{kota}</h4>
        </div>
        <div>{getWeatherIcon(kondisi)}</div>
      </div>

      {/* Konten Utama */}
      <div className="mt-3 flex items-baseline justify-between">
        <div>
          {suhu && (
            <span className="text-3xl font-extrabold text-slate-900">{suhu}</span>
          )}
          <p className="text-xs font-medium text-slate-600">{kondisi}</p>
        </div>

        {/* Indikator Angin & Kelembapan */}
        <div className="space-y-1 text-right text-xs text-slate-500">
          {kelembapan && (
            <div className="flex items-center justify-end gap-1">
              <Droplets className="h-3.5 w-3.5 text-sky-500" />
              <span>{kelembapan}</span>
            </div>
          )}
          {angin && (
            <div className="flex items-center justify-end gap-1">
              <Wind className="h-3.5 w-3.5 text-teal-500" />
              <span>{angin}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

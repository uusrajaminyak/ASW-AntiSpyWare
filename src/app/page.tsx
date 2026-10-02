"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [locationName, setLocationName] = useState<string>(
    "Mendeteksi koordinat GPS...",
  );

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("scan_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setLogs(data);
    };
    fetchLogs();

    const channel = supabase
      .channel("realtime-logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scan_logs" },
        (payload) => setLogs((prev) => [payload.new, ...prev]),
      )
      .subscribe();

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            );
            const data = await res.json();
            const city =
              data.address.city ||
              data.address.county ||
              data.address.town ||
              data.address.village ||
              "Lokasi Aktif";
            // FORMAT BARU: Kota + Koordinat Detail
            setLocationName(
              `${city} | Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
            );
          } catch (error) {
            setLocationName(
              `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
            );
          }
        },
        () => setLocationName("Akses GPS Ditolak!"),
      );
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsSafe = async (mac: string) => {
    const deviceName = prompt(
      "Masukkan nama untuk perangkat ini (Misal: HP Saya, Router Kamar):",
    );
    if (!deviceName) return;
    const { error } = await supabase
      .from("safe_devices")
      .insert([{ mac_address: mac, device_name: deviceName }]);
    if (error) alert("Gagal menyimpan: " + error.message);
    else alert(`${deviceName} berhasil ditambahkan ke daftar aman!`);
  };

  const getDistanceBadge = (details: string) => {
    if (!details) return null;
    const match = details.match(/\((-?\d+)\s*dBm\)/);
    if (!match) return null;
    const rssi = parseInt(match[1], 10);
    if (rssi >= -50)
      return {
        label: "Sangat Dekat (< 1m)",
        style: "bg-red-500/20 text-red-400 border-red-500/30",
      };
    else if (rssi >= -70)
      return {
        label: "Dekat (1-3m)",
        style: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      };
    else if (rssi >= -85)
      return {
        label: "Sedang (3-10m)",
        style: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      };
    else
      return {
        label: "Jauh (> 10m)",
        style: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      };
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-[85rem] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800 shadow-lg backdrop-blur-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
              </span>
              Privacy Radar
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Real-time Wireless & Optical Anomaly Detection
            </p>
            <p className="text-indigo-400 mt-1 font-mono text-xs flex items-center gap-1.5 animate-pulse">
              {locationName}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm bg-gray-950 px-5 py-2.5 rounded-xl border border-gray-800">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
            <span className="font-medium text-gray-300">Sistem Aktif</span>
          </div>
        </div>

        <div className="bg-gray-900/40 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="p-4 border-b border-gray-800 bg-gray-900/50">
            <h2 className="text-lg font-bold text-gray-200">
              Scan History & Log Data
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-950/80 text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-5 font-semibold">Waktu Deteksi</th>
                  <th className="px-6 py-5 font-semibold">Tipe Anomali</th>
                  <th className="px-6 py-5 font-semibold">MAC Address / ID</th>
                  <th className="px-6 py-5 font-semibold">Lokasi Pemindaian</th>
                  <th className="px-6 py-5 font-semibold">
                    Keterangan & Estimasi Jarak
                  </th>
                  <th className="px-6 py-5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Menunggu pemindaian dari perangkat...
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const isKnownSafe = log.details?.includes("[AMAN");
                    const distance = getDistanceBadge(log.details);

                    return (
                      <tr
                        key={log.id}
                        className={`transition-colors hover:bg-gray-800/40 ${isKnownSafe ? "opacity-60" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                          {new Date(log.created_at).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            },
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border ${
                              log.threat_type === "OPTIK"
                                ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                : log.threat_type === "BLE"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            {log.threat_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-300">
                          {log.mac_address || "N/A"}
                        </td>
                        {/* KOLOM LOKASI BARU */}
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {log.location || "Lokasi Lokal (Offline)"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2 items-start">
                            <span
                              className={`${isKnownSafe ? "text-green-400 font-medium" : "text-gray-300"}`}
                            >
                              {log.details || "-"}
                            </span>
                            {distance && !isKnownSafe && (
                              <span
                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${distance.style}`}
                              >
                                {distance.label}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {log.mac_address &&
                            log.mac_address !== "-" &&
                            !isKnownSafe && (
                              <button
                                onClick={() => markAsSafe(log.mac_address)}
                                className="text-xs font-semibold bg-gray-800 hover:bg-indigo-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all border border-gray-700"
                              >
                                Tandai Aman
                              </button>
                            )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

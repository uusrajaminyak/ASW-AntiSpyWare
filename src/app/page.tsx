"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([]);

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fungsi untuk Menandai Perangkat Aman (Room Baseline)
  const markAsSafe = async (mac: string) => {
    const deviceName = prompt(
      "Masukkan nama untuk perangkat ini (Misal: HP Saya, Router Kamar):",
    );
    if (!deviceName) return;

    const { error } = await supabase
      .from("safe_devices")
      .insert([{ mac_address: mac, device_name: deviceName }]);

    if (error) {
      alert("Gagal menyimpan: " + error.message);
    } else {
      alert(
        `${deviceName} berhasil ditambahkan ke daftar aman! Log berikutnya dari perangkat ini akan ditandai hijau.`,
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800 shadow-lg backdrop-blur-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
              </span>
              Privacy Radar PRO
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Real-time Wireless & Optical Anomaly Detection
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm bg-gray-950 px-5 py-2.5 rounded-xl border border-gray-800">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
            <span className="font-medium text-gray-300">Sistem Aktif</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-gray-900/40 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-950/80 text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-5 font-semibold">Waktu Deteksi</th>
                  <th className="px-6 py-5 font-semibold">Tipe Anomali</th>
                  <th className="px-6 py-5 font-semibold">MAC Address / ID</th>
                  <th className="px-6 py-5 font-semibold">
                    Keterangan & Identitas
                  </th>
                  <th className="px-6 py-5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Menunggu pemindaian dari perangkat ESP32...
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const isKnownSafe = log.details?.includes("[AMAN");
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
                        <td className="px-6 py-4">
                          <span
                            className={`${isKnownSafe ? "text-green-400 font-medium" : "text-gray-300"}`}
                          >
                            {log.details || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {log.mac_address &&
                            log.mac_address !== "-" &&
                            !isKnownSafe && (
                              <button
                                onClick={() => markAsSafe(log.mac_address)}
                                className="text-xs font-semibold bg-gray-800 hover:bg-indigo-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 border border-gray-700 hover:border-indigo-500"
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

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScanLog {
  id: string;
  created_at: string;
  threat_type: string;
  mac_address: string | null;
  location: string | null;
  details: string | null;
}

interface SafeDevice {
  mac_address: string;
  device_name: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHr < 24) return `${diffHr} jam lalu`;
  return then.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function getThreatInfo(type: string) {
  switch (type) {
    case "OPTIK":
      return {
        label: "Kamera Tersembunyi",
        icon: "\u{1F4F7}",
        description: "Terdeteksi perangkat optik yang berpotensi sebagai kamera pengintai",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        severity: "Tinggi",
        severityColor: "bg-red-500/20 text-red-400 border-red-500/30",
      };
    case "BLE":
      return {
        label: "Perangkat Bluetooth Asing",
        icon: "\u{1F4F6}",
        description: "Terdeteksi perangkat Bluetooth yang tidak dikenal di sekitar Anda",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        severity: "Sedang",
        severityColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      };
    default:
      return {
        label: "Perangkat Tidak Dikenal",
        icon: "\u{26A0}\u{FE0F}",
        description: "Terdeteksi perangkat nirkabel yang tidak dikenal",
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        severity: "Tinggi",
        severityColor: "bg-red-500/20 text-red-400 border-red-500/30",
      };
  }
}

function getDistanceInfo(details: string | null) {
  if (!details) return null;
  const match = details.match(/\((-?\d+)\s*dBm\)/);
  if (!match) return null;
  const rssi = parseInt(match[1], 10);
  if (rssi >= -50)
    return { label: "Sangat Dekat", desc: "Kurang dari 1 meter", color: "text-red-400", dot: "bg-red-500" };
  if (rssi >= -70)
    return { label: "Dekat", desc: "1–3 meter", color: "text-orange-400", dot: "bg-orange-500" };
  if (rssi >= -85)
    return { label: "Sedang", desc: "3–10 meter", color: "text-yellow-400", dot: "bg-yellow-500" };
  return { label: "Jauh", desc: "Lebih dari 10 meter", color: "text-gray-400", dot: "bg-gray-500" };
}

// ─── Components ──────────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  sublabel,
  accent,
}: {
  icon: string;
  value: string | number;
  label: string;
  sublabel?: string;
  accent: string;
}) {
  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-5 flex items-start gap-4">
      <div className={`text-2xl w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

function DetectionCard({
  log,
  isSafe,
  onMarkSafe,
}: {
  log: ScanLog;
  isSafe: boolean;
  onMarkSafe: (mac: string) => void;
}) {
  const threat = getThreatInfo(log.threat_type);
  const distance = getDistanceInfo(log.details);

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        isSafe
          ? "bg-green-500/5 border-green-500/20 opacity-70"
          : "bg-gray-900/50 border-gray-800 hover:border-gray-700"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`text-3xl w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${threat.bg}`}>
            {isSafe ? "\u{2705}" : threat.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white text-lg">
                {isSafe ? "Perangkat Aman" : threat.label}
              </h3>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${threat.severityColor}`}>
                {isSafe ? "Aman" : threat.severity}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {isSafe
                ? "Perangkat ini sudah Anda tandai sebagai aman"
                : threat.description}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                {timeAgo(log.created_at)}
              </span>
              {log.location && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                  {log.location}
                </span>
              )}
              {distance && !isSafe && (
                <span className={`flex items-center gap-1.5 ${distance.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${distance.dot}`}></span>
                  {distance.label} ({distance.desc})
                </span>
              )}
            </div>
          </div>
        </div>
        {!isSafe && log.mac_address && log.mac_address !== "-" && (
          <button
            onClick={() => onMarkSafe(log.mac_address!)}
            className="shrink-0 text-xs font-medium bg-gray-800 hover:bg-green-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all border border-gray-700 hover:border-green-500"
          >
            Tandai Aman
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [safeDevices, setSafeDevices] = useState<SafeDevice[]>([]);
  const [locationName, setLocationName] = useState<string>("Mendeteksi lokasi...");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("scan_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setLogs(data);
    };

    const fetchSafeDevices = async () => {
      const { data } = await supabase.from("safe_devices").select("*");
      if (data) setSafeDevices(data);
    };

    fetchLogs();
    fetchSafeDevices();

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
            setLocationName(city);
          } catch {
            setLocationName("Lokasi Aktif");
          }
        },
        () => setLocationName("Lokasi tidak tersedia"),
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
    else {
      setSafeDevices((prev) => [...prev, { mac_address: mac, device_name: deviceName }]);
      alert(`${deviceName} berhasil ditambahkan ke daftar aman!`);
    }
  };

  const isKnownSafe = (mac: string | null) =>
    !!mac && safeDevices.some((d) => d.mac_address === mac);

  const activeThreats = logs.filter(
    (l) => !isKnownSafe(l.mac_address) && l.mac_address && l.mac_address !== "-",
  ).length;
  const safeCount = safeDevices.length;
  const todayCount = logs.filter((l) => {
    const d = new Date(l.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200 font-sans">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
              </span>
              Privacy Radar
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Sistem Peringatan Kebocoran Privasi Nirkabel
            </p>
            <p className="text-indigo-400 mt-1 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              {locationName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-sm bg-gray-900 hover:bg-gray-800 text-gray-300 px-4 py-2.5 rounded-xl border border-gray-800 transition-all"
            >
              {showHelp ? "Tutup Bantuan" : "\u{2753} Bantuan"}
            </button>
            <div className="flex items-center gap-3 text-sm bg-gray-950 px-5 py-2.5 rounded-xl border border-gray-800">
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
              <span className="font-medium text-gray-300">Sistem Aktif</span>
            </div>
          </div>
        </div>

        {/* ── Help Panel ── */}
        {showHelp && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-indigo-300 text-lg">Cara Membaca Dashboard Ini</h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-orange-400">📷 Kamera Tersembunyi</p>
                <p className="text-gray-400">
                  Sistem mendeteksi perangkat optik (kamera) yang berpotensi digunakan untuk mengintai Anda secara diam-diam.
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-blue-400">📶 Perangkat Bluetooth Asing</p>
                <p className="text-gray-400">
                  Terdeteksi perangkat Bluetooth yang tidak dikenal di sekitar Anda. Bisa berupa pelacak, perangkat penyadap, atau perangkat mencurigakan lainnya.
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-300">📍 Estimasi Jarak</p>
                <p className="text-gray-400">
                  Menunjukkan seberapa dekat perangkat terdeteksi dengan Anda. Semakin dekat, semakin besar potensi risikonya.
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-400 pt-2 border-t border-indigo-500/20">
              <strong className="text-gray-300">Tips:</strong> Jika perangkat yang terdeteksi adalah perangkat milik Anda sendiri (misal Bluetooth earphone), klik &quot;Tandai Aman&quot; agar tidak muncul sebagai ancaman.
            </div>
          </div>
        )}

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon="📋"
            value={todayCount}
            label="Deteksi Hari Ini"
            sublabel="Total pemindaian yang tercatat"
            accent="bg-indigo-500/20"
          />
          <StatCard
            icon="⚠️"
            value={activeThreats}
            label="Ancaman Aktif"
            sublabel="Perangkat mencurigakan terdeteksi"
            accent="bg-red-500/20"
          />
          <StatCard
            icon="🛡️"
            value={safeCount}
            label="Perangkat Aman"
            sublabel="Perangkat yang sudah Anda verifikasi"
            accent="bg-green-500/20"
          />
        </div>

        {/* ── Detection Feed ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
            <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
            Riwayat Deteksi
          </h2>

          {logs.length === 0 ? (
            <div className="bg-gray-900/40 rounded-2xl border border-gray-800 p-12 text-center">
              <p className="text-4xl mb-4">📹</p>
              <p className="text-gray-400 text-lg">Belum ada deteksi</p>
              <p className="text-gray-500 text-sm mt-1">
                Sistem akan menampilkan perangkat yang terdeteksi di sini
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <DetectionCard
                  key={log.id}
                  log={log}
                  isSafe={isKnownSafe(log.mac_address)}
                  onMarkSafe={markAsSafe}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="text-center text-xs text-gray-600 pt-4 border-t border-gray-800/50">
          Privacy Radar &mdash; Sistem Deteksi Ancaman Nirkabel &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

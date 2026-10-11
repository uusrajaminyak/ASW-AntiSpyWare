"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

// ─── SVG Icons (Clean & Professional) ─────────────────────────────────────────

const Icons = {
  Camera: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
      />
    </svg>
  ),
  Signal: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
      />
    </svg>
  ),
  Shield: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  Warning: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  List: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  ),
  Info: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  ),
};

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

function getThreatInfo(type: string, details: string | null) {
  switch (type) {
    case "OPTIK":
      return {
        label: "Lensa / Perekam Visual",
        icon: <Icons.Camera />,
        description:
          "Alat ini menangkap pantulan mencurigakan yang mirip dengan lensa kamera.",
        advice:
          "Matikan lampu ruangan. Gunakan senter HP dan sapukan ke area sekitar. Cari titik kecil berwarna merah atau keunguan yang memantulkan cahaya.",
        color: "text-orange-400",
        bg: "bg-orange-500/10 text-orange-400",
        severity: "Risiko Tinggi",
        severityColor: "bg-red-500/20 text-red-400 border-red-500/30",
      };
    case "WIFI":
      const isHidden = !details || details.includes("Hidden SSID");
      if (isHidden) {
        return {
          label: "Jaringan Wi-Fi Tersembunyi",
          icon: <Icons.Signal />,
          description:
            "Ditemukan pemancar sinyal rahasia yang sengaja menyembunyikan identitasnya.",
          advice:
            "Periksa benda elektronik yang posisinya janggal (jam weker, detektor asap, stopkontak ganda). Jangan sentuh jika menemukan perangkat aneh.",
          color: "text-red-400",
          bg: "bg-red-500/10 text-red-400",
          severity: "Risiko Tinggi",
          severityColor: "bg-red-500/20 text-red-400 border-red-500/30",
        };
      } else {
        const match = details.match(/SSID:\s+(.*?)\s+\(/);
        const wifiName = match ? match[1] : "Tidak Diketahui";
        return {
          label: `Wi-Fi Terdeteksi: ${wifiName}`,
          icon: <Icons.Signal />,
          description:
            "Sistem mencatat kehadiran jaringan Wi-Fi ini di area Anda. Perhatikan jika namanya menyamar sebagai perangkat elektronik yang tidak wajar.",
          advice:
            "Jika nama jaringan ini mencurigakan (misal: bernama 'Smart-TV' padahal tidak ada TV di ruangan), harap waspada. Abaikan jika ini Wi-Fi umum.",
          color: "text-yellow-400",
          bg: "bg-yellow-500/10 text-yellow-400",
          severity: "Perlu Diperiksa",
          severityColor:
            "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        };
      }

    case "TRACKER":
      const isApple = details && details.includes("Apple");
      const trackerName = isApple
        ? "Apple AirTag / Perangkat Apple"
        : "Samsung SmartTag / Perangkat Samsung";

      return {
        label: "Alat Pelacak Lokasi Ditemukan",
        icon: <Icons.Warning />,
        description: `Sistem menangkap sinyal dari perangkat yang sering digunakan sebagai pelacak lokasi diam-diam (${trackerName}).`,
        advice:
          "Periksa saku tas, bagasi, atau bagian tersembunyi di dalam kendaraan Anda. Jika Anda memiliki perangkat merek ini di tubuh Anda, silakan tandai aman (abaikan).",
        color: "text-red-400",
        bg: "bg-red-500/10 text-red-400",
        severity: "Risiko Tinggi",
        severityColor: "bg-red-500/20 text-red-400 border-red-500/30",
      };

    case "SNIFFER":
      return {
        label: "Indikasi Pengiriman Video / Suara",
        icon: <Icons.Signal />,
        description:
          "Sistem mendeteksi lonjakan lalu lintas data nirkabel yang sangat tinggi (ratusan paket data per detik) di area Anda.",
        advice:
          "Aktivitas data yang sangat agresif ini adalah ciri khas dari sebuah kamera atau mikrofon nirkabel yang sedang menyiarkan rekaman Anda secara langsung ke internet.",
        color: "text-purple-400",
        bg: "bg-purple-500/10 text-purple-400",
        severity: "Sangat Kritis",
        severityColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      };
      
    case "BLE":
      const isBleHidden = !details || details.includes("Unnamed Device");
      if (isBleHidden) {
        return {
          label: "Perangkat Bluetooth Anonim",
          icon: <Icons.Signal />,
          description: "Ditemukan sinyal Bluetooth tanpa nama di sekitar Anda.",
          advice:
            "Pastikan ini bukan dari TWS/earphone, smartwatch, atau stylus HP Anda. Jika bukan, ada kemungkinan ini adalah perangkat pelacak asing.",
          color: "text-blue-400",
          bg: "bg-blue-500/10 text-blue-400",
          severity: "Perlu Diperiksa",
          severityColor:
            "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        };
      } else {
        const matchBle = details.match(/Nama:\s+(.*?)\s+\(/);
        const bleNameUI = matchBle ? matchBle[1] : "Tidak Diketahui";
        return {
          label: `Bluetooth Terdeteksi: ${bleNameUI}`,
          icon: <Icons.Signal />,
          description:
            "Perangkat Bluetooth aktif memancarkan sinyal dari jarak dekat.",
          advice:
            "Waspadai jika nama perangkat ini terlihat seperti nama palsu atau Anda tidak memiliki perangkat elektronik tersebut di ruangan ini.",
          color: "text-indigo-400",
          bg: "bg-indigo-500/10 text-indigo-400",
          severity: "Perlu Diperiksa",
          severityColor:
            "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        };
      }
    default:
      return {
        label: "Sinyal Tidak Dikenal",
        icon: <Icons.Warning />,
        description: "Terdeteksi aktivitas nirkabel mencurigakan.",
        advice: "Abaikan jika Anda sedang berada di area publik yang ramai.",
        color: "text-gray-400",
        bg: "bg-gray-500/10 text-gray-400",
        severity: "Status Biasa",
        severityColor: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      };
  }
}

function getDistanceInfo(details: string | null) {
  if (!details) return null;
  const match = details.match(/\((-?\d+)\s*dBm\)/);
  if (!match) return null;
  const rssi = parseInt(match[1], 10);
  if (rssi >= -50)
    return {
      label: "Sangat Dekat",
      desc: "Radius 0 - 1 meter",
      color: "text-red-400",
      dot: "bg-red-500",
    };
  if (rssi >= -70)
    return {
      label: "Dekat",
      desc: "Radius 1 - 3 meter",
      color: "text-orange-400",
      dot: "bg-orange-500",
    };
  if (rssi >= -85)
    return {
      label: "Sedang",
      desc: "Radius 3 - 10 meter",
      color: "text-yellow-400",
      dot: "bg-yellow-500",
    };
  return {
    label: "Jauh",
    desc: "Lebih dari 10 meter",
    color: "text-gray-500",
    dot: "bg-gray-600",
  };
}

function getVendorInfo(mac: string | null) {
  if (!mac || mac === "-") return null;

  // 1. Deteksi Randomized MAC Address (Fitur bawaan HP)
  if (/^[0-9A-Fa-f][26aAeE][:-]/.test(mac)) {
    return {
      label: "Indikasi Smartphone / Smartwatch",
      desc: "Sinyal ini memiliki ciri khas sebuah handphone modern atau jam tangan pintar yang sedang menyembunyikan identitas aslinya.",
      isSuspicious: false,
    };
  }

  // 2. Database Mini Vendor OUI (Modul Rakitan vs Pabrikan)
  const prefix = mac.substring(0, 8).toUpperCase().replace(/-/g, ":");
  const ouiDatabase: Record<string, string> = {
    "A4:C1:38": "Modul Rakitan (Espressif)",
    "24:62:AB": "Modul Rakitan (Espressif)",
    "B8:27:EB": "Mini PC Rakitan (Raspberry Pi)",
    "DC:A6:32": "Mini PC Rakitan (Raspberry Pi)",
    "00:1A:11": "Perangkat Google",
    "04:52:F3": "Perangkat Intel",
    "28:E3:47": "Perangkat Apple",
  };

  const vendorName = ouiDatabase[prefix];

  if (vendorName) {
    const isDIY = vendorName.includes("Rakitan");
    return {
      label: isDIY ? "ALAT RAKITAN MENCURIGAKAN" : `Vendor: ${vendorName}`,
      desc: isDIY
        ? "SANGAT WASPADA: Ini adalah sinyal dari modul sirkuit mentah (microcontroller). Sering digunakan oleh pihak tidak bertanggung jawab untuk merakit kamera penyadap buatan sendiri!"
        : "Ini adalah perangkat elektronik dari merek resmi ternama.",
      isSuspicious: isDIY,
    };
  }

  // 3. Fallback untuk perangkat elektronik umum
  return {
    label: "Perangkat Elektronik Umum",
    desc: "Ini adalah perangkat elektronik biasa (seperti Smart TV, Speaker, atau Printer). Jika Anda TIDAK melihat ada alat elektronik di sekitar Anda, waspadai kemungkinan kamera tersembunyi.",
    isSuspicious: false,
  };
}

// ─── Components ──────────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  sublabel,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  sublabel?: string;
}) {
  return (
    <div className="bg-[#121826] rounded-2xl border border-gray-800/80 p-5 flex items-start gap-4">
      <div className="text-gray-400 w-10 h-10 rounded-xl flex items-center justify-center bg-gray-800/50">
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-sm font-medium text-gray-300">{label}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-1">{sublabel}</p>}
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
  const threat = getThreatInfo(log.threat_type, log.details);
  const distance = getDistanceInfo(log.details);
  const vendorInfo = getVendorInfo(log.mac_address);

  return (
    <div
      className={`rounded-xl border p-5 transition-all duration-300 ${isSafe ? "bg-green-950/10 border-green-900/30 opacity-60" : "bg-[#121826] border-gray-800 hover:border-gray-700"}`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
        <div className="flex items-start gap-4 flex-1">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${threat.bg}`}
          >
            {isSafe ? <Icons.Shield /> : threat.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-semibold text-gray-100 text-lg tracking-tight">
                {isSafe ? "Perangkat Pribadi (Aman)" : threat.label}
              </h3>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${threat.severityColor}`}
              >
                {isSafe ? "Telah Diabaikan" : threat.severity}
              </span>
            </div>

            <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
              {isSafe
                ? "Anda telah mengonfirmasi bahwa perangkat ini aman dan bukan ancaman."
                : threat.description}
            </p>

            {/* Tampilan Analisis Vendor / MAC */}
            {!isSafe && vendorInfo && log.mac_address !== "-" && (
              <div
                className={`mt-3 mb-1 px-3 py-2 rounded-md border border-dashed ${vendorInfo.isSuspicious ? "bg-red-950/30 border-red-900/50" : "bg-gray-800/30 border-gray-700"}`}
              >
                <p
                  className={`text-xs font-semibold ${vendorInfo.isSuspicious ? "text-red-400" : "text-gray-300"}`}
                >
                  {vendorInfo.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {vendorInfo.desc}
                </p>
              </div>
            )}

            {/* Actionable SOP Advice */}
            {!isSafe && (
              <div className="mt-3 p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-lg flex gap-3 items-start">
                <div className="text-indigo-400 shrink-0 mt-0.5">
                  <Icons.Info />
                </div>
                <div>
                  <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                    Saran Tindakan
                  </p>
                  <p className="text-sm text-indigo-200/80 leading-relaxed">
                    {threat.advice}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5">
                Waktu:{" "}
                <span className="text-gray-300">{timeAgo(log.created_at)}</span>
              </span>

              {distance && !isSafe && (
                <span
                  className={`flex items-center gap-1.5 ${distance.color} bg-gray-900 px-2 py-1 rounded-md border border-gray-800`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${distance.dot} animate-pulse`}
                  ></span>
                  Jarak: {distance.label} ({distance.desc})
                </span>
              )}
            </div>
          </div>
        </div>

        {!isSafe && log.mac_address && log.mac_address !== "-" && (
          <button
            onClick={() => onMarkSafe(log.mac_address!)}
            className="shrink-0 w-full md:w-auto text-sm font-medium bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white px-5 py-2.5 rounded-lg transition-all border border-gray-700 hover:border-gray-600"
          >
            Abaikan
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
  const [locationName, setLocationName] = useState<string>(
    "Menyinkronkan lokasi...",
  );
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
        (payload: { new: any }) => setLogs((prev) => [payload.new, ...prev]),
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
            setLocationName("Sistem Satelit Aktif");
          }
        },
        () => setLocationName("Lokasi Anonim"),
      );
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsSafe = async (mac: string) => {
    const isConfirm = window.confirm(
      "Apakah Anda yakin ini adalah perangkat milik Anda sendiri? Sistem akan mengabaikan sinyal ini ke depannya.",
    );
    if (!isConfirm) return;

    const deviceName = "Perangkat Pribadi (" + mac.slice(-5) + ")";
    const { error } = await supabase
      .from("safe_devices")
      .insert([{ mac_address: mac, device_name: deviceName }]);

    if (error) alert("Gagal mengabaikan perangkat: " + error.message);
    else {
      setSafeDevices((prev) => [
        ...prev,
        { mac_address: mac, device_name: deviceName },
      ]);
    }
  };

  const isKnownSafe = (mac: string | null) =>
    !!mac && safeDevices.some((d) => d.mac_address === mac);
  const activeThreats = logs.filter(
    (l) =>
      !isKnownSafe(l.mac_address) && l.mac_address && l.mac_address !== "-",
  );
  const uniqueActiveThreats = new Set(
    activeThreats.map((t) => t.mac_address || t.threat_type),
  ).size;
  const safeCount = safeDevices.length;
  const todayCount = logs.filter((l) => {
    const d = new Date(l.created_at);
    return d.toDateString() === new Date().toDateString();
  }).length;

  return (
    <div className="min-h-screen bg-[#06080c] text-gray-200 font-sans selection:bg-indigo-500/30">
      <div className="max-w-[70rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-800/60">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
              Privacy Radar PRO
            </h1>
            <p className="text-gray-400 mt-1.5 text-sm font-medium">
              Sistem Pemindai Keamanan Ruangan Terpadu
            </p>
          </div>
          <div className="flex items-center gap-3 bg-[#121826] px-4 py-2 rounded-lg border border-gray-800">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              LOKASI
            </span>
            <span className="text-sm font-medium text-gray-200">
              {locationName}
            </span>
          </div>
        </div>

        {/* ── Global Status Banner (Radar Status) ── */}
        <div
          className={`w-full rounded-2xl p-6 md:p-8 flex items-center gap-6 border transition-colors ${uniqueActiveThreats > 0 ? "bg-red-950/20 border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.1)]" : "bg-green-950/20 border-green-900/50 shadow-[0_0_30px_rgba(34,197,94,0.05)]"}`}
        >
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${uniqueActiveThreats > 0 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}
          >
            {uniqueActiveThreats > 0 ? <Icons.Warning /> : <Icons.Shield />}
          </div>
          <div>
            <h2
              className={`text-2xl font-bold tracking-tight mb-1 ${uniqueActiveThreats > 0 ? "text-red-400" : "text-green-400"}`}
            >
              {uniqueActiveThreats > 0
                ? "Ditemukan Anomali!"
                : "Aman, Tidak Ada Anomali"}
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              {uniqueActiveThreats > 0
                ? `Sistem mendeteksi ${uniqueActiveThreats} perangkat di sekitar Anda yang memiliki karakteristik seperti perangkat penyadap atau pelacak rahasia. Silakan periksa daftar di bawah.`
                : "Saat ini tidak ada sinyal Wi-Fi tersembunyi, transmisi Bluetooth asing, maupun pendaran lensa kamera pengintai di area Anda."}
            </p>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            icon={<Icons.List />}
            value={todayCount}
            label="Pemindaian"
            sublabel="Data terekam hari ini"
          />
          <StatCard
            icon={<Icons.Warning />}
            value={uniqueActiveThreats}
            label="Anomali Terdeteksi"
            sublabel="Perlu pengecekan fisik"
          />
          <StatCard
            icon={<Icons.Shield />}
            value={safeCount}
            label="Perangkat Pribadi"
            sublabel="Diabaikan oleh sistem"
          />
        </div>

        {/* ── Detection Feed ── */}
        <div className="space-y-5 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2.5">
              Riwayat Deteksi Terkini
            </h2>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
            >
              <Icons.Info /> Panduan Sistem
            </button>
          </div>

          {showHelp && (
            <div className="bg-[#121826] border border-gray-800 rounded-xl p-5 text-sm text-gray-400 leading-relaxed space-y-3">
              <p>
                <strong className="text-gray-200">
                  Apa itu fitur "Abaikan"?
                </strong>
                <br />
                Handphone modern terus mengacak identitas nirkabelnya (MAC
                Address) untuk menjaga privasi. Sistem kami mungkin menangkap
                sinyal dari HP/Earphone Anda sendiri dan menganggapnya sebagai
                ancaman. Jika Anda sedang memegang HP atau menggunakan aksesoris
                Bluetooth, tekan tombol abaikan agar sistem berhenti membunyikan
                peringatan untuk alat tersebut.
              </p>
            </div>
          )}

          {logs.length === 0 ? (
            <div className="bg-[#121826]/50 rounded-2xl border border-gray-800/50 p-16 flex flex-col items-center justify-center text-center">
              <div className="text-gray-600 mb-4 bg-gray-800/30 p-4 rounded-full">
                <Icons.Shield />
              </div>
              <p className="text-gray-300 font-medium text-lg">
                Sistem Sedang Memantau
              </p>
              <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                Riwayat temuan perangkat mencurigakan akan langsung muncul di
                sini secara otomatis.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
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
        <div className="text-center text-xs font-medium text-gray-600 pt-8 pb-4">
          Privacy Radar PRO &mdash; Berjalan di infrastruktur komputasi waktu
          nyata.
        </div>
      </div>
    </div>
  );
}

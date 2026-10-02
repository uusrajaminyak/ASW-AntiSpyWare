import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { threat_type, mac_address, details } = body;

    if (!threat_type)
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 },
      );

    // 1. Cek Baseline Perangkat Aman
    let isSafe = false;
    if (mac_address && mac_address !== "-") {
      const { data: safeData } = await supabase
        .from("safe_devices")
        .select("device_name")
        .eq("mac_address", mac_address)
        .single();
      if (safeData) {
        isSafe = true;
        details = `[AMAN - ${safeData.device_name}] ${details}`;
      } else {
        try {
          const res = await fetch(`https://api.macvendors.com/${mac_address}`);
          if (res.ok) {
            const vendor = await res.text();
            details = `[Vendor: ${vendor}] ${details}`;
          }
        } catch (e) {}
      }
    }

    // 2. Lacak Lokasi ESP32 via IP Publik (Geolocation)
    let deviceLocation = "Lokasi Lokal (Offline)";
    try {
      // Mengambil IP Publik dari header Vercel/Next.js
      const forwarded = request.headers.get("x-forwarded-for");
      const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";

      // Menggunakan API gratis ip-api.com
      if (ip !== "127.0.0.1" && ip !== "::1") {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
        const geoData = await geoRes.json();
        if (geoData.status === "success") {
          deviceLocation = `${geoData.city}, ${geoData.country} (${geoData.lat}, ${geoData.lon})`;
        }
      }
    } catch (err) {
      console.error("Gagal melacak lokasi IP");
    }

    // 3. Simpan ke database beserta lokasinya
    const { data, error } = await supabase
      .from("scan_logs")
      .insert([{ threat_type, mac_address, details, location: deviceLocation }])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data, isSafe }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

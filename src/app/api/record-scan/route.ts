import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { threat_type, mac_address, details } = body;

    if (!threat_type) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });

    // 1. Cek apakah MAC Address ini ada di tabel perangkat aman (Baseline)
    let isSafe = false;
    if (mac_address && mac_address !== "-") {
      const { data: safeData } = await supabase
        .from('safe_devices')
        .select('device_name')
        .eq('mac_address', mac_address)
        .single();
      
      if (safeData) {
        isSafe = true;
        details = `[AMAN - ${safeData.device_name}] ${details}`;
      } else {
        // 2. Jika belum dikenal, lacak nama vendornya (Device Identification)
        try {
          const res = await fetch(`https://api.macvendors.com/${mac_address}`);
          if (res.ok) {
            const vendor = await res.text();
            details = `[Vendor: ${vendor}] ${details}`;
          }
        } catch (e) {
          // Abaikan jika API pencari vendor sedang limit
        }
      }
    }

    // 3. Simpan ke log
    const { data, error } = await supabase
      .from('scan_logs')
      .insert([{ threat_type, mac_address, details }])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data, isSafe }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
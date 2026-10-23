"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import css from "./admin.module.css";

// Live order feed: any change in `orders` refreshes the current admin page; a newly paid order also shows a
// toast and a short beep. Realtime delivers rows only to admins (RLS). A slow poll covers a dropped socket.

const POLL_MS = 60_000;

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // audio blocked until the first click on the page
  }
}

export function LiveOrders() {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState<{ number: string } | null>(null);
  const announced = useRef(new Set<string>());

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled || !data.session) return;
      supabase.realtime.setAuth(data.session.access_token);
      channel = supabase
        .channel("admin-orders")
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
          const row = payload.new as { id?: string; order_number?: string; status?: string } | undefined;
          if (row?.id && row.status === "paid" && !announced.current.has(row.id)) {
            announced.current.add(row.id);
            setToast({ number: row.order_number ?? "" });
            beep();
          }
          router.refresh();
        })
        .subscribe((status) => setConnected(status === "SUBSCRIBED"));
    })();

    const poll = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(poll);
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <>
      <span className={css.live} data-on={connected} title={connected ? "Nové objednávky sa zobrazia automaticky" : "Bez živého pripojenia, obnovuje sa každú minútu"}>
        {connected ? "Živo" : "Obnova každú minútu"}
      </span>
      {toast && (
        <div className={css.toast} role="status">
          <span>
            Nová zaplatená objednávka{" "}
            <Link href={`/admin/objednavky/${encodeURIComponent(toast.number)}`} onClick={() => setToast(null)}>
              {toast.number}
            </Link>
          </span>
          <button type="button" className={css.linkButton} onClick={() => setToast(null)}>
            Zavrieť
          </button>
        </div>
      )}
    </>
  );
}

import { Mail, MessageCircle, Phone } from "lucide-react";
import { whatsappUrl } from "@/lib/format";
import type { ShopSettings } from "@/lib/catalog";
import css from "@/components/shop/shop.module.css";

// "Need help?" panel of the portal: WhatsApp, phone and e-mail of the shop.
export function HelpCard({ settings, hours }: { settings: ShopSettings; hours?: string | null }) {
  return (
    <aside className={css.gpsr} aria-label="Kontakt na predajňu">
      <p className={css.gpsrHead}>Potrebujete poradiť?</p>
      <div className={css.helpBody}>
        {settings.phone && (
          <a
            href={whatsappUrl(settings.phone, "Dobrý deň, mám otázku k nákupu v Royal Shope.")}
            className={css.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={20} aria-hidden="true" />
            <span>
              Napísať na WhatsApp
              <small>Odpovedáme v pracovnom čase</small>
            </span>
          </a>
        )}
        <dl className={css.gpsrList}>
          {settings.phone && (
            <div>
              <dt>
                <Phone size={14} aria-hidden="true" /> Telefón
              </dt>
              <dd>
                <a href={`tel:${settings.phone.replace(/\s+/g, "")}`}>{settings.phone}</a>
              </dd>
            </div>
          )}
          {settings.email && (
            <div>
              <dt>
                <Mail size={14} aria-hidden="true" /> E-mail
              </dt>
              <dd>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </dd>
            </div>
          )}
          {hours && (
            <div>
              <dt>Pracovný čas</dt>
              <dd>{hours}</dd>
            </div>
          )}
        </dl>
      </div>
    </aside>
  );
}

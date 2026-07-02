import Link from "next/link";
import { Phone, MessageCircle, Mail } from "lucide-react";

interface DealerActionsProps {
  carTitle: string;
  carUrl?: string;
}

export default function DealerActions({ carTitle, carUrl }: DealerActionsProps) {
  const phone = process.env.NEXT_PUBLIC_DEALER_PHONE || "";
  const whatsapp = process.env.NEXT_PUBLIC_DEALER_WHATSAPP || "";

  const message = encodeURIComponent(
    `Hi, I'm interested in the ${carTitle}${carUrl ? ` (${carUrl})` : ""}. Is it still available?`
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Link href={`/contact?subject=${encodeURIComponent(carTitle)}`} className="btn-primary w-full">
        <Mail className="h-4 w-4" />
        Contact Dealer
      </Link>
      <a href={`tel:${phone}`} className="btn-outline w-full">
        <Phone className="h-4 w-4" />
        Call Dealer
      </a>
      <a
        href={`https://wa.me/${whatsapp}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-outline w-full border-emerald-500/30 text-emerald-300 hover:border-emerald-400 hover:text-emerald-300"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </a>
    </div>
  );
}

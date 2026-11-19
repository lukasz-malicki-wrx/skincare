import Link from "next/link";
import { routes } from "@/config/routes";
import { SpriteIcon } from "@/features/landing/icons";
import { MONTHLY_PRICE_PLN } from "@/lib/subscription";

export function PricingSection() {
  return (
    <section id="pricing" className="pricing container">
      <div className="price-card">
        <SpriteIcon id="i-star" className="price-card__spark" aria-hidden="true" />
        <span className="eyebrow">Pricing</span>
        <h2 className="h2">Get full access</h2>
        <p className="price-card__lead">Everything unlocked. Your routine keeps up.</p>
        <div className="price">
          <span className="price__amount">{MONTHLY_PRICE_PLN} zł</span>
          <span className="price__unit">/ month after trial</span>
        </div>
        <p className="price-card__terms">Cancel any time, in two taps.</p>
        <Link className="btn btn--primary btn--lg price-card__cta" href={routes.app.home}>
          Try now
        </Link>
        <p className="microcopy">We&apos;ll remind you before the trial ends. No surprises.</p>
      </div>
    </section>
  );
}

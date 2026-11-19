import Link from "next/link";
import { routes } from "@/config/routes";
import { SpriteIcon } from "@/features/landing/icons";

export function FinalCta() {
  return (
    <section className="final container">
      <div className="final__card">
        <SpriteIcon id="i-star" className="final__spark" aria-hidden="true" />
        <div className="final__copy">
          <h2 className="final__title">Your skin changes every day. Your routine should keep up.</h2>
          <Link className="btn btn--cream btn--lg" href={routes.app.home}>
            Download the app <SpriteIcon id="i-arrow" width="18" height="18" aria-hidden="true" />
          </Link>
        </div>
        <div className="final__visual">
          <div aria-hidden className="final__photo photo photo--final" />
          <div className="final__outline" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

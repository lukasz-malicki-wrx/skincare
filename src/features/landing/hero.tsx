/* eslint-disable @next/next/no-img-element -- decorative images sized and clipped by landing.css */
import Link from "next/link";
import { routes } from "@/config/routes";
import { SpriteIcon } from "@/features/landing/icons";
import { PhoneMock } from "@/features/landing/phone-mock";

export function Hero() {
  return (
    <section id="top" className="hero container">
      <div className="hero__copy">
        <SpriteIcon id="i-star" className="hero__spark" aria-hidden="true" />
        <h1 className="hero__title">
          <img className="hero__pill hero__pill--wide" src="/landing/img/redhead-side.jpg" alt="" />
          Your skin, finally{" "}
          <span className="nowrap">
            understood.
            <img className="hero__pill hero__pill--round" src="/landing/img/texture-side.jpg" alt="" />
          </span>
        </h1>
        <p className="hero__lead">
          One photo gives you a full skin report, a morning and evening routine, and a product list that fits your
          budget. Ready in seconds.
        </p>

        <dl className="hero__facts">
          <div>
            <dt>1 photo</dt>
            <dd>Full skin report</dd>
          </div>
          <div>
            <dt>AM + PM</dt>
            <dd>Daily routine</dd>
          </div>
        </dl>

        <div className="hero__actions">
          <div className="hero__buttons">
            <Link className="btn btn--primary btn--lg" href={routes.app.home}>
              Scan my skin <SpriteIcon id="i-arrow" width="18" height="18" aria-hidden="true" />
            </Link>
            <a className="text-link" href="#how">
              See how it works
            </a>
          </div>
          <p className="microcopy">No sign-up. No card. You&apos;re in the app in 10 seconds.</p>
        </div>
      </div>

      <div className="hero__visual">
        <div className="hero__stage">
          <div
            className="hero__photo photo photo--hero"
            role="img"
            aria-label="Woman with glowing, healthy skin, eyes closed in soft sunlight"
          />
          <div className="hero__outline" aria-hidden="true" />
          <PhoneMock />
          <div className="badge" aria-hidden="true">
            <svg className="badge__ring" viewBox="0 0 112 112">
              <defs>
                <path id="badge-ring" d="M56 56m-42 0a42 42 0 1 1 84 0a42 42 0 1 1 -84 0" />
              </defs>
              <text fontSize="10" letterSpacing="3">
                <textPath href="#badge-ring">ONE PHOTO · READY IN SECONDS · </textPath>
              </text>
            </svg>
            <span className="badge__core">
              <SpriteIcon id="i-camera" width="24" height="24" strokeWidth="1.6" />
            </span>
          </div>
          <SpriteIcon id="i-star" className="hero__deco hero__deco--a" aria-hidden="true" />
          <SpriteIcon id="i-star" className="hero__deco hero__deco--b" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

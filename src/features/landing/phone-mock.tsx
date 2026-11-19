/* eslint-disable @next/next/no-img-element -- static brand image sized by landing.css */

/** Fill widths per row live in landing.css (`.phone__metrics`). */
const METRICS = [
  { label: "Hydration", value: "Low", tone: "meter--accent" },
  { label: "Texture", value: "Good" },
  { label: "Blemishes", value: "Mild" },
  { label: "Signs of ageing", value: "Early", tone: "meter--light" },
] as const;

const MORNING_STEPS = ["Gentle cleanser", "Hydrating serum", "Moisturiser", "SPF 50"] as const;

/** The app screen inside the hero: a static, decorative mock of the skin report. */
export function PhoneMock() {
  return (
    <div className="phone" aria-hidden="true">
      <div className="phone__screen">
        <div className="phone__head">
          <span className="phone__title">Your skin report</span>
          <img src="/landing/img/logo.png" alt="" width="26" height="26" />
        </div>
        <div className="phone__metrics">
          {METRICS.map((metric) => (
            <div key={metric.label}>
              <div className="phone__row">
                <span>{metric.label}</span>
                <span>{metric.value}</span>
              </div>
              <div className="meter">
                <span className={"tone" in metric ? metric.tone : undefined} />
              </div>
            </div>
          ))}
        </div>
        <div className="phone__routine">
          <div className="phone__row phone__row--strong">
            <span>Morning routine</span>
            <span>{MORNING_STEPS.length} steps</span>
          </div>
          {MORNING_STEPS.map((step, index) => (
            <div key={step} className="phone__step">
              <span>{index + 1}</span>
              {step}
            </div>
          ))}
        </div>
        <div className="phone__cta">See my product list</div>
      </div>
    </div>
  );
}

import { CornerButton } from "@/features/landing/corner-button";
import { LineIcon } from "@/components/line-icon";

/** Bar widths live in landing.css (`.barcode i:nth-child`). */
const BARCODE_BARS = 15;

export function FeatureCards() {
  return (
    <div className="feature-cards">
      <article className="feature">
        <div className="feature__visual photo photo--report">
          <CornerButton />
          <div className="bubble bubble--start">
            <b>What&apos;s going on:</b> mild dehydration around the cheeks.
          </div>
          <div className="bubble bubble--end bubble--cream">
            <b>Why:</b> a stripping cleanser, low moisture barrier.
          </div>
          <div className="bubble bubble--start">
            <b>What to do:</b> switch to a gentle gel, add a humectant serum.
          </div>
          <span className="tag">Skin report</span>
        </div>
        <h3 className="h3">See what the mirror doesn&apos;t tell you</h3>
        <p>A clear breakdown of your skin: what&apos;s going on, why, and what to do about it. No jargon.</p>
      </article>

      <article className="feature">
        <div
          className="feature__visual feature__visual--start photo photo--scan"
        >
          <CornerButton />
          <div className="barcode" aria-hidden="true">
            {Array.from({ length: BARCODE_BARS }, (_, bar) => (
              // A fixed decorative pattern that never reorders: the position is the bar's identity.
              <i key={bar} />
            ))}
            <span className="barcode__laser" />
          </div>
          <div className="chip">
            <LineIcon size={16} strokeWidth={2.2}>
              <path d="M5 12l5 5 9-10" />
            </LineIcon>
            Belongs in your routine
          </div>
          <span className="tag">Barcode scan</span>
        </div>
        <h3 className="h3">Scan before you buy</h3>
        <p>
          Standing in a drugstore holding a bottle? Scan the barcode. We&apos;ll tell you if it belongs in your
          routine — or what to grab instead.
        </p>
      </article>

      <article className="feature">
        <div className="feature__visual photo photo--swap">
          <CornerButton />
          <div className="swap">
            <span className="swap__icon">
              <LineIcon size={16} strokeWidth={1.8}>
                <path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />
              </LineIcon>
            </span>
            <span className="swap__text">
              <s>Foaming cleanser</s>
              <b>Gentle gel cleanser · [PRICE]</b>
            </span>
          </div>
          <span className="tag">One-tap swap</span>
        </div>
        <h3 className="h3">Don&apos;t like a product? Swap it.</h3>
        <p>One tap replaces any product with an alternative in the same category and price range.</p>
      </article>
    </div>
  );
}


import { LockIcon } from "@/components/icons";
import { LineIcon } from "@/components/line-icon";

/** Heights, colours and stagger of the progress bars live in landing.css (`.bar:nth-child`). */
const BAR_COUNT = 6;

export function PrivacySection() {
  return (
    <section id="privacy" className="privacy">
      <div className="container privacy__inner">
        <div className="privacy__copy">
          <span className="eyebrow eyebrow--deep">Privacy</span>
          <h2 className="privacy__title">Your face stays yours.</h2>
          <p className="privacy__text">
            Your photos do two things: build your routine, and show you how your skin changes over time. That&apos;s
            it. We never sell them, never share them, and never use them to train anything. They&apos;re stored
            securely and only you can see them.
          </p>
          <ul className="assurances">
            <li>
              <span className="assurances__icon">
                <LineIcon size={18} strokeWidth={1.6}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M5.6 5.6l12.8 12.8" />
                </LineIcon>
              </span>
              Never sold or shared
            </li>
            <li>
              <span className="assurances__icon">
                <LockIcon size={18} strokeWidth={1.6} />
              </span>
              Only you can see them
            </li>
          </ul>
          <p className="privacy__note">
            Keep your photos and your progress chart keeps growing — that&apos;s where you&apos;ll actually see the
            difference.
          </p>
        </div>
        <div className="privacy__visual">
          <div className="vault">
            <div
              className="vault__photo photo photo--privacy"
              role="img"
              aria-label="Smiling woman resting her head on a white pillow"
            />
            <span className="vault__lock" aria-hidden="true">
              <LockIcon size={26} strokeWidth={1.6} />
            </span>
            <div className="vault__head">
              <b>Your progress</b>
              <span>Private</span>
            </div>
            <div className="bars" data-reveal aria-hidden="true">
              {Array.from({ length: BAR_COUNT }, (_, bar) => (
                // Fixed decorative bars that never reorder: the position is the bar's identity.
                <span key={bar} className="bar" />
              ))}
            </div>
            <div className="vault__axis">
              <span>Week 1</span>
              <span>Week 6</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

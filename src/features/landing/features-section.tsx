import type { ReactNode } from "react";
import { EditableShowcase } from "@/features/landing/editable-showcase";
import { FeatureCards } from "@/features/landing/feature-cards";
import { LineIcon } from "@/components/line-icon";

/** Stagger delays per tile live in landing.css (`.tiles .tile:nth-child`). */
type Tile = { title: string; body: string; icon: ReactNode };

const TILES: Tile[] = [
  {
    title: "Eat for your skin",
    body: "A food plan that supports what you're putting on your face. Adjusted for allergies and diet.",
    icon: (
      <LineIcon size={26}>
        <path d="M12 21c-5 0-8-3.5-8-8 3 0 6 1 8 4 2-3 5-4 8-4 0 4.5-3 8-8 8z" />
        <path d="M12 17V8M12 8c0-3 2-5 4-5 0 2.5-1.5 4.5-4 5zM12 8c0-3-2-5-4-5 0 2.5 1.5 4.5 4 5z" />
      </LineIcon>
    ),
  },
  {
    title: "Find it nearby",
    body: "See which stores near you carry your products. Tap once for directions.",
    icon: (
      <LineIcon size={26}>
        <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </LineIcon>
    ),
  },
  {
    title: "Talk to it",
    body: "Ask questions out loud. “My skin is tight today.” “Can I skip the serum?” Your routine updates as you go.",
    icon: (
      <LineIcon size={26}>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </LineIcon>
    ),
  },
  {
    title: "Watch it work",
    body: "Log progress with a photo, a voice note, or a sentence. Your dashboard shows what's changing over weeks, not days.",
    icon: (
      <LineIcon size={26}>
        <path d="M3 20h18" />
        <path d="M4 16l5-5 4 3 7-7" />
        <path d="M15 7h5v5" />
      </LineIcon>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="features">
      <div className="container features__inner">
        <header className="features__head">
          <h2 className="h2">
            More than a report.
            <br />A routine that keeps up.
          </h2>
          <p>Our AI prepares suggestions for you. You make the final call — and everything below adjusts to you.</p>
        </header>
        <FeatureCards />
        <EditableShowcase />
        <div className="tiles" data-reveal>
          {TILES.map((tile) => (
            <article key={tile.title} className="tile reveal">
              <span className="tile__icon">{tile.icon}</span>
              <div className="tile__body">
                <h3 className="tile__title">{tile.title}</h3>
                <p>{tile.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

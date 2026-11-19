import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { LineIcon } from "@/components/line-icon";
import { SpriteIcon } from "@/features/landing/icons";

/** Stagger delays per step live in landing.css (`.steps .step:nth-child`). */
type Step = { title: string; body: string; disc: string; icon: ReactNode };

const STEPS: Step[] = [
  {
    title: "Take a photo",
    body: "Your skin report is ready in seconds. Texture, dryness, blemishes, signs of ageing — explained in plain language, no jargon.",
    disc: "step__disc--peach",
    icon: <SpriteIcon id="i-camera" width="34" height="34" strokeWidth="1.4" aria-hidden="true" />,
  },
  {
    title: "Set your budget",
    body: "Your report comes with a product list picked to match it. Real products, real prices, nothing you can't afford.",
    disc: "step__disc--white",
    icon: (
      <LineIcon size={34} strokeWidth={1.4}>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M16 15h2" />
        <path d="M6 6l9-3 1 3" />
      </LineIcon>
    ),
  },
  {
    title: "Follow your routine",
    body: "A morning and evening plan built from those products, with step-by-step instructions for each one.",
    disc: "step__disc--peach-strong",
    icon: (
      <LineIcon size={34} strokeWidth={1.4} strokeLinejoin="round">
        <g transform="translate(-1.4 1.9)">
          <path d="M14.2 4.4a6.8 6.8 0 1 0 4.6 11.6 5.2 5.2 0 0 1-4.6-11.6z" />
          <path d="M17.6 2.2l.55 1.5 1.5.55-1.5.55-.55 1.5-.55-1.5-1.5-.55 1.5-.55z" />
        </g>
      </LineIcon>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="how container">
      <header className="section-head section-head--center">
        <span className="eyebrow">How it works</span>
        <h2 className="h2">Three steps to a routine that fits</h2>
      </header>
      <ol className="steps" data-reveal>
        {STEPS.map((step, index) => (
          <li key={step.title} className="step reveal">
            <div className="step__icon">
              <div className={cn("step__disc", step.disc)}>{step.icon}</div>
            </div>
            <div className="step__body">
              <span className="step__num">STEP {String(index + 1).padStart(2, "0")}</span>
              <h3 className="h3">{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

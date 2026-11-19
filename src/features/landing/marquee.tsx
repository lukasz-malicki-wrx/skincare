import { Fragment } from "react";
import { SpriteIcon } from "@/features/landing/icons";

const ITEMS = ["Ready in seconds", "No ads", "Everything in one place", "Cancel any time"] as const;
/** The track holds the list twice so the CSS loop has no gap. */
const LOOPS = ["a", "b"] as const;

export function Marquee() {
  return (
    <div className="marquee">
      <p className="sr-only">{`${ITEMS.join(". ")}.`}</p>
      <div className="marquee__track" aria-hidden="true">
        {LOOPS.map((loop) =>
          ITEMS.map((item) => (
            <Fragment key={`${loop}-${item}`}>
              <span>{item}</span>
              <SpriteIcon id="i-star" />
            </Fragment>
          )),
        )}
      </div>
    </div>
  );
}

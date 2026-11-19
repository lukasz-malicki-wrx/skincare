import type { SVGProps } from "react";

type SpriteId = "i-star" | "i-camera" | "i-arrow" | "i-arrow-ur";

/** The symbols every `SpriteIcon` points at. Rendered once, at the top of the landing. */
export function IconSprite() {
  return (
    <svg width="0" height="0" className="icon-sprite" aria-hidden="true">
      <defs>
        <symbol id="i-star" viewBox="0 0 24 24">
          <path
            d="M12 0C13.76 8.94 15.06 10.24 24 12C15.06 13.76 13.76 15.06 12 24C10.24 15.06 8.94 13.76 0 12C8.94 10.24 10.24 8.94 12 0Z"
            fill="currentColor"
          />
        </symbol>
        <symbol id="i-camera" viewBox="0 0 24 24">
          <path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" />
          <circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" />
        </symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24">
          <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
        </symbol>
        <symbol id="i-arrow-ur" viewBox="0 0 24 24">
          <path d="M7 17L17 7M8 7h9v9" fill="none" stroke="currentColor" strokeWidth="2" />
        </symbol>
      </defs>
    </svg>
  );
}

export function SpriteIcon({ id, ...props }: Readonly<{ id: SpriteId } & SVGProps<SVGSVGElement>>) {
  return (
    <svg {...props}>
      <use href={`#${id}`} />
    </svg>
  );
}

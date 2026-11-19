import Link from "next/link";
import { routes } from "@/config/routes";

const PROFILE_PILLS = [
  { label: "Dry cheeks", tone: "" },
  { label: "Oily T-zone", tone: "" },
  { label: "Vegan", tone: "pill--dark" },
  { label: "No retinol", tone: "pill--dark" },
  { label: "+ Add", tone: "pill--add" },
] as const;

export function EditableShowcase() {
  return (
    <div className="editable">
      <div className="mosaic">
        <div className="mosaic__profile">
          <span className="mosaic__label">Your profile</span>
          <div className="pills">
            {PROFILE_PILLS.map((pill) => (
              <span key={pill.label} className={pill.tone ? `pill ${pill.tone}` : "pill"}>
                {pill.label}
              </span>
            ))}
          </div>
          <div className="mosaic__budget">
            <span>Monthly budget</span>
            <b>[YOUR BUDGET]</b>
          </div>
        </div>
        <div className="mosaic__leaves photo photo--leaves" role="img" aria-label="Woman with a green leaf on her shoulder">
          <span className="tag tag--static">Vegan? Say it once.</span>
        </div>
        <div className="mosaic__dark">
          <span>AI analyzes.</span>
          <span className="mosaic__accent">You decide.</span>
        </div>
      </div>
      <div className="editable__copy">
        <h3 className="editable__title">Everything is editable</h3>
        <p className="editable__text">
          Our AI prepares suggestions for you. You make the final call. Change anything — skin concerns, allergies,
          budget, products. Vegan? Allergic to retinol? Say so once.
        </p>
        <Link className="btn btn--secondary editable__cta" href={routes.app.home}>
          Try it on your skin
        </Link>
      </div>
    </div>
  );
}


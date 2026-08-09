import { IADE_INTRO, IADE_MADDELER } from "@/lib/iade-kosullari";

type Props = {
  /** panel = üye paneli kart stili, public = site sayfası */
  variant?: "public" | "panel";
};

export function IadeKosullari({ variant = "public" }: Props) {
  if (variant === "panel") {
    return (
      <div className="sp-faq-list">
        <p className="muted text-sm mb-4 leading-relaxed">{IADE_INTRO}</p>
        {IADE_MADDELER.map((m) => (
          <details key={m.id} className="sp-card sp-faq">
            <summary>
              {m.id}. {m.title}
            </summary>
            <p>{m.body}</p>
          </details>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 max-w-3xl">
      <p className="muted text-sm leading-relaxed">{IADE_INTRO}</p>
      <ol className="grid gap-4 list-none p-0 m-0">
        {IADE_MADDELER.map((m) => (
          <li key={m.id} className="sp-card p-5">
            <h2 className="display text-lg text-white mb-2">
              {m.id}. {m.title}
            </h2>
            <p className="muted text-sm leading-relaxed m-0">{m.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

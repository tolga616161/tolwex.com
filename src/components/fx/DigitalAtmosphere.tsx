"use client";

import { CategoryIcon } from "@/components/icons/CategoryIcons";

const FLOATERS = [
  { icon: "instagram", className: "floater f1", label: "IG" },
  { icon: "tiktok", className: "floater f2", label: "TT" },
  { icon: "google", className: "floater f3", label: "G" },
  { icon: "facebook", className: "floater f4", label: "FB" },
  { icon: "instagram", className: "floater f5", label: "IG2" },
  { icon: "tiktok", className: "floater f6", label: "TT2" },
] as const;

const BINARY_COLS = [
  "01001101 01000101 01010100 01000001",
  "10110010 01101001 01100111 00110001",
  "01001001 01001110 01010011 01010100",
  "11001010 00101101 10010110 01000011",
  "01110011 01100101 01100011 01110101",
  "10101010 01010101 11110000 00001111",
];

type Props = {
  variant?: "hero" | "page";
};

export function DigitalAtmosphere({ variant = "hero" }: Props) {
  return (
    <div className={`digital-atmosphere is-${variant}`} aria-hidden>
      <div className="binary-field">
        {BINARY_COLS.map((line, i) => (
          <span key={i} className={`binary-col c${i + 1}`}>
            01010101
            <br />
            {line}
            <br />
            10101010
          </span>
        ))}
      </div>

      <div className="floater-stage">
        {FLOATERS.map((f) => (
          <div key={f.label} className={f.className}>
            <div className="floater-face">
              <CategoryIcon name={f.icon} className="size-5 md:size-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="depth-plane depth-a" />
      <div className="depth-plane depth-b" />
    </div>
  );
}

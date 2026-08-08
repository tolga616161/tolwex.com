"use client";

import { CategoryIcon } from "@/components/icons/CategoryIcons";

const FLOATERS = [
  { icon: "instagram", className: "floater f1 brand-ig", label: "IG" },
  { icon: "facebook", className: "floater f2 brand-fb", label: "FB" },
  { icon: "tiktok", className: "floater f3 brand-tt", label: "TT" },
  { icon: "youtube", className: "floater f4 brand-yt", label: "YT" },
  { icon: "x", className: "floater f5 brand-x", label: "X" },
  { icon: "google", className: "floater f6 brand-g", label: "G" },
  { icon: "whatsapp", className: "floater f7 brand-wa", label: "WA" },
  { icon: "instagram", className: "floater f8 brand-ig2", label: "IG2" },
  { icon: "facebook", className: "floater f9 brand-fb2", label: "FB2" },
  { icon: "tiktok", className: "floater f10 brand-tt2", label: "TT2" },
  { icon: "youtube", className: "floater f11 brand-yt2", label: "YT2" },
  { icon: "x", className: "floater f12 brand-x2", label: "X2" },
] as const;

const BINARY_STREAMS = [
  "01001101 01000101 01010100 01000001 01010011 01000101 01000011",
  "10110010 01101001 01100111 00110001 01001001 01001110 01010011",
  "01001001 01001110 01010011 01010100 01000001 01000111 01010010",
  "11001010 00101101 10010110 01000011 01001111 01000100 01000101",
  "01110011 01100101 01100011 01110101 01110010 01100101 00100000",
  "10101010 01010101 11110000 00001111 11001100 00110011 10011001",
  "01000110 01000001 01000011 01000101 01000010 01001111 01001111",
  "01010100 01001001 01001011 01010100 01001111 01001011 00100000",
  "01011001 01001111 01010101 01010100 01010101 01000010 01000101",
  "00110001 00110000 00110001 00110000 00110001 00110000 00110001",
];

type Props = {
  variant?: "hero" | "page";
};

export function DigitalAtmosphere({ variant = "hero" }: Props) {
  return (
    <div className={`digital-atmosphere is-${variant}`} aria-hidden>
      <div className="cyber-grid" />
      <div className="scanline" />

      <div className="binary-rain">
        {BINARY_STREAMS.map((line, i) => (
          <div
            key={i}
            className={`rain-col r${i + 1}`}
            style={{ animationDelay: `${(i % 5) * -1.7}s` }}
          >
            <span className="rain-chunk">
              01010101
              <br />
              10101010
              <br />
              {line}
              <br />
              11001100
              <br />
              00110011
              <br />
              {line.split(" ").reverse().join(" ")}
              <br />
              01010101
              <br />
              11100011
              <br />
              00011100
              <br />
              10101010
            </span>
            <span className="rain-chunk">
              01010101
              <br />
              10101010
              <br />
              {line}
              <br />
              11001100
              <br />
              00110011
              <br />
              {line.split(" ").reverse().join(" ")}
              <br />
              01010101
              <br />
              11100011
              <br />
              00011100
              <br />
              10101010
            </span>
          </div>
        ))}
      </div>

      <div className="floater-stage">
        {FLOATERS.map((f) => (
          <div key={f.label} className={f.className}>
            <div className="floater-face">
              <CategoryIcon name={f.icon} className="size-5 md:size-6" />
            </div>
            <span className="floater-glow" />
          </div>
        ))}
      </div>

      <div className="depth-plane depth-a" />
      <div className="depth-plane depth-b" />
      <div className="depth-plane depth-c" />
    </div>
  );
}

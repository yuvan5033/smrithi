import { useEffect, useState } from "react";

const TICKER_ITEMS = [
  "320gsm Archival Stock",
  "Smyth-Sewn Binding",
  "Acid-Free Construction",
  "Blind-Embossed Cover",
  "One Edition Per Journey",
  "Permanent Physical Record",
];


export function Ticker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % TICKER_ITEMS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="border-y border-black/10 py-4">

      {/* MOBILE — fade carousel */}
      <div className="md:hidden text-center">
        <span
          key={index}
          className="block text-[0.7rem] tracking-[0.22em] uppercase text-sienna/70 transition-opacity duration-500"
        >
          {TICKER_ITEMS[index]}
        </span>
      </div>

      {/* DESKTOP — continuous scroll */}
      <div className="hidden md:flex overflow-hidden">
        <div className="flex whitespace-nowrap animate-[ticker_36s_linear_infinite]">
          {doubled.map((item, i) => (
            <span
              key={i}
              className="px-10 text-[0.7rem] tracking-[0.3em] uppercase text-sienna/70"
            >
              ◆ {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
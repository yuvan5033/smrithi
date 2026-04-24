import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const page = location.pathname === '/' ? 'home' : location.pathname.substring(1);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    ["Gallery", "gallery"],
    ["Process", "process"],
    ["FAQ", "faq"],
  ];

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[500] h-20 flex items-center justify-between px-6 md:px-[max(40px,5vw)] transition-all duration-300 ${
          scrolled
            ? "bg-[rgba(243,237,227,0.95)] backdrop-blur-xl border-b border-[rgba(78,52,32,0.15)]"
            : ""
        }`}
      >
        {/* LEFT (desktop links) */}
        <div className="hidden md:flex items-center gap-10">
          {links.map(([label, id]) => (
            <button
              key={id}
              onClick={() => navigate(`/${id}`)}
              className={`text-[0.65rem] tracking-[0.2em] uppercase font-jost font-light transition-colors ${
                page === id
                  ? "text-[var(--sienna)]"
                  : "text-black/60 hover:text-[var(--sienna)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* CENTER LOGO */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <button
            onClick={() => navigate("/")}
            className="font-cormorant text-4xl tracking-[0.08em] uppercase text-[var(--sienna)]"
          >
            Smrithi
          </button>
        </div>

        {/* RIGHT (desktop CTA) */}
        <div className="hidden md:block">
          <button
            onClick={() => navigate("/upload")}
            className="px-6 py-2 border border-[var(--sienna)] text-[var(--sienna)] text-[0.65rem] tracking-[0.2em] uppercase font-jost font-light transition-all hover:bg-[var(--sienna)] hover:text-[var(--cream)]"
          >
            Begin
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-[var(--sienna)]"
          onClick={() => setOpen(true)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </nav>

      {/* MOBILE DRAWER */}
      <div
        className={`fixed inset-0 z-[600] transition ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {/* overlay */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        {/* panel */}
        <div
          className={`absolute right-0 top-0 h-full w-[80%] max-w-sm bg-[var(--cream)] p-10 flex flex-col gap-8 transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            onClick={() => setOpen(false)}
            className="self-end text-[var(--sienna)]"
          >
            ✕
          </button>

          {links.map(([label, id]) => (
            <button
              key={id}
              onClick={() => {
                navigate(`/${id}`);
                setOpen(false);
              }}
              className="text-left text-lg font-cormorant text-[var(--ink)]"
            >
              {label}
            </button>
          ))}

          <button
            onClick={() => {
              navigate("/upload");
              setOpen(false);
            }}
            className="mt-4 px-6 py-3 border border-[var(--sienna)] text-[var(--sienna)] uppercase tracking-widest text-sm"
          >
            Begin Your Edition
          </button>
        </div>
      </div>
    </>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";
import Logo from "../ui/Logo";

/* ── Navigation model ─────────────────────────────────────────────────────────
   Single-page site: the three nav items scroll to sections on the Home page.
   On any other route they navigate home first, then the hash scrolls into view. */
const SECTIONS = [
  { id: "the-edit", label: "The Edit" },
  { id: "the-moment", label: "The Moment" },
  { id: "story", label: "Story" },
];

/* THE EDIT is a dropdown to its four sub-pages. */
const EDIT_SUBPAGES = [
  { href: "/the-edit/within", label: "Within" },
  { href: "/the-edit/beyond", label: "Beyond" },
  { href: "/the-edit/genesis-man", label: "Genesis Men" },
  { href: "/the-edit/archive", label: "Archive" },
];

/**
 * `light` means the bar is sitting over the hero image; once scrolled it's on
 * ivory. The old text wordmark flipped ivory→ink for that. The logo can't
 * recolour, so we cross-fade the gold mark (over imagery) into the ink mark
 * (on ivory) — gold on ivory reads at only ~2:1 and looks washed out.
 *
 * Both are stacked and faded rather than swapped so the transition matches the
 * 300ms colour transition everything else in the bar uses.
 */
function Wordmark({ light }: { light: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Genesis by Preethy — home"
      className="group relative block"
    >
      <Logo
        tone="gold"
        priority
        className={`h-[30px] sm:h-[34px] lg:h-[38px] transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          light ? "opacity-100" : "opacity-0"
        }`}
      />
      <Logo
        tone="ink"
        priority
        className={`absolute inset-0 h-[30px] sm:h-[34px] lg:h-[38px] transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          light ? "opacity-0" : "opacity-100"
        }`}
      />
    </Link>
  );
}

/* Minimal line icons (used only for the mobile menu / search glyphs) */
const Ic = {
  search: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  menu: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...p}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  ),
  close: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...p}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState("");
  const [editOpen, setEditOpen] = useState(false); // desktop dropdown
  const [mobileEditOpen, setMobileEditOpen] = useState(false);

  const { cartCount, clearLocalCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  // The Home page renders a full-bleed hero behind a transparent header.
  const hasHero = pathname === "/";
  const overHero = hasHero && !scrolled && !searchOpen;
  const solid = !overHero;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("heedy_user"));
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock scroll when the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("heedy_user");
    setIsLoggedIn(false);
    clearLocalCart();
    setMobileOpen(false);
    router.push("/sign-in");
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setSearchOpen(false);
    setMobileOpen(false);
  };

  // Some nav items are real routes (e.g. Story → /story), not Home anchors.
  const sectionHref = (id: string) => (id === "story" ? "/story" : `/#${id}`);

  // Scroll to a Home-page section. If already on Home, smooth-scroll in place;
  // otherwise navigate to the hash so the browser scrolls after Home loads.
  const goToSection = (e: React.MouseEvent, id: string) => {
    setMobileOpen(false);
    // Route items navigate normally — don't hijack the click to scroll a
    // same-named Home section (Home has its own #story block).
    if (id === "story") return;
    if (pathname === "/") {
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
        history.replaceState(null, "", `/#${id}`);
      }
    }
    // When not on Home, let the <Link href={`/#id`}> navigate normally.
  };

  const goToHome = (e: React.MouseEvent) => {
    setMobileOpen(false);
    // Already home: don't reload the route, just return to the top.
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      history.replaceState(null, "", "/");
    }
    // Elsewhere, the <Link href="/"> navigates home normally.
  };

  const linkColor = solid ? "text-ink" : "text-ivory";

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
          solid
            ? "bg-ivory/95 backdrop-blur-md border-b border-line shadow-[0_1px_20px_rgba(28,26,21,0.04)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="h-[68px] lg:h-[84px] max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          {/* LEFT — desktop nav / mobile menu button */}
          <div className="flex items-center">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={`lg:hidden p-1 -ml-1 ${linkColor}`}
              aria-label="Open menu"
            >
              <Ic.menu width={22} height={22} />
            </button>

            <nav className="hidden lg:flex items-center gap-9">
              {SECTIONS.map((item) =>
                item.id === "the-edit" ? (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setEditOpen(true)}
                    onMouseLeave={() => setEditOpen(false)}
                  >
                    <Link
                      href={sectionHref(item.id)}
                      onClick={(e) => goToSection(e, item.id)}
                      className={`eyebrow ${linkColor} hover:opacity-60 transition-opacity flex items-center gap-1.5`}
                      aria-haspopup="true"
                      aria-expanded={editOpen}
                    >
                      {item.label}
                      <span className={`text-[8px] transition-transform duration-300 ${editOpen ? "rotate-180" : ""}`}>▾</span>
                    </Link>
                    <AnimatePresence>
                      {editOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute left-0 top-full pt-4"
                        >
                          <div className="min-w-[190px] bg-cream border border-line shadow-[0_18px_50px_rgba(28,26,21,0.10)] py-2">
                            {EDIT_SUBPAGES.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setEditOpen(false)}
                                className="block px-5 py-2.5 eyebrow text-ink hover:text-bronze hover:bg-tan/50 transition-colors"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={item.id}
                    href={sectionHref(item.id)}
                    onClick={(e) => goToSection(e, item.id)}
                    className={`eyebrow ${linkColor} hover:opacity-60 transition-opacity`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </div>

          {/* CENTER — wordmark */}
          <Wordmark light={!solid} />

          {/* RIGHT — utilities (text labels) */}
          <div className={`flex items-center justify-end gap-5 sm:gap-7 ${linkColor}`}>
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              className="hidden sm:block eyebrow hover:opacity-60 transition-opacity"
            >
              Search
            </button>

            {/* Mobile search icon */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              className="sm:hidden hover:opacity-60 transition-opacity"
            >
              <Ic.search width={19} height={19} />
            </button>

            <Link
              href={isLoggedIn ? "/profile" : "/sign-in"}
              className="hidden sm:block eyebrow hover:opacity-60 transition-opacity"
            >
              Account
            </Link>

            <Link
              href="/cart"
              aria-label={cartCount > 0 ? `Bag, ${cartCount} items` : "Bag"}
              className="flex items-center gap-2 eyebrow hover:opacity-60 transition-opacity"
            >
              Bag
              {/* The count is a notification, not a label: an empty bag has
                  nothing to announce, so the badge only exists once something
                  is in it. */}
              {cartCount > 0 && (
                <span
                  className={`min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-sans font-semibold flex items-center justify-center ${
                    solid ? "bg-bronze text-ivory" : "bg-ivory text-ink"
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search drawer */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden bg-ivory border-t border-line"
            >
              <form onSubmit={submitSearch} role="search" className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
                <div className="flex items-center gap-4 border-b border-ink/30 pb-3">
                  <Ic.search width={20} height={20} className="text-muted shrink-0" />
                  <input
                    autoFocus
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search pieces, collections…"
                    aria-label="Search"
                    className="w-full bg-transparent font-display text-2xl sm:text-3xl text-ink placeholder:text-faint focus:outline-none"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="text-muted hover:text-ink">
                    <Ic.close width={22} height={22} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[82%] max-w-[360px] bg-ivory flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between h-[68px] px-6 border-b border-line">
                {/* Drawer sits on ivory, so the ink mark. */}
                <Logo tone="ink" className="h-[26px]" />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="text-ink">
                  <Ic.close width={22} height={22} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-6 py-6">
                {/* Home: the section links only scroll within the homepage, so a
                    visitor deeper in the site had no menu route back to it. */}
                <Link
                  href="/"
                  onClick={(e) => goToHome(e)}
                  className="block py-4 font-display text-3xl text-ink border-b border-line"
                >
                  Home
                </Link>

                {SECTIONS.map((item) =>
                  item.id === "the-edit" ? (
                    <div key={item.id} className="border-b border-line">
                      <button
                        onClick={() => setMobileEditOpen((v) => !v)}
                        className="w-full flex items-center justify-between py-4 font-display text-3xl text-ink"
                        aria-expanded={mobileEditOpen}
                      >
                        {item.label}
                        <span className={`text-base transition-transform ${mobileEditOpen ? "rotate-180" : ""}`}>▾</span>
                      </button>
                      <AnimatePresence>
                        {mobileEditOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pb-4 pl-4 space-y-1">
                              {EDIT_SUBPAGES.map((sub) => (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="block py-2.5 eyebrow text-muted hover:text-ink"
                                >
                                  {sub.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={item.id}
                      href={sectionHref(item.id)}
                      onClick={(e) => goToSection(e, item.id)}
                      className="block py-4 font-display text-3xl text-ink border-b border-line"
                    >
                      {item.label}
                    </Link>
                  )
                )}

                <div className="mt-8 space-y-4">
                  <Link href={isLoggedIn ? "/profile" : "/sign-in"} onClick={() => setMobileOpen(false)}
                    className="block eyebrow text-muted hover:text-ink">
                    Account
                  </Link>
                  {isLoggedIn && (
                    <button onClick={handleLogout} className="block eyebrow text-muted hover:text-ink">
                      Sign Out
                    </button>
                  )}
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, ShoppingBag, X, Menu, LogOut, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";

const NAV_LINKS = [
  { href: "/", label: "Home", exact: true },
  { href: "/products", label: "Products", exact: false },
];

// WhatsApp contact number (redirect target)
const WHATSAPP_NUMBER = "916235251520";

// WhatsApp brand glyph (lucide has no dedicated WhatsApp icon).
// Two-tone: green bubble + white phone handset.
function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {/* Green speech bubble */}
      <path
        fill="#25D366"
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z"
      />
      {/* White phone handset */}
      <path
        fill="#FFFFFF"
        d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z"
      />
    </svg>
  );
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { cartCount, clearLocalCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("heedy_user"));
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogout = () => {
    // Clear local session + cart state only; the DB cart is preserved for next login.
    localStorage.removeItem("heedy_user");
    setIsLoggedIn(false);
    clearLocalCart();
    router.push("/sign-in");
  };

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 lg:h-[72px] px-2.5 sm:px-4 lg:px-8 flex items-center gap-1.5 sm:gap-3 lg:gap-6 border-b border-black/10 bg-[#aea3cf]/95 backdrop-blur-md">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setIsMobileMenuOpen((v) => !v)}
        className="lg:hidden p-1 sm:p-2 -ml-1 sm:-ml-2 text-slate-900 hover:text-[#4a3391] transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Logo */}
      <Link href="/" className="flex-shrink-0" aria-label="NEOKART home">
        <div className="relative w-40 sm:w-44 md:w-52 lg:w-56 h-11 sm:h-10 lg:h-12">
          <Image
            src="/logo.png"
            alt="Neokart Logo"
            fill
            sizes="(max-width: 640px) 224px, (max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
            className="object-contain object-left"
            priority
          />
        </div>
      </Link>

      {/* Desktop nav links */}
      <nav className="hidden lg:flex items-center gap-8 ml-2">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`font-sans font-semibold text-[15px] pb-1 border-b-2 transition-colors ${active
                ? "text-slate-900 border-[#4a3391]"
                : "text-slate-700 border-transparent hover:text-slate-900"
                }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Desktop search bar */}
      <form
        onSubmit={handleSearch}
        role="search"
        className="hidden md:flex flex-1 max-w-md mx-4 items-center"
      >
        <div className="relative w-full">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="w-full h-10 pl-10 pr-4 rounded-full bg-white/80 border border-black/10 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4a3391] focus:bg-white transition"
          />
        </div>
      </form>

      {/* Spacer to push utilities right (mobile — search opens from the icon) */}
      <div className="flex-1 md:hidden" />

      {/* Right utilities */}
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
        {/* Mobile search toggle (desktop uses the inline search bar) */}
        <button
          onClick={() => {
            setIsMobileSearchOpen((v) => !v);
            setIsMobileMenuOpen(false);
          }}
          className="md:hidden p-1 sm:p-2 text-slate-900 hover:text-[#4a3391] transition-colors"
          aria-label="Search"
          aria-expanded={isMobileSearchOpen}
        >
          {isMobileSearchOpen ? <X size={20} /> : <Search size={20} />}
        </button>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 sm:p-2 hover:opacity-80 transition-opacity"
          aria-label="Contact us on WhatsApp"
        >
          <WhatsAppIcon size={26} />
        </a>

        {/* Account */}
        <Link
          href={isLoggedIn ? "/profile" : "/sign-in"}
          className="p-1 sm:p-2 text-slate-900 hover:text-[#4a3391] transition-colors"
          aria-label="Account"
        >
          <User size={20} />
        </Link>

        {/* Cart */}
        <Link
          href="/cart"
          className="relative p-1 sm:p-2 text-slate-900 hover:text-[#4a3391] transition-colors"
          aria-label="Cart"
        >
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-[#4a3391] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-[#aea3cf]">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Logout (when logged in) */}
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="hidden sm:flex p-2 text-slate-900 hover:text-red-600 transition-colors"
            aria-label="Log out"
          >
            <LogOut size={19} />
          </button>
        )}
      </div>

      {/* Mobile search bar (slides down from header) */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 bg-[#aea3cf] border-b border-black/10 shadow-lg z-30 md:hidden overflow-hidden"
          >
            <form onSubmit={handleSearch} role="search" className="px-6 py-3">
              <div className="relative w-full">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  autoFocus
                  className="w-full h-10 pl-10 pr-4 rounded-full bg-white/80 border border-black/10 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4a3391] focus:bg-white transition"
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 bg-[#aea3cf] border-b border-black/10 shadow-lg z-30 lg:hidden overflow-hidden"
          >
            <nav className="flex flex-col px-6 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`font-sans font-semibold text-base py-3 border-b border-black/10 last:border-0 transition-colors ${isActive(link.href, link.exact) ? "text-[#4a3391]" : "text-slate-900 hover:text-[#4a3391]"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 font-sans font-semibold text-base py-3 text-red-700 text-left"
                >
                  <LogOut size={18} /> Log out
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

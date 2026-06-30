import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/" className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary-foreground/30 font-display text-lg font-semibold">
            GSM
          </div>
        </Link>
        <p className="text-center text-xs opacity-70">
          © 2005 George's School of Motoring. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

import gsmLogo from "@/assets/gsm-logo.jpeg.asset.json";

export function PortalFooter() {
  return (
    <footer className="w-full bg-primary">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <img
          src={gsmLogo.url}
          alt="GSM Driving School logo"
          width={96}
          height={96}
          className="h-20 w-20 rounded-full object-cover shadow-lg ring-2 ring-white/20 sm:h-24 sm:w-24"
        />
      </div>
    </footer>
  );
}

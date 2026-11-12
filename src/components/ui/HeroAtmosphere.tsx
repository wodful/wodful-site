import * as React from "react";

/** Same teal glow and grid used behind the homepage hero. */
export const HeroAtmosphere = () => (
  <>
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-10%,rgba(49,151,149,0.28),transparent_50%)]"
      aria-hidden
    />
    <div
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_30%,black,transparent)] sm:bg-[size:64px_64px]"
      aria-hidden
    />
  </>
);

import * as React from "react";

function readAccessCodeFromUrl(segment: "event" | "subscription"): string {
  if (typeof window === "undefined") return "";
  const match = window.location.pathname.match(
    new RegExp(`/${segment}/([^/]+)`, "i")
  );
  return match?.[1] ? decodeURIComponent(match[1]) : "";
}

/**
 * Obtém accessCode da URL após rewrite do Netlify (/event/CODE → /event/).
 */
export function useAccessCodeFromPath(
  segment: "event" | "subscription",
  accessCodeFromRouter?: string
): string {
  const [accessCode, setAccessCode] = React.useState(() => {
    if (accessCodeFromRouter) return accessCodeFromRouter;
    return readAccessCodeFromUrl(segment);
  });

  React.useEffect(() => {
    const sync = () => {
      const fromUrl = readAccessCodeFromUrl(segment);
      if (fromUrl) setAccessCode(fromUrl);
    };

    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [segment, accessCodeFromRouter]);

  return accessCodeFromRouter || accessCode;
}

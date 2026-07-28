import type { HeadFC } from "gatsby";
import * as React from "react";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Seo } from "../components/SEO";
import { Success } from "../components/Success";

type PageProps = {
  location?: { search?: string };
};

function getStatusFromSearch(search: string | undefined): "success" | "pending" | "failure" {
  if (!search) return "success";
  const params = new URLSearchParams(search);
  const status = params.get("status");
  if (status === "pending" || status === "failure") return status;
  return "success";
}

function getQueryParam(search: string | undefined, key: string): string | undefined {
  if (!search) return undefined;
  return new URLSearchParams(search).get(key) ?? undefined;
}

export default function SubscriptionSuccess({ location }: PageProps) {
  const [status, setStatus] = React.useState<"success" | "pending" | "failure">(
    () => getStatusFromSearch(location?.search)
  );
  const [accessCode, setAccessCode] = React.useState<string | undefined>(
    () => getQueryParam(location?.search, "accessCode")
  );
  const [subscriptionId, setSubscriptionId] = React.useState<string | undefined>(
    () => getQueryParam(location?.search, "subscriptionId")
  );
  const [email, setEmail] = React.useState<string | undefined>(
    () => getQueryParam(location?.search, "email")
  );

  React.useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : location?.search;
    setStatus(getStatusFromSearch(search));
    setAccessCode(getQueryParam(search, "accessCode"));
    setSubscriptionId(getQueryParam(search, "subscriptionId"));
    setEmail(getQueryParam(search, "email"));
  }, [location?.search]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header isSimple />
      <Success
        status={status}
        accessCode={accessCode}
        subscriptionId={subscriptionId}
        email={email}
      />
      <Footer isSimple />
    </div>
  );
}

export const Head: HeadFC = () => (
  <Seo
    title="Confirmação de inscrição"
    description="Status da inscrição ou pagamento do evento na Wodful."
    pathname="/subscription-success"
    noindex
    jsonLd={undefined}
  />
);

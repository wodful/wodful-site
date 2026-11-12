import type { HeadFC, PageProps } from "gatsby";
import * as React from "react";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { useAccessCodeFromPath } from "../hooks/useAccessCodeFromPath";
import { Seo } from "../components/SEO";
import { SubscriptionData } from "../components/Subscription";

type SubscriptionPageProps = PageProps & {
  accessCode?: string;
  params?: { accessCode?: string };
};

export default function EventSubscriptions({
  accessCode: accessCodeProp,
  params,
}: SubscriptionPageProps) {
  const accessCode = useAccessCodeFromPath(
    "subscription",
    accessCodeProp ?? params?.accessCode
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-gray-900">
      <Header isSimple />
      <SubscriptionData accessCode={accessCode} />
      <Footer isSimple />
    </div>
  );
}

export const Head: HeadFC = () => (
  <Seo
    title="Inscrição no evento"
    description="Formulário de inscrição para competições CrossFit na plataforma Wodful."
    pathname="/subscription"
    noindex
    jsonLd={undefined}
  />
);

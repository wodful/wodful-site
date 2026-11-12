import type { HeadFC, PageProps } from "gatsby";
import * as React from "react";
import { EventData } from "../components/EventData";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { useAccessCodeFromPath } from "../hooks/useAccessCodeFromPath";
import { Seo } from "../components/SEO";

type EventPageProps = PageProps & {
  accessCode?: string;
  params?: { accessCode?: string };
};

export default function EventDetails({
  accessCode: accessCodeProp,
  params,
}: EventPageProps) {
  const accessCode = useAccessCodeFromPath(
    "event",
    accessCodeProp ?? params?.accessCode
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-gray-900">
      <Header isSimple />
      <EventData accessCode={accessCode} />
      <Footer isSimple />
    </div>
  );
}

export const Head: HeadFC = () => (
  <Seo
    title="Detalhes do evento"
    description="Informações e inscrição para competições CrossFit gerenciadas pela Wodful."
    pathname="/event"
    noindex
    jsonLd={undefined}
  />
);

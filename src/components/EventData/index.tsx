import { navigate } from "gatsby";
import * as React from "react";
import { useEffect, useState } from "react";
import Calendar from "../../images/calendar-black.svg";
import MapPin from "../../images/map-pin.svg";
import { EventResponse } from "../../models/EventResponse";
import { EventService } from "../../services/events";
import { Container } from "../ui/Container";
import { EVENT_BANNER_MAX_WIDTH_CLASS } from "../../constants/eventBanner";
import { formatEventDateRange } from "../../utils/formatEventDateRange";
import { EventBanner, EventBannerPlaceholder } from "./EventBanner";
import { EventSkeleton } from "./EventSkeleton";
import { SubscriptionChoice } from "./SubscriptionChoice";

interface IEventData {
  accessCode: string;
}

function getBannerUrl(path: string) {
  const storageType = process.env.GATSBY_STORAGE_TYPE;
  const baseUrl = process.env.GATSBY_BASE_SERVER_URL;
  const awsBucketUrl = process.env.GATSBY_AWS_PUBLIC_BUCKET;

  return storageType === "local"
    ? `${baseUrl}/${path}`
    : `${awsBucketUrl}/${path}`;
}

function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export const EventData = ({ accessCode }: IEventData) => {
  const [event, setEvent] = useState<EventResponse>();
  const [isLoading, setIsLoading] = useState(true);

  const getEvent = React.useCallback(async (access: string) => {
    setIsLoading(true);
    await new EventService()
      .getEvent(access)
      .then((eventResponse: EventResponse) => {
        setEvent(eventResponse);
      })
      .catch(() => navigate("/404"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!accessCode?.trim()) return;
    getEvent(accessCode);
  }, [accessCode, getEvent]);

  if (isLoading) {
    return <EventSkeleton />;
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <div className="bg-blue-dark pb-6 pt-4 sm:pb-8">
        <Container>
          {event.banner ? (
            <EventBanner
              src={getBannerUrl(event.banner)}
              alt={`Banner do evento ${event.name}`}
            />
          ) : (
            <EventBannerPlaceholder />
          )}
        </Container>
      </div>

      <Container className={`py-6 sm:py-10 ${EVENT_BANNER_MAX_WIDTH_CLASS}`}>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start lg:gap-10 xl:gap-12">
          <article className="min-w-0">
            {event.isFinished ? (
              <p className="mb-4 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700 ring-1 ring-red-200/80">
                Inscrições encerradas
              </p>
            ) : (
              <p className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary ring-1 ring-primary/20">
                Inscrições abertas
              </p>
            )}

            <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl">
              {event.name}
            </h1>

            <ul className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
              <li className="flex items-start gap-2.5 text-sm text-gray-600">
                <img
                  src={Calendar}
                  alt=""
                  className="mt-0.5 h-4 w-4 shrink-0 opacity-70"
                  aria-hidden
                />
                <span>
                  <span className="font-medium text-gray-800">Data</span>
                  <br />
                  {formatEventDateRange(event.startDate, event.endDate)}
                </span>
              </li>
              {event.address ? (
                <li className="flex items-start gap-2.5 text-sm text-gray-600">
                  <img
                    src={MapPin}
                    alt=""
                    className="mt-0.5 h-4 w-4 shrink-0 opacity-70"
                    aria-hidden
                  />
                  <span>
                    <span className="font-medium text-gray-800">Local</span>
                    <br />
                    {event.address}
                    <a
                      href={mapsUrl(event.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 font-medium text-primary underline-offset-2 hover:underline"
                    >
                      Ver no mapa
                    </a>
                  </span>
                </li>
              ) : null}
            </ul>

            {event.description ? (
              <section className="mt-8 border-t border-gray-200/80 pt-8" aria-labelledby="sobre-evento">
                <h2
                  id="sobre-evento"
                  className="text-lg font-semibold text-gray-900"
                >
                  Sobre o evento
                </h2>
                <div className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-600">
                  {event.description}
                </div>
              </section>
            ) : null}

            <p className="mt-8 text-sm font-medium text-gray-500 lg:hidden">
              Escolha sua categoria abaixo para continuar a inscrição.
            </p>
          </article>

          <div className="mt-8 lg:mt-0 lg:sticky lg:top-6">
            <SubscriptionChoice
              tickets={event.tickets}
              accessCode={accessCode}
              isFinished={event.isFinished}
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

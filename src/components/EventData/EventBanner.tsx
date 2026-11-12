import * as React from "react";
import {
  EVENT_BANNER_ASPECT_CLASS,
  EVENT_BANNER_HEIGHT,
  EVENT_BANNER_MAX_WIDTH_CLASS,
  EVENT_BANNER_WIDTH,
} from "../../constants/eventBanner";
import { Container } from "../ui/Container";
import { HeroAtmosphere } from "../ui/HeroAtmosphere";

type EventBannerProps = {
  src: string;
  alt: string;
};

export const EventBanner = ({ src, alt }: EventBannerProps) => (
  <div
    className={`mx-auto w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/30 ${EVENT_BANNER_MAX_WIDTH_CLASS}`}
  >
    <img
      src={src}
      alt={alt}
      width={EVENT_BANNER_WIDTH}
      height={EVENT_BANNER_HEIGHT}
      decoding="async"
      className={`${EVENT_BANNER_ASPECT_CLASS} w-full bg-white/5 object-cover object-center`}
    />
  </div>
);

export const EventBannerPlaceholder = () => (
  <div
    className={`mx-auto flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${EVENT_BANNER_ASPECT_CLASS} ${EVENT_BANNER_MAX_WIDTH_CLASS}`}
    aria-hidden
  >
    <span className="text-sm font-medium text-white/50">Sem banner</span>
  </div>
);

export const EventBannerSkeleton = () => (
  <div className="relative overflow-hidden bg-blue-dark pb-6 pt-4 sm:pb-8">
    <HeroAtmosphere />
    <Container className="relative">
      <div
        className={`mx-auto w-full animate-pulse rounded-2xl bg-white/10 ${EVENT_BANNER_ASPECT_CLASS} ${EVENT_BANNER_MAX_WIDTH_CLASS}`}
      />
    </Container>
  </div>
);

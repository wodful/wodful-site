import * as React from "react";
import {
  EVENT_BANNER_ASPECT_CLASS,
  EVENT_BANNER_HEIGHT,
  EVENT_BANNER_MAX_WIDTH_CLASS,
  EVENT_BANNER_WIDTH,
} from "../../constants/eventBanner";
import { Container } from "../ui/Container";

type EventBannerProps = {
  src: string;
  alt: string;
};

export const EventBanner = ({ src, alt }: EventBannerProps) => (
  <div
    className={`mx-auto w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 ${EVENT_BANNER_MAX_WIDTH_CLASS}`}
  >
    <img
      src={src}
      alt={alt}
      width={EVENT_BANNER_WIDTH}
      height={EVENT_BANNER_HEIGHT}
      decoding="async"
      className={`${EVENT_BANNER_ASPECT_CLASS} w-full bg-slate-100 object-cover object-center`}
    />
  </div>
);

export const EventBannerPlaceholder = () => (
  <div
    className={`mx-auto flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white ${EVENT_BANNER_ASPECT_CLASS} ${EVENT_BANNER_MAX_WIDTH_CLASS}`}
    aria-hidden
  >
    <span className="text-sm font-medium text-slate-400">Sem banner</span>
  </div>
);

export const EventBannerSkeleton = () => (
  <div className="pt-6 sm:pt-8">
    <Container>
      <div
        className={`mx-auto w-full animate-pulse rounded-2xl bg-slate-200 ${EVENT_BANNER_ASPECT_CLASS} ${EVENT_BANNER_MAX_WIDTH_CLASS}`}
      />
    </Container>
  </div>
);

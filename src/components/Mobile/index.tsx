import { Link } from "gatsby";
import * as React from "react";
import PhoneFrame from "../../images/mock-celular-frame.svg";
import PhoneScreen from "../../images/public-app-ranking.png";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";
import { SectionHeading } from "../ui/SectionHeading";

const bullets = [
  "Acompanhe o placar de qualquer lugar",
  "Veja quando é sua vez de competir",
  "Cronograma sempre atualizado no bolso",
];

export const Mobile = () => (
  <Section className="bg-white/[0.02]">
    <Container>
      <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-20">
        <div className="max-w-lg text-center lg:text-left">
          <SectionHeading
            align="left"
            className="max-w-none"
            eyebrow="Para atletas e torcida"
            title="A competição no bolso de quem importa"
            description="Organizador no comando no desktop. Atleta e público acompanhando cada prova pelo celular. Sem depender de print no grupo."
          />
          <ul className="mt-8 space-y-3 text-left">
            {bullets.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-gray-300"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
          <Link
            to="#cta"
            className="mt-8 inline-block text-sm font-semibold text-primary no-underline hover:underline"
          >
            Quero isso no meu evento →
          </Link>
        </div>
        <div className="relative w-full max-w-sm shrink-0 lg:max-w-md">
          <div
            className="absolute -inset-12 rounded-full bg-primary/15 blur-3xl"
            aria-hidden
          />
          <div className="relative w-full drop-shadow-2xl">
            <img
              className="relative w-full"
              src={PhoneFrame}
              alt=""
              aria-hidden
            />
            <img
              className="absolute left-[6.9%] top-[12.3%] h-[87.7%] w-[85.7%] rounded-t-[4%] object-cover object-top"
              src={PhoneScreen}
              alt="Aplicativo Wodful em um smartphone"
            />
          </div>
        </div>
      </div>
    </Container>
  </Section>
);

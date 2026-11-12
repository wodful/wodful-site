import { Link } from "gatsby";
import * as React from "react";
import { WHATSAPP_URL } from "../../constants/whatsapp";
import HeaderLogo from "../../images/wodful-logo.svg";
import { Container } from "../ui/Container";

interface IFooterProps {
  isSimple?: boolean;
}

type NavLinks = {
  to: string;
  description: string;
};

const navLinks: NavLinks[] = [
  { to: "#features", description: "Funcionalidades" },
  { to: "#benefits", description: "Benefícios" },
  { to: "#testimonials", description: "Depoimentos" },
  { to: "#cta", description: "Contato" },
];

const linkClass =
  "flex min-h-[48px] w-full items-center justify-center rounded-md px-4 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-0 sm:w-auto sm:py-2";

export const Footer = ({ isSimple = false }: IFooterProps) => {
  const year = new Date().getFullYear();

  if (isSimple) {
    return (
      <footer className="border-t border-slate-200 bg-white">
        <Container>
          <div className="flex flex-col items-center gap-3 py-5 sm:flex-row sm:justify-between sm:py-4">
            <a
              href="https://wodful.com"
              className="inline-flex rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <img
                src={HeaderLogo}
                alt="Wodful"
                className="h-7 w-auto brightness-0"
              />
            </a>
            <p className="m-0 text-center text-sm leading-none text-slate-500 sm:text-right">
              © {year} Wodful — Gestão de competições
            </p>
          </div>
        </Container>
      </footer>
    );
  }

  return (
    <footer className="border-t border-white/10 bg-blue-dark py-10 sm:py-8">
      <Container>
        <div className="flex flex-col items-center gap-8">
          {isSimple ? (
            <a
              href="https://wodful.com"
              className="inline-flex rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <img src={HeaderLogo} alt="Wodful" className="h-8 w-auto" />
            </a>
          ) : (
            <Link
              to="/"
              className="inline-flex rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <img src={HeaderLogo} alt="Wodful" className="h-8 w-auto" />
            </Link>
          )}

          {!isSimple && (
            <nav aria-label="Links do rodapé" className="w-full max-w-sm sm:max-w-none">
              <ul className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-8 sm:gap-y-2">
                {navLinks.map((link) => (
                  <li key={link.description} className="list-none">
                    <Link to={link.to} className={linkClass}>
                      {link.description}
                    </Link>
                  </li>
                ))}
                <li className="list-none">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkClass} text-primary hover:text-primary`}
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </nav>
          )}

          <p className="text-center text-sm text-gray-400">
            © {year} Wodful — Gestão de competições
          </p>
        </div>
      </Container>
    </footer>
  );
};

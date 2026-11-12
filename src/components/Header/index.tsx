import { Link } from "gatsby";
import * as React from "react";
import HeaderLogo from "../../images/wodful-logo.svg";
import { Container } from "../ui/Container";
import Hamburger from "../Hamburger";

interface IHeaderProps {
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

export const Header = ({ isSimple = false }: IHeaderProps) => {
  const [hamburgerOpen, setHamburgerOpen] = React.useState(false);
  const menuId = "menu-principal";

  React.useEffect(() => {
    document.body.style.overflow = hamburgerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [hamburgerOpen]);

  const closeMenu = () => setHamburgerOpen(false);

  const logo = (
    <img src={HeaderLogo} alt="Wodful" className="h-8 w-auto" />
  );

  return (
    <header className="overflow-x-clip border-b border-white/[0.06] bg-blue-dark">
      <Container className="max-w-6xl">
        <div
          className={
            isSimple
              ? "flex h-14 min-h-[3.5rem] items-center justify-between gap-4"
              : "flex h-14 min-h-[3.5rem] items-center justify-between gap-4 md:grid md:h-16 md:min-h-[4rem] md:grid-cols-[1fr_auto_1fr]"
          }
        >
          <div className="min-w-0 shrink-0">
            {isSimple ? (
              <a href="https://wodful.com" className="inline-flex rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                {logo}
              </a>
            ) : (
              <Link
                to="/"
                className="inline-flex rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {logo}
              </Link>
            )}
          </div>

          {!isSimple && (
            <>
              <nav
                className="hidden items-center justify-center gap-6 md:flex lg:gap-8"
                aria-label="Navegação principal"
              >
                <ul className="flex items-center gap-6 lg:gap-8">
                  {navLinks.map((link) => (
                    <li key={link.description}>
                      <Link
                        to={link.to}
                        className="rounded-md px-1 py-2 text-[13px] font-medium tracking-wide text-white/80 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:text-sm"
                      >
                        {link.description}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="flex shrink-0 items-center justify-end md:col-start-3">
                <button
                  type="button"
                  className="menu-toggle inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-2 text-white shadow-none md:hidden"
                  onClick={() => setHamburgerOpen((open) => !open)}
                  aria-expanded={hamburgerOpen}
                  aria-controls={menuId}
                  aria-label={hamburgerOpen ? "Fechar menu" : "Abrir menu de navegação"}
                >
                  <Hamburger isOpen={hamburgerOpen} />
                </button>
              </div>
            </>
          )}
        </div>

        {!isSimple && hamburgerOpen && (
          <nav
            id={menuId}
            className="border-t border-white/[0.06] py-4 md:hidden"
            aria-label="Menu mobile"
          >
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.description}>
                  <Link
                    to={link.to}
                    onClick={closeMenu}
                    className="flex min-h-[48px] items-center justify-center px-4 text-base font-medium text-white/90 transition-colors hover:bg-white/5 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary"
                  >
                    {link.description}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </Container>
    </header>
  );
};

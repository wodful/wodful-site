import * as React from "react";

type ButtonVariant = "primary" | "ghost" | "whatsapp";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Default true. Use false for inline CTAs (ex.: barra sticky). */
  fullWidth?: boolean;
  children: React.ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-cta hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-blue-dark",
  ghost:
    "border border-white/20 bg-transparent text-white hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary",
  whatsapp:
    "bg-primary text-white shadow-cta hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary",
};

export const Button = ({
  variant = "primary",
  fullWidth = true,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={[
      "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md px-6 py-3 text-base font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70",
      fullWidth ? "w-full sm:w-auto" : "w-auto shrink-0",
      variantClasses[variant],
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...props}
  >
    {children}
  </button>
);

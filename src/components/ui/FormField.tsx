import * as React from "react";

const inputBase =
  "min-w-0 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-500 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60";

const inputInvalid =
  "border-red-400 focus:border-red-500 focus:ring-red-500/20";

export function fieldInputClass(invalid?: boolean) {
  return `${inputBase} ${invalid ? inputInvalid : ""}`;
}

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
};

export const FormField = ({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: FormFieldProps) => {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  const control = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        "aria-required": optional ? undefined : true,
      })
    : children;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {optional ? (
          <span className="ml-1 font-normal text-gray-500">(opcional)</span>
        ) : (
          <span className="ml-0.5 text-red-600" aria-hidden>
            *
          </span>
        )}
      </label>
      {control}
      {hint && !error ? (
        <span id={hintId} className="text-xs text-gray-500">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
};

import * as React from "react";
import { fieldInputClass } from "./FormField";

type ComboboxProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: string[];
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  resolveCanonical?: (value: string, options: string[]) => string;
};

function defaultResolveCanonical(value: string, options: string[]) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return normalized;
  const match = options.find(
    (option) => option.toLowerCase() === normalized.toLowerCase()
  );
  return match ?? normalized;
}

export function Combobox({
  id,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  invalid,
  disabled,
  resolveCanonical = defaultResolveCanonical,
}: ComboboxProps) {
  const listId = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState(0);

  const query = value.trim();
  const filtered = React.useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return options.slice(0, 8);
    return options
      .filter((option) => option.toLowerCase().includes(q))
      .slice(0, 8);
  }, [options, query]);

  const exactMatch = React.useMemo(
    () => options.some((option) => option.toLowerCase() === query.toLowerCase()),
    [options, query]
  );

  const showCreate = query.length >= 3 && !exactMatch;
  const itemCount = filtered.length + (showCreate ? 1 : 0);

  React.useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const commit = (next: string) => {
    const canonical = resolveCanonical(next, options);
    onChange(canonical);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlight((prev) => (itemCount === 0 ? 0 : (prev + 1) % itemCount));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlight((prev) =>
        itemCount === 0 ? 0 : (prev - 1 + itemCount) % itemCount
      );
      return;
    }

    if (event.key === "Enter" && open && itemCount > 0) {
      event.preventDefault();
      if (highlight < filtered.length) {
        commit(filtered[highlight]);
      } else if (showCreate) {
        commit(query);
      }
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        className={fieldInputClass(invalid)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          const canonical = resolveCanonical(value, options);
          if (canonical !== value) onChange(canonical);
          onBlur?.();
        }}
        onKeyDown={onKeyDown}
      />

      {open && !disabled && itemCount > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filtered.map((option, index) => {
            const active = index === highlight;
            return (
              <li key={option} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={[
                    "flex w-full px-3 py-2 text-left text-sm",
                    active
                      ? "bg-primary/10 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50",
                  ].join(" ")}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => commit(option)}
                  onMouseEnter={() => setHighlight(index)}
                >
                  {option}
                </button>
              </li>
            );
          })}
          {showCreate ? (
            <li role="option" aria-selected={highlight === filtered.length}>
              <button
                type="button"
                className={[
                  "flex w-full flex-col px-3 py-2 text-left text-sm",
                  highlight === filtered.length
                    ? "bg-primary/10 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => commit(query)}
                onMouseEnter={() => setHighlight(filtered.length)}
              >
                <span className="font-medium">Criar “{query}”</span>
                <span className="text-xs text-gray-500">Novo box neste evento</span>
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

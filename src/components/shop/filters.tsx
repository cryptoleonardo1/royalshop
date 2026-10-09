"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { SORTS, type Facet } from "@/lib/listing";
import css from "./shop.module.css";

// Filter form: a plain GET form (works without JS) that, with JS, applies every change
// immediately via a client navigation. Empty fields are dropped so URLs stay short.

function useApply() {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const apply = (params: URLSearchParams) => {
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
  return { apply, pending };
}

function formParams(form: HTMLFormElement): URLSearchParams {
  const params = new URLSearchParams();
  new FormData(form).forEach((value, key) => {
    if (typeof value === "string" && value.trim() !== "") params.append(key, value.trim());
  });
  return params;
}

export function FilterPanel({
  basePath,
  facets,
  price,
  priceMin,
  priceMax,
  keep,
  activeCount,
  total,
}: {
  basePath: string;
  facets: Facet[];
  price: { min: number; max: number };
  priceMin: number | null;
  priceMax: number | null;
  // params preserved across filter changes (search query, sort)
  keep: Record<string, string>;
  activeCount: number;
  total: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const debounce = useRef<number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const { apply, pending } = useApply();

  useEffect(() => () => window.clearTimeout(debounce.current), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Inputs are uncontrolled; when the URL changes from outside (chip removed, "zrušiť"), remount the
  // checkbox state and resync price fields unless the user is typing in them.
  const checkedKey = facets.map((f) => f.options.map((o) => (o.checked ? 1 : 0)).join("")).join("|");
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    for (const [name, value] of [
      ["cena_od", priceMin],
      ["cena_do", priceMax],
    ] as const) {
      const input = form.elements.namedItem(name) as HTMLInputElement | null;
      if (input && document.activeElement !== input) input.value = value == null ? "" : String(value);
    }
  }, [priceMin, priceMax]);

  const submit = () => formRef.current && apply(formParams(formRef.current));
  const onChange = (e: FormEvent<HTMLFormElement>) => {
    window.clearTimeout(debounce.current);
    const typing = (e.target as HTMLInputElement).type === "number";
    debounce.current = window.setTimeout(submit, typing ? 700 : 0);
  };
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.clearTimeout(debounce.current);
    submit();
    setOpen(false);
  };
  const reset = () => {
    const params = new URLSearchParams(keep);
    apply(params);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className={css.filterToggle}
        aria-expanded={open}
        aria-controls="filters"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal size={20} aria-hidden="true" />
        Filtre
        {activeCount > 0 && <span className={css.cartCount}>{activeCount}</span>}
      </button>

      <div
        className={css.filterScrim}
        data-open={open || undefined}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="filters"
        className={css.filters}
        data-open={open || undefined}
        data-pending={pending || undefined}
        aria-label="Filtre"
      >
        <div className={css.filterHead}>
          <p className={css.filterTitle}>Filtre</p>
          {activeCount > 0 && (
            <button type="button" className={css.filterReset} onClick={reset}>
              Zrušiť všetky
            </button>
          )}
          <button type="button" className={css.filterClose} onClick={() => setOpen(false)} aria-label="Zavrieť filtre">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <form ref={formRef} action={basePath} method="get" onChange={onChange} onSubmit={onSubmit}>
          <div key={checkedKey} className={css.facets}>
            {Object.entries(keep).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}

            {facets.map((facet) => (
              <fieldset key={facet.param} className={css.facet}>
                <legend className={css.facetLegend}>{facet.label}</legend>
                {facet.options.map((o) => (
                  <label
                    key={o.value}
                    className={css.facetOption}
                    data-empty={(o.count === 0 && !o.checked) || undefined}
                  >
                    <input
                      type={facet.type}
                      name={facet.param}
                      value={o.value}
                      defaultChecked={o.checked}
                      disabled={o.count === 0 && !o.checked}
                      onClick={(e) => {
                        // radios can be unticked by clicking the selected one again
                        const input = e.currentTarget;
                        if (facet.type === "radio" && input.dataset.was === "1") {
                          input.checked = false;
                          input.form?.dispatchEvent(new Event("change", { bubbles: true }));
                        }
                      }}
                      onMouseDown={(e) => (e.currentTarget.dataset.was = e.currentTarget.checked ? "1" : "0")}
                      onKeyDown={(e) => (e.currentTarget.dataset.was = "0")}
                    />
                    <span className={css.facetBox} aria-hidden="true" />
                    <span className={css.facetLabel}>
                      {facet.param.startsWith("p_") && o.label === "áno" ? "Áno" : o.label}
                    </span>
                    <span className={css.facetCount}>{o.count}</span>
                  </label>
                ))}
              </fieldset>
            ))}
          </div>

          <fieldset className={css.facet}>
            <legend className={css.facetLegend}>Cena s DPH (€)</legend>
            <div className={css.priceRange}>
              <label>
                <span>Od</span>
                <input
                  type="number"
                  name="cena_od"
                  inputMode="numeric"
                  min={0}
                  placeholder={String(price.min)}
                  defaultValue={priceMin ?? ""}
                />
              </label>
              <span aria-hidden="true">–</span>
              <label>
                <span>Do</span>
                <input
                  type="number"
                  name="cena_do"
                  inputMode="numeric"
                  min={0}
                  placeholder={String(price.max)}
                  defaultValue={priceMax ?? ""}
                />
              </label>
            </div>
          </fieldset>

          <button type="submit" className={css.filterApply}>
            Zobraziť {total} {total === 1 ? "produkt" : total >= 2 && total <= 4 ? "produkty" : "produktov"}
          </button>
        </form>
      </aside>
    </>
  );
}

export function SortSelect({ value, params }: { value: string; params: Record<string, string[]> }) {
  const { apply, pending } = useApply();
  return (
    <form className={css.sort} action="" method="get" data-pending={pending || undefined}>
      {Object.entries(params).flatMap(([k, values]) =>
        k === "zoradit" || k === "strana"
          ? []
          : values.map((v, i) => <input key={`${k}-${i}`} type="hidden" name={k} value={v} />),
      )}
      <label htmlFor="sort">Zoradiť</label>
      <select
        id="sort"
        name="zoradit"
        defaultValue={value}
        onChange={(e) => {
          const next = formParams(e.currentTarget.form!);
          if (e.currentTarget.value === "odporucane") next.delete("zoradit");
          apply(next);
        }}
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit">Použiť</button>
      </noscript>
    </form>
  );
}

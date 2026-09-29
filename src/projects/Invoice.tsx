import { useState } from "react";
import { Plus, Printer, Trash } from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  qty: string; // raw text from the input — we convert to numbers only when calculating
  price: string;
}

const uid = () => Math.random().toString(36).slice(2, 9);
const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY"];
const day = (offset = 0) =>
  new Date(Date.now() + offset * 86400000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default function Invoice() {
  // @region state
  const [from, setFrom] = useState("Nimbus Studio");
  const [client, setClient] = useState("Acme Corporation");
  const [number, setNumber] = useState("INV-0042");
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState("10");
  const [discount, setDiscount] = useState("0");
  const [items, setItems] = useState<LineItem[]>(() => [
    { id: uid(), description: "Brand identity design", qty: "1", price: "1800" },
    { id: uid(), description: "Landing page in React", qty: "1", price: "2400" },
    { id: uid(), description: "Extra revision round", qty: "3", price: "150" },
  ]);
  // @endregion

  // @region update
  // Every change is an immutable update, addressed by `id` — never by array index.
  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  const addItem = () => setItems((list) => [...list, { id: uid(), description: "", qty: "1", price: "0" }]);
  const removeItem = (id: string) => setItems((list) => list.filter((it) => it.id !== id));
  // @endregion

  // @region totals
  // None of these are state: they're recalculated from the inputs on every render,
  // so they can never disagree with what's on screen.
  const n = (text: string) => Number(text) || 0;
  const lineTotal = (it: LineItem) => n(it.qty) * n(it.price);
  const subtotal = items.reduce((sum, it) => sum + lineTotal(it), 0);
  const discountAmount = (subtotal * n(discount)) / 100;
  const taxable = subtotal - discountAmount;
  const tax = (taxable * n(taxRate)) / 100;
  const total = taxable + tax;
  // @endregion

  const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
  const printable = items.filter((it) => it.description.trim() || n(it.price));

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[1.05fr_1fr]">
      {/* ------------ form ------------ */}
      <div className="card space-y-5 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-ink3">
            From
            <input className="input mt-1.5 !font-normal !normal-case !tracking-normal" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink3">
            Bill to
            <input className="input mt-1.5 !font-normal !normal-case !tracking-normal" value={client} onChange={(e) => setClient(e.target.value)} />
          </label>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink3">
            Invoice #
            <input className="input mt-1.5 !font-normal !normal-case !tracking-normal" value={number} onChange={(e) => setNumber(e.target.value)} />
          </label>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink3">
            Currency
            <select className="input mt-1.5 !font-normal" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink3">Line items</p>
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="grid grid-cols-[1fr_3.6rem_5.4rem_auto] items-center gap-2">
                <input
                  className="input !py-2"
                  placeholder="Description"
                  value={it.description}
                  onChange={(e) => updateItem(it.id, { description: e.target.value })}
                  aria-label="Description"
                />
                <input
                  className="input !px-2 !py-2 text-center"
                  inputMode="decimal"
                  value={it.qty}
                  onChange={(e) => updateItem(it.id, { qty: e.target.value })}
                  aria-label="Quantity"
                />
                <input
                  className="input !px-2 !py-2 text-right"
                  inputMode="decimal"
                  value={it.price}
                  onChange={(e) => updateItem(it.id, { price: e.target.value })}
                  aria-label="Unit price"
                />
                <button
                  onClick={() => removeItem(it.id)}
                  aria-label="Remove line"
                  className="grid h-9 w-9 place-items-center rounded-lg text-ink3 transition hover:bg-bad/10 hover:text-bad"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addItem} className="btn btn-soft btn-sm mt-3">
            <Plus size={14} /> Add line item
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-ink3">
            Discount %
            <input className="input mt-1.5" inputMode="decimal" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </label>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink3">
            Tax %
            <input className="input mt-1.5" inputMode="decimal" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
          </label>
        </div>
      </div>

      {/* ------------ preview ------------ */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Live preview</p>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
            <Printer size={14} /> Print / Save PDF
          </button>
        </div>
        <div id="print-area" className="rounded-2xl bg-white p-7 text-slate-800 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-2xl font-extrabold tracking-tight text-slate-900">INVOICE</p>
              <p className="mt-1 font-mono text-sm text-slate-500">{number || "—"}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-slate-900">{from || "—"}</p>
              <p className="text-slate-500">Issued {day()}</p>
              <p className="text-slate-500">Due {day(14)}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Billed to</p>
            <p className="mt-1 font-semibold text-slate-900">{client || "—"}</p>
          </div>

          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="py-2 font-semibold">Item</th>
                <th className="py-2 text-right font-semibold">Qty</th>
                <th className="py-2 text-right font-semibold">Price</th>
                <th className="py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {printable.map((it) => (
                <tr key={it.id} className="border-b border-slate-100">
                  <td className="py-2.5 pr-2">{it.description || "Untitled item"}</td>
                  <td className="py-2.5 text-right tabular-nums">{n(it.qty)}</td>
                  <td className="py-2.5 text-right tabular-nums">{money(n(it.price))}</td>
                  <td className="py-2.5 text-right font-medium tabular-nums">{money(lineTotal(it))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="ml-auto mt-5 w-full max-w-[16rem] space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-500">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{money(subtotal)}</dd>
            </div>
            {n(discount) > 0 && (
              <div className="flex justify-between text-slate-500">
                <dt>Discount ({n(discount)}%)</dt>
                <dd className="tabular-nums">−{money(discountAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <dt>Tax ({n(taxRate)}%)</dt>
              <dd className="tabular-nums">{money(tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold text-slate-900">
              <dt>Total</dt>
              <dd className="tabular-nums">{money(total)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

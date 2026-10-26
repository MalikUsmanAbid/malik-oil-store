import type { StoreSettings } from '../types';
export default function OrderHelp({ settings }: { settings: StoreSettings }) {
  return <section className="max-w-3xl mx-auto px-5 py-12 space-y-7 text-sm text-gray-700">
    <h1 className="font-serif text-2xl font-bold text-emerald-950">Order help and privacy</h1>
    <div><h2 className="font-bold mb-2">Delivery</h2><p>Review the delivery charge and total at checkout before confirming. For bulk cargo or delivery outside your local area, contact the store to confirm availability and arrangements. Delivery estimates depend on dispatch and the courier.</p></div>
    <div><h2 className="font-bold mb-2">Returns, incorrect items and refunds</h2><p>If an item arrives damaged or incorrect, or you wish to request a return, contact the store with your invoice number and a description of the issue. Please confirm the return arrangements and available resolution with the store before sending goods back.</p></div>
    <div><h2 className="font-bold mb-2">Order information and browser storage</h2><p>The checkout collects your name, delivery phone, address and optional email to process your order and provide support. Order records are stored in the store's Firebase database. Staff access is restricted; public tracking returns order status and item totals only after the invoice and phone match. Your cart is saved in this browser, and an unfinished checkout is retained in session storage so it can be retried safely. Contact the store about access, corrections or removal of your order information.</p></div>
    <div className="rounded-xl bg-emerald-50 p-5"><h2 className="font-bold mb-2">Contact the store</h2><p>{settings.storeName}</p><p>{settings.address}</p><p><a className="underline" href={`tel:${settings.phone}`}>{settings.phone}</a></p><p><a className="underline" href={`mailto:${settings.email}`}>{settings.email}</a></p></div>
  </section>;
}

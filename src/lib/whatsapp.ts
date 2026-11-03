/**
 * whatsapp.ts — Link y formato del WhatsApp de la tienda. El número sale siempre
 * de la configuración del panel (settings.whatsappNumber), así se cambia en un
 * solo lugar para todo el sitio.
 */

/** Solo los dígitos, como los pide wa.me: "+56 9 6121 2115" → "56961212115" */
export function whatsappDigits(number: string): string {
  return number.replace(/[^0-9]/g, "");
}

/** https://wa.me/<número>, opcionalmente con un mensaje ya escrito. */
export function whatsappLink(number: string, text?: string): string {
  const base = `https://wa.me/${whatsappDigits(number)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Formato para mostrar: celular chileno "+56 9 6121 2115"; otros números, tal cual. */
export function formatWhatsapp(number: string): string {
  const d = whatsappDigits(number);
  if (d.length === 11 && d.startsWith("569")) return `+56 9 ${d.slice(3, 7)} ${d.slice(7)}`;
  return number.trim();
}

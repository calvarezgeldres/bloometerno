/** Limpia un RUT dejando solo dígitos y el dígito verificador (K/k). */
function cleanRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

/** Calcula el dígito verificador de un RUT (algoritmo módulo 11). */
function computeVerifier(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return "0";
  if (remainder === 10) return "K";
  return String(remainder);
}

/** Valida que un RUT chileno (con o sin puntos/guion) tenga un dígito verificador correcto. */
export function isValidRut(rut: string): boolean {
  const clean = cleanRut(rut);
  if (clean.length < 2) return false;

  const body = clean.slice(0, -1);
  const verifier = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;

  return computeVerifier(body) === verifier;
}

/** Formatea un RUT como XX.XXX.XXX-X a medida que se escribe. */
export function formatRut(value: string): string {
  const clean = cleanRut(value).slice(0, 9);
  if (clean.length === 0) return "";

  const body = clean.slice(0, -1);
  const verifier = clean.slice(-1);

  if (body.length === 0) return verifier;

  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${verifier}`;
}

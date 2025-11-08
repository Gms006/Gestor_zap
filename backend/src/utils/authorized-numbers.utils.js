const rawList = (process.env.AUTHORIZED_NUMBERS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)
  .map((value) => value.replace(/\D/g, ''));

export function isAuthorizationEnabled() {
  return rawList.length > 0;
}

export function normalizePhone(value) {
  return (value || '').toString().replace(/\D/g, '');
}

export function isNumberAuthorized(number) {
  if (!isAuthorizationEnabled()) {
    return true;
  }

  const normalized = normalizePhone(number);
  return rawList.includes(normalized);
}

export function formatApiError(err, fallback = 'Ocurrio un error inesperado.') {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  try {
    const parts = Object.entries(data).map(([key, value]) => {
      const msg = Array.isArray(value) ? value.join(' ') : String(value);
      return key === 'detail' ? msg : `${key}: ${msg}`;
    });
    return parts.join(' ')
      .replace(/\s+/g, ' ')
      .trim() || fallback;
  } catch (_) {
    return fallback;
  }
}




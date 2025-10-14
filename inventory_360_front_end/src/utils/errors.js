export function parseApiError(err, fallbackMessage = 'Ocurrio un error inesperado.', fallbackTitle = 'Error') {
  const payload = err?.response?.data?.error;
  const statusCode = err?.response?.status;
  if (payload && typeof payload === 'object') {
    const {
      title = fallbackTitle,
      message = fallbackMessage,
      code = statusCode ? `error.http.${statusCode}` : 'error.unknown',
      requestId = null,
      details = undefined,
    } = payload;
    return { title, message, code, requestId, details };
  }

  const data = err?.response?.data;
  if (!data) {
    return { title: fallbackTitle, message: fallbackMessage, code: 'error.network' };
  }

  if (typeof data === 'string') {
    return {
      title: fallbackTitle,
      message: data || fallbackMessage,
      code: statusCode ? `error.http.${statusCode}` : 'error.unknown',
    };
  }

  try {
    const details = {};
    const collectedMessages = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      const msg = Array.isArray(value) ? value.join(' ') : String(value);
      const clean = msg.trim();
      details[key] = clean;

      if (!clean) return;

      const lowerKey = key.toLowerCase();
      if (lowerKey === 'code') return;

      // Evita superficies como "authentication_failed" o slugs similares sin espacios.
      if (!/\s/.test(clean) && /^[a-z0-9._-]+$/i.test(clean)) return;

      collectedMessages.push(clean);
    });

    const message = collectedMessages.join(' ').replace(/\s+/g, ' ').trim() || fallbackMessage;
    return {
      title: fallbackTitle,
      message,
      code: statusCode ? `error.http.${statusCode}` : 'error.validation',
      details: Object.keys(details).length ? details : undefined,
    };
  } catch (_) {
    return { title: fallbackTitle, message: fallbackMessage, code: 'error.unknown' };
  }
}

export function formatApiError(err, fallback = 'Ocurrio un error inesperado.') {
  return parseApiError(err, fallback).message;
}


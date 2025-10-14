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
    const details = Object.entries(data).reduce((acc, [key, value]) => {
      const msg = Array.isArray(value) ? value.join(' ') : String(value);
      acc[key] = msg;
      return acc;
    }, {});
    const message = Object.values(details).join(' ').replace(/\s+/g, ' ').trim() || fallbackMessage;
    return {
      title: fallbackTitle,
      message,
      code: statusCode ? `error.http.${statusCode}` : 'error.validation',
      details,
    };
  } catch (_) {
    return { title: fallbackTitle, message: fallbackMessage, code: 'error.unknown' };
  }
}

export function formatApiError(err, fallback = 'Ocurrio un error inesperado.') {
  return parseApiError(err, fallback).message;
}


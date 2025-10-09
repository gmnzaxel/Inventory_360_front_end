const normalize = (value) => (typeof value === 'string' ? value.trim() : '');

export const STRONG_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateName = (value, { label = 'Nombre', min = 2, max = 60, requireCapitalized = true } = {}) => {
  const trimmed = normalize(value);
  if (!trimmed) return `${label} es requerido.`;
  if (trimmed.length < min) return `${label} debe tener al menos ${min} caracteres.`;
  if (trimmed.length > max) return `${label} no puede exceder ${max} caracteres.`;
  if (requireCapitalized && trimmed[0] !== trimmed[0].toUpperCase()) {
    return `${label} debe comenzar con mayúscula.`;
  }
  return '';
};

export const validateEmail = (value, { label = 'Email' } = {}) => {
  const trimmed = normalize(value);
  if (!trimmed) return `${label} es obligatorio.`;
  if (!EMAIL_REGEX.test(trimmed)) return `${label} no tiene un formato válido.`;
  return '';
};

export const validatePhone = (
  value,
  { label = 'Teléfono', required = true, digits = 10, allowSeparators = true } = {}
) => {
  const raw = normalize(value);
  if (!raw) return required ? `${label} es obligatorio.` : '';
  const sanitized = allowSeparators ? raw.replace(/\D/g, '') : raw;
  if (sanitized.length !== digits) return `${label} debe tener ${digits} dígitos.`;
  return '';
};

export const validateRequiredText = (value, { label = 'Campo', min = 1, max = 200 } = {}) => {
  const trimmed = normalize(value);
  if (!trimmed) return `${label} es obligatorio.`;
  if (trimmed.length < min) return `${label} debe tener al menos ${min} caracteres.`;
  if (trimmed.length > max) return `${label} no puede exceder ${max} caracteres.`;
  return '';
};

export const validateOptionalText = (value, { label = 'Campo', min = 0, max = 200 } = {}) => {
  const trimmed = normalize(value);
  if (!trimmed) return '';
  if (trimmed.length < min) return `${label} debe tener al menos ${min} caracteres.`;
  if (trimmed.length > max) return `${label} no puede exceder ${max} caracteres.`;
  return '';
};

export const validatePositiveNumber = (value, { label = 'Valor', allowZero = false } = {}) => {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return `${label} debe ser un número válido.`;
  if (allowZero ? numberValue < 0 : numberValue <= 0) {
    return `${label} debe ser ${allowZero ? 'mayor o igual a 0' : 'mayor a 0'}.`;
  }
  return '';
};

export const validateInteger = (value, { label = 'Valor', min } = {}) => {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue)) return `${label} debe ser un número entero.`;
  if (typeof min === 'number' && numberValue < min) {
    return `${label} debe ser mayor o igual a ${min}.`;
  }
  return '';
};

export const normalizeDigits = (value) => (typeof value === 'string' ? value.replace(/\D/g, '') : value);

export const buildErrorState = (...messages) => messages.filter(Boolean).shift() || '';


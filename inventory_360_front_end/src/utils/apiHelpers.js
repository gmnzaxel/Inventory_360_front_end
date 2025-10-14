export const normalizeApiList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.results)) {
    return payload.results;
  }
  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }
  return [];
};
export const extractListAndCount = (payload) => {
  const items = normalizeApiList(payload);
  if (Array.isArray(payload)) {
    return { items, count: payload.length };
  }
  const source = payload && typeof payload === 'object' ? payload : {};
  const count =
    typeof source.count === 'number' ? source.count :
    (Array.isArray(source.data) ? source.data.length : items.length);
  return { items, count };
};


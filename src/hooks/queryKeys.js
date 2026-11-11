// One place for every cache key. Keys are arrays from general to specific, so
// invalidating ['bags'] also invalidates ['bags', 'detail', id].
export const queryKeys = {
  bags: ['bags'],
  bagList: ['bags', 'list'],
  bagDetail: (id) => ['bags', 'detail', id],
  reservations: ['reservations']
};

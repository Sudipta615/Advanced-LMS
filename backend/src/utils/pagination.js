const parsePagination = (query = {}, { defaultPage = 1, defaultLimit = 20, maxLimit = 100 } = {}) => {
  const page = Math.max(parseInt(query.page, 10) || defaultPage, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

module.exports = { parsePagination };

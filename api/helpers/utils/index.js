const get_query_success = (obj) => {
  return (
    obj &&
    obj.status &&
    obj.status === 200 &&
    obj.data &&
    Array.isArray(obj.data) &&
    obj.data.length
  );
};

const insert_query_success = (obj) => {
  return obj && obj.status && obj.status === 200 && obj.data;
};

module.exports = {
  get_query_success,
  insert_query_success,
};

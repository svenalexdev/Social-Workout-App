const errorHandler = (err, req, res, next) => {
  process.env.NODE_ENV !== 'production' && console.error(err.stack);
  res.status(err.cause || 500).json({ error: err.message });
};
const test = () => {
  test;
};

export default errorHandler;

import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  if (!req.headers.cookie) {
    next(new Error('Unauthorized, please sign in', { cause: 401 }));
  }

  const cookies = req.headers.cookie?.split('; ');

  const cookieArrays = cookies.map(cookie => cookie.split('='));

  const cookiesObj = Object.fromEntries(cookieArrays);

  const { token } = cookiesObj;

  if (!token) {
    next(new Error('Unauthorized, please sign in', { cause: 401 }));
  }

  const { userId, userRole } = jwt.verify(token, process.env.JWT_SECRET);

  req.userId = userId;
  req.userRole = userRole;
  next();
};

export default verifyToken;

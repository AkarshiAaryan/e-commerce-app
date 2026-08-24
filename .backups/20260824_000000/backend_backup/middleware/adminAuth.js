module.exports = function (req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  next();
};

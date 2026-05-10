const roleCheck = (...allowedRoles) => {
  // Flatten in case called as roleCheck(['teacher', 'admin'])
  const roles = allowedRoles.flat();
  return (req, res, next) => {
    if (!req.userType) {
      return res.status(403).json({ error: 'Access denied. No role found.' });
    }

    if (!roles.includes(req.userType)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.userType}` 
      });
    }

    next();
  };
};

module.exports = roleCheck;

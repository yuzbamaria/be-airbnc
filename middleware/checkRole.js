const checkRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).send({ msg: "Access denied: insufficient role." })
        }
        next();
    }
};

module.exports = checkRole;
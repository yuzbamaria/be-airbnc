const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).send({ msg: "Missing authorization header." });
    }

    const token = authorization.split(" ")[1]; // format: Bearer <token>
    const { TOKEN_SECRET } = process.env;

    try {
        const decoded = jwt.verify(token, TOKEN_SECRET);
        req.user = decoded; // add user info to request object for later use
        next();
    } catch (err) {
        return res.status(403).send({ msg: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;
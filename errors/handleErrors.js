exports.handlePathNotFound = (req, res, next) => {
    res.status(404).send({ msg: "Path not found."});
};

exports.handleInvalidEndpoints = (err, req, res, next) => {
    if (err.code = 42703) {
        res.status(400).send({ msg: "Bad request - invalid sort option."});
    };
};
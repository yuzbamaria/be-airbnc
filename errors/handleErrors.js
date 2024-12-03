exports.handlePathNotFound = (req, res, next) => {
    res.status(404).send({ msg: "Path not found."});
};

exports.handleCustomError = (err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        next(err);
    };
};

const fetchProperties = require("../models/propertiesModels");

exports.getProperties =  async(req, res, next) => {
    const { sort = "popularity", order = "desc", host } = req.query;

    const validSortOptions = [
        "popularity", 
        "cost_per_night"
    ];

    const validOrderOptions = ["asc", "desc"];

    if (!validSortOptions.includes(sort) ||
        !validOrderOptions.includes(order)   
    ) {
        return res.status(404).send({ msg: "Resource not found."})
    };

    if (host && isNaN(Number(host))) {
        return res.status(400).send({ msg: "Bad request - invalid host id."})
    };

    try {
        const properties = await fetchProperties(sort, order, host);
        res.status(200).send(properties);
    } catch (err) {
        next(err);
    };
};

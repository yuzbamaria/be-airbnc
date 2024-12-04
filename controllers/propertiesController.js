const fetchProperties = require("../models/propertiesModels");

exports.getProperties =  async(req, res, next) => {
    const { sort = "popularity", order = "desc", host, maxprice } = req.query;

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
        return res.status(400).send({ msg: "Bad request - invalid endpoint."});
    };

    if (maxprice && isNaN(Number(maxprice))) {
        return res.status(400).send({ msg: "Bad request - invalid endpoint."});
    };
    
    try {
        const properties = await fetchProperties(sort, order, host, maxprice);
        res.status(200).send(properties);
    } catch (err) {
        next(err);
    };
};

const fetchProperties = require("../models/propertiesModels");

exports.getProperties =  async(req, res, next) => {
    const { sort = "popularity", order = "desc", host, maxprice, minprice } = req.query;

    const validSortOptions = [
        "popularity", 
        "cost_per_night"
    ];

    const validOrderOptions = ["asc", "desc"];

    if (!validSortOptions.includes(sort) ||
        !validOrderOptions.includes(order)   
    ) {
        return next({ status: 404, msg: "Path not found." }); // handlePathNotFound, 404
    };
    
    try {
        const properties = await fetchProperties(sort, order, host, maxprice, minprice);
        res.status(200).send(properties);
    } catch (err) {
        console.log(err);
        next(err);
    };
};

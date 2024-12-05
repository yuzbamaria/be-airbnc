const { fetchProperties } = require("../models/propertiesModels");

exports.getProperties =  async(req, res, next) => {
    const { sort, order, host, maxprice, minprice } = req.query;
    
    try {
        const properties = await fetchProperties(sort, order, host, maxprice, minprice);
        res.status(200).send(properties);
    } catch (err) {
        next(err);
    };
};

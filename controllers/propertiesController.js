const fetchProperties = require("../models/propertiesModels");

exports.getProperties =  async(req, res, next) => {
    const { sort = "popularity", order = "desc" } = req.query;
    
    try {
        const properties = await fetchProperties(sort, order);
        res.status(200).send(properties);
    } catch (err) {
        next(err);
    };
};

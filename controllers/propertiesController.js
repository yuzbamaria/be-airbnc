const fetchProperties = require("../models/propertiesModels");

exports.getProperties =  async(req, res, next) => {
    const { sortBy = "favourites_count", order = "desc" } = req.query;
    
    try {
        const properties = await fetchProperties(sortBy, order);
        res.status(200).send(properties);
    } catch (err) {
        console.log(err);
    };
};

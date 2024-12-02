const fetchProperties = require("../models/propertiesModels");

exports.getProperties =  async(req, res, next) => {
    const { sort = "favourites_count", order = "desc" } = req.query;
    
    try {
        const properties = await fetchProperties(sort, order);
        res.status(200).send(properties);
    } catch (err) {
        console.log(err);
    };
};

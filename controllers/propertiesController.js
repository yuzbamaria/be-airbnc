const { fetchProperties, fetchProperty, fetchFavouriteByUserModel } = require("../models/propertiesModels");

exports.getProperties =  async(req, res, next) => {
    const { sort, order, host, maxprice, minprice } = req.query;
    
    try {
        const properties = await fetchProperties(sort, order, host, maxprice, minprice);
        res.status(200).send(properties);
    } catch (err) {
        next(err);
    };
};

exports.getProperty = async(req, res, next) => {
    const { id: property_id } = req.params;
    const { user_id } = req.query;
    try {
        const property = await fetchProperty(property_id, user_id);
        res.status(200).send(property);
    } catch(err) {
        next(err);
    };
};

// exports.getFavouriteByUser = async(req, res, next) => {
//     const { id: property_id } = req.params;
//     const { user_id } = req.query;
//     try {
//         const favourite = await fetchFavouriteByUserModel(property_id, user_id);
//         res.status(200).send(favourite);
//     } catch(err) {
//         next(err);
//     };
// };

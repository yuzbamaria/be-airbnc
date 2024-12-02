const { favourites } = require("../db/data/test");

exports.orderProperties = (updatedHostKeyProperties) => {
    const orderedProperties = updatedHostKeyProperties.map((property) => ({
        property_id: property.property_id,
        property_name: property.name,
        location: property.location, 
        price_per_night: property.price_per_night,
        host: property.host
        // favourites_count: property.favourites_count
    }));
    return orderedProperties;
};

exports.lookUpHosts = (rows) => {
    const refObjs = {};
    rows.forEach((row) => { 
            refObjs[row.host_id] = `${[row.first_name]} ${row.surname}`; 
    });
    return refObjs;
};

exports.mapHostKey = (refObjs, keyToRemove, keyToAdd, rows) => {
    return rows.map(({ [keyToRemove]: removedKey, ...row }) => {
        return { ...row, [keyToAdd]: refObjs[removedKey] };
    });
};


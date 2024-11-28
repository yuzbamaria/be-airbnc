exports.lookUp = (insertData) => {
    const refObjs = {};
    insertData.forEach((row) => { 
            refObjs[`${[row.first_name]} ${row.surname}`] = row.user_id; 
    });
    return refObjs;
};

exports.lookUpProperties = (insertData) => {
    const refObjs = {};
    insertData.forEach((row) => { 
            refObjs[row.name] = row.property_id; 
    });
    return refObjs;
};

exports.formatData = (refObjs, keyToRemove, keyToAdd, rawData) => {
    return rawData.map(({ [keyToRemove]: removedKey , ...row }) => {
        return { ...row, [keyToAdd]: refObjs[removedKey]  };
    });
};

exports.orderProperties = (formattedProperties) => {
    const orderedProperties = formattedProperties.map(({
        host_id, 
        name, 
        location, 
        property_type, 
        price_per_night, 
        description
    }) => [
        host_id, 
        name, 
        location, 
        property_type, 
        price_per_night, 
        description
    ]);
    return orderedProperties;
};

exports.selectHosts = (insertedUsers) => {
    const hosts = [];
    insertedUsers.forEach((user) => {
        if (user.role === "host") {
            hosts.push(user);
        };
    });
    return hosts;
};

exports.selectGuests = (insertedUsers) => {
    const guests = [];
    insertedUsers.forEach((user) => {
        if (user.role === "guest") {
            guests.push(user);
        };
    });
    return guests;
};

exports.orderReviews = (formattedReviews) => {
    const orderedReviews = 
}

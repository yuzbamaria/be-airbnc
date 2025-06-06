const manageTables = require("./manage-tables");

const  { 
    insertUsers, 
    insertPropertyTypes,
    insertProperties,
    insertFavourites, 
    insertReviews,
    insertImages,
    insertBookings
} = require("./insert-data");

const { 
    lookUp, 
    lookUpProperties, 
    formatData, 
    orderProperties,
    selectHosts, 
    selectGuests,
    orderReviews, 
    orderBookings
} = require("./utils.js");


async function seed({ users, propertyTypes, properties, favourites, reviews, images, bookings }) {
    
    // DROP AND CREATE TABLES
    await manageTables();  
    // try {
    //     console.log("Table created successfully.");
    // } catch (err) {
    //     console.error("Error creating table:", err);
    // };

    // INSERT DATA
    // INSERT USERS TABLE
    const { rows: insertedUsers } = await insertUsers(users);
    const hosts = selectHosts(insertedUsers);
    const hostRef = lookUp(hosts);

    const formattedProperties = formatData(hostRef, "host_name", "host_id", properties);
    const orderedProperties = orderProperties(formattedProperties);

    // INSERT PROPERTY_TYPES TABLE
    await insertPropertyTypes(propertyTypes);
    
    // INSERT PROPERTIES TABLE
    const { rows: insertedProperties } = await insertProperties(orderedProperties);

    const guests = selectGuests(insertedUsers);
    const guestRef = lookUp(guests);
    const propertyRef = lookUpProperties(insertedProperties);

    const formattedGuestsIDs = formatData(guestRef, "guest_name", "guest_id", favourites);
    const formattedFavourites = formatData(propertyRef, "property_name", "property_id", formattedGuestsIDs);
    
    // INSERT FAVOURITES TABLE
    await insertFavourites(formattedFavourites);

    const formattedReviewsGuestsNames = formatData(guestRef, "guest_name", "guest_id", reviews);
    const formattedReviews = formatData(propertyRef, "property_name", "property_id", formattedReviewsGuestsNames);
    const orderedReviews = orderReviews(formattedReviews);
    await insertReviews(orderedReviews);

    // INSERT IMAGES TABLE
    const formattedImages = formatData(propertyRef, "property_name", "property_id", images);
    const updatedAltProp = formattedImages.map((image) => {
        const { alt_tag, ...rest} = image;
        return { ...rest, alt_text: alt_tag };
    });
    await insertImages(updatedAltProp);

    // INSERT BOOKINGS TABLE
    const updatedBookingsIds = formatData(propertyRef, "property_name", "property_id", bookings);
    const updatedBookings = formatData(guestRef, "guest_name", "guest_id", updatedBookingsIds);
    const orderedBookings = orderBookings(updatedBookings);
    await insertBookings(orderedBookings);

};

module.exports = seed;
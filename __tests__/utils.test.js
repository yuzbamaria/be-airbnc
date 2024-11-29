const {
    lookUp, 
    lookUpProperties, 
    formatData, 
    orderProperties,
    selectHosts,
    selectGuests
} = require("../db/utils");

describe("lookUp", () => {
    test("returns an object with combined first_name & surname into fullname, and corresponding id", () => {
        const user = [{
                user_id: 2,
                first_name: 'Bob',
                surname: 'Smith',
                email: 'bob@example.com',
                phone_number: '+44 7000 222222',
                role: 'guest',
                avatar: 'https://example.com/images/bob.jpg',
                created_at: "2024-11-27T12:47:03.949Z"
        }];
        expect(lookUp(user)).toEqual({ 'Bob Smith': 2 });
    });
});
describe("lookUpProperties", () => {

});
describe("formatData", () => {
    test("returns an array", () => {
        expect(Array.isArray(formatData({}, "", "", []))).toBe(true);
    });
    test("removes keyToRemove property", () => {
        const keyToRemove = "host_name";
        const rawData = [{ "host_name": "Alice", "age": 30}];
        const formattedData = formatData({"Alice": 1}, keyToRemove, "host_id", rawData)
        expect(formattedData).not.toHaveProperty("host_name");
    });
    test("adds keyToAdd property", () => {
        const keyToRemove = "host_name";
        const keyToAdd = "host_id";
        const rawData = [{ "host_name": "Alice", "age": 30}];
        const formattedData = formatData({"Alice": 1}, keyToRemove, keyToAdd, rawData);
        expect(formattedData[0]).toHaveProperty("host_id");
    });
});
describe("orderProperties", () => {
    test("returns an array of arrays", () => {
        expect(orderProperties([{}])).toEqual([[]]);
    });
    test("orders keys in Properties objects to match the PostgreSQL table order", () => {
        const initialObj = [{
            name: 'Modern Apartment in City Center',
            property_type: 'Apartment',
            location: 'London, UK',
            price_per_night: 120,
            description: 'Description of Modern Apartment in City Center.',
            host_id: 1
        }];
        expect(orderProperties(initialObj)).toEqual([[
            1,
            'Modern Apartment in City Center',
            'London, UK',
            'Apartment',
            120,
            'Description of Modern Apartment in City Center.'
          ]]);
    });
});
describe("selectHosts", () => {
    test("selects user objects where role is host", () => {
        const insertedUsers = [{
            user_id: 1,
            first_name: 'Alice',
            surname: 'Johnson',
            role: 'host'
        },
        {
            user_id: 2,
            first_name: 'Bob',
            surname: 'Smith',
            role: 'guest'
        }];
        const hosts = selectHosts(insertedUsers)
        expect(hosts).toEqual([{
            user_id: 1,
            first_name: 'Alice',
            surname: 'Johnson',
            role: 'host'
        }]);
    })
});
describe("selectGuests", () => {

});
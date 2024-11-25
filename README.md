# AirBNC

## Description 
This is an Express server that allows users to make HTTP requests associated with an Airbnb style application and interact with properties, reviews, and user data. It connects to a PostgreSQL database using node-postgres. The server includes fully tested endpoints, verified through integration tests with Supertest and Jest. 

## Project setup

Run `npm install` in the root of repo to install the necessary dependencies.

Create a `.env.test` file at the root level with the following content:

```
PGDATABASE=mitchs_rare_treasures
```

- Run `npm run setup-dbs` to create the local test database.

## License 
MIT License

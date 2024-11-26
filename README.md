# AirBNC

## Description 
This is an Express server that allows users to make HTTP requests associated with an Airbnb style application and interact with properties, reviews, and user data. It connects to a PostgreSQL database using node-postgres. The server includes fully tested endpoints, verified through integration tests with Supertest and Jest. 

## Project setup

- Run `npm install` in the root of repo to install the necessary dependencies.

- Create a `.env.test` file at the root level with the following content:

```
PGDATABASE=airbnc_test
```
- Run `npm run setup-dbs` to create the local test database.

<br>

**How the Pool Accesses Credentials**

The `pg` module's `Pool` instance accesses database credentials from the environment variables defined in the `.env.test` file.

1. Loading Environment Variables:  
The dotenv library loads variables from `.env.test` (e.g., `PGDATABASE=airbnc_test`) into `process.env`.

2. Verifying Configuration:  
The script checks that `PGDATABASE` is set. If missing, it throws an error:

```
if (!process.env.PGDATABASE) {
    throw new Error("PGDATABASE not set");
};
```

3. Connecting to the Database:  
When a `Pool` instance is created, it automatically reads credentials like `PGDATABASE` from `process.env`.


## License 
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

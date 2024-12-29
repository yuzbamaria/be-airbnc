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

## Technologies used
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Database Client: Node-Postgres (pg)
- Hosting: Supabase (database), Render (API)
- Architecture: MVC (Model-View-Controller)
- Version Control: Git, GitHub
- Project Management: Trello

## License 
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

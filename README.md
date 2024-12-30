# AirBNC

## Description 
This is an Express server that allows users to make HTTP requests associated with an Airbnb style application and interact with properties, reviews, and user data. It connects to a PostgreSQL database using node-postgres. The server includes fully tested endpoints, verified through integration tests with Supertest and Jest. 
<br>

## Project setup

### Prerequisites

Ensure the following dependencies are globally installed:
- Node.js: version 23.0.0 or higher
- PostgreSQL: version 14.15 or higher
- NPM: version 10.9.2 or higher

### Installation Steps

1. Fork and then clone the repositiory:
```
git clone https://github.com/your_user_name/be-airbnc
```

2. Install the necessary dependencies by running the following in the root of repo:
```
npm install
```
It will install the following dependencies: `dotenv`, `express`, `pg`, `pg-format`.

3. Set up databases by running:
```
npm run setup-dbs
npm run seed 
```

4. Create two `.env` files at the root level where each stores an environment variable for the connection pool to access databases based on the specific environment (test and development).
Ensure they are both added to `.gitignore`:

`.env.test`:
```
PGDATABASE=airbnc_test
```

`.env.dev`:
```
PGDATABASE=airbnc
```
<br>

## Technologies used
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Database Client: Node-Postgres (pg)
- Hosting: Supabase (database), Render (API)
- Architecture: MVC (Model-View-Controller)
- Version Control: Git, GitHub
- Project Management: Trello
<br>

## License 
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

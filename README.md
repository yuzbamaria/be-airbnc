# AirBNC

## Description 
This is an Express server that provides an API for an Airbnb-style application, allowing users to interact with property listings, reviews, and user data. It connects to a PostgreSQL database using the node-postgres library. The server includes fully tested CRUD endpoints, verified through integration tests using Supertest and Jest. Documentation is available here: https://be-airbnc-zw86.onrender.com/description.html
<br>

## Project setup

### Prerequisites

Ensure the following dependencies are globally installed:
- **Node.js**: version 23.0.0 or higher
- **PostgreSQL**: version 14.15 or higher
- **NPM**: version 10.9.2 or higher

### Installation Steps

1. Fork and then clone the repositiory:
```
git clone https://github.com/your_user_name/be-airbnc
```

2. Install the necessary dependencies by running the following in the root of repo:
```
npm install
```

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

## Technologies used
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Database Client**: Node-Postgres (pg)
- **Testing**: Jest (unit testing), Supertest (integration testing), Postman (manual testing of endpoints and simulating requests)
- **Hosting**: Supabase (database), Render (API)
- **Architecture**: MVC (Model-View-Controller)
- **Version Control**: Git, GitHub
- **Project Management**: Trello

## License 
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

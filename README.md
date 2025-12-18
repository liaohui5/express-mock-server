# Express Mock Server

## Overview

This project is a mock server built using Express.js, Mock.js, JWT, and other related technologies. It provides endpoints for testing server status, handling image placeholders, user authentication, and more.

## Installation

1. Clone the repository:

```bash
git clone git@github.com:liaohui5/express-mock-server.git
cd express-mock-server
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the server:

```bash
pnpm run dev
```

## Configuration

The server configuration is stored in `config.js`. Key configuration options include:

- `port`: The port on which the server will listen.
- `enableCors`: Whether to enable CORS requests.
- `prefix`: The API prefix.
- `accessTokenOpts`: Options for the access token.
- `refreshTokenOpts`: Options for the refresh token.

## Endpoints

### Server Status

- **Endpoint**: `/`
- **Method**: `GET`
- **Description**: Returns a simple "OK" response to test server status.

### Environment Variables

- **Endpoint**: `/env`
- **Method**: `GET`
- **Description**: Returns environment variables for testing PM2 configuration.

### Image Placeholder

- **Endpoint**: `/image-placeholder`
- **Method**: `GET`
- **Description**: Generates a placeholder image based on query parameters.
- **Query Parameters**:
  - `w`: Width of the image (default: 600).
  - `h`: Height of the image (default: 400).
  - `bg`: Background color (default: #dddddd).
  - `c`: Text color (default: #888888).
  - `text`: Text to display (default: width x height).
  - `type`: Type of image (default: svg, options: png, svg).

### User Authentication

- **Endpoint**: `/login`
- **Method**: `POST`
- **Description**: Logs in a user and returns an access token and refresh token.
- **Request Body**:
  - `email`: User's email.
  - `password`: User's password.
- **Response**:
  - `id`: User's ID.
  - `username`: User's username.
  - `email`: User's email.
  - `accessToken`: Access token.
  - `refreshToken`: Refresh token.

- **Endpoint**: `/refresh-access-token`
- **Method**: `GET`
- **Description**: Refreshes the access token using a refresh token.
- **Query Parameters**:
  - `refreshToken`: Refresh token.
- **Response**:
  - `accessToken`: New access token.

### Articles

- **Endpoint**: `/articles`
- **Method**: `GET`
- **Description**: Returns a list of mock articles.
- **Response**:
  - `page`: Current page.
  - `size`: Number of articles per page.
  - `rows`: Array of articles.

- **Endpoint**: `/article/:id`
- **Method**: `PATCH`
- **Description**: Updates an article by ID.
- **Response**:
  - `id`: Updated article ID.

- **Endpoint**: `/article/:id`
- **Method**: `DELETE`
- **Description**: Deletes an article by ID.
- **Response**:
  - `id`: Deleted article ID.

## Middleware

- **handleImagePlaceholderOpts**: Handles image placeholder options.
- **auth**: Authenticates requests using JWT.

## Dependencies

- **Express.js**: A minimal and flexible Node.js web application framework.
- **Mock.js**: A powerful fake data generator.
- **JWT**: JSON Web Token for secure token-based authentication.
- **CORS**: Cross-Origin Resource Sharing for handling cross-origin requests.
- **Sharp**: A high-performance image processing library.

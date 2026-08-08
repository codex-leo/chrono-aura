# API Documentation
This is the API documentation for the ChronoAura backend. The API is built using Node.js and Express, and it provides endpoints for managing products, users, orders, and more.

1. **Authentication**
    - ChronoAura uses JWT (JSON Web Tokens) for authentication. Users can register, login, refresh their access tokens, and logout from the system.
    - Refresh tokens are used to obtain new access tokens without requiring the user to re-authenticate.
    - And access tokens are used to authenticate requests to protected endpoints, access tokens must be included in the `Authorization` header with value `Bearer <access-token>` of requests to protected endpoints.
    -----
    1. `POST /api/auth/register` :
        - Register a new user. The request body should include the user's email, password, and username.
        - Example request body:
        ```json
        {
            "email": "sample123@example.com"
            "password": "samplepassword",
            "username": "sampleuser"
        }
        ```
        - Example response:
        ```json
        {
            "message": "User registered successfully",
            "accessToken": "<access-token>"
        }
        ```
        - The refresh token is set to the client as an HTTP-only cookie when the user logs in or registers.
        - **Note**: The username must be unique, and the email must be valid. Passwords should meet the security requirements defined in the backend that is it must be of minimum 8 characters having atleast 1 uppercase letter,1 lower letter,1 number and 1 symbol.
        <br/>
    - `POST /api/auth/login` :
        - Login a user. Request body should include the user's email or username and password.
        - Example request body:
        ```json
        {
            "email": "sample123@example.com",
            "password": "samplepassword"
        } 
        //or 
        {
            "username": "sampleuser",
            "password": "samplepassword"
        }
        ```
        - Example response:
        ```json
        {
            "message": "User logged in successfully.",
            "accessToken": "<access-token>",
            "user": {
                "id": "<user-id>",
                "username": "sampleuser",
                "email": "sample123@example.com",
                "role": "user",
                "cart": "<cart-id>",
                "wishlist": "<wishlist-id>"
            }
        }
        ```
        <br/>
    - `POST /api/auth/refresh-token` :
        - Refresh the access token using a valid refresh token. It is called without any request body, but the refresh token must be valid and included in cookies of the request.
        - Example response:
        ```json
        {
            "message": "Token Refreshed successfully.",
            "accessToken": "<access-token>"
        }
        ```
        - A new refresh token is also set to the client as an HTTP-only cookie when the access token is refreshed.

    - `POST /api/auth/logout` :
        - Logout the user by invalidating the refresh token. It is called without any request body, but the refresh token must be valid and included in cookies of the request and accessToken must be included in `Authorization` header with value `Bearer <access-token>`.
        - Example response:
        ```json
        {
            "message": "Logged out successfully."
        }
        ```
    - `POST /api/auth/logout-all` :
        - Logout the user from all devices by invalidating all refresh tokens. It is called without any request body, but the refresh token must be valid and included in cookies of the request and accessToken must be included in `Authorization` header with value `Bearer <access-token>`.
        - Example response:
        ```json
        {
            "message": "Logged out from all devices successfully."
        }
        ```
    -----

**Note: UNDER DEVELOPMENT**
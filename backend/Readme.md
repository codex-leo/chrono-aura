# ChronoAura Backend v0.1.0

This is the backend for the ChronoAura online luxury watch store, built with Node.js and Express.

- This is open source backend so any one who want to use this source for thier own ecommerce project can use it for free. You can also contribute to this project by submitting pull requests or reporting issues.

- NOTE: This backend is still under development and may have bugs or missing features. Please report any issues you encounter.

---
# TABLE OF CONTENTS

- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

---

# Installation

- Clone the repository:

```bash
git clone https://github.com/codex-leo/chrono-aura.git
```

-  Change directory to the backend folder:

```bash
cd chronoaura/backend
```

- Install the dependencies:

```bash
npm install
```

- Set up the environment variables by creating a `.env` file in the root directory and adding the following variables:

```bash
MONGO_URL=your_mongodb_connection_string
IMAGE_KIT_PRIVATE_KEY=your_imagekit_private_key
JWT_ACCESS_TOKEN_SECRET=your_jwt_access_token_secret
JWT_REFRESH_TOKEN_SECRET=your_jwt_refresh_token_secret
```

- Start the server:

```bash
npm run dev //for development
```

- *Above command will start the server on `http://localhost:5000` by default and it uses nodemon to automatically restart the server when changes are made to the code.*

- **Note : This backend is still under development and may have bugs or missing features and if you wish to use this for production, please make sure to test it thoroughly and make any necessary modifications to suit your needs.**

---

# API Endpoints

**NOTE : Backend is still under development and endpoints may change in future releases. Please check the documentation for the latest updates.**

- The backend provides the following API endpoints:

     - **Authentication**
        - `POST /api/auth/register` - Register a new user
        - `POST /api/auth/login` - Login a user
        - `POST /api/auth/refresh-token` - Refresh access token
        - `POST /api/auth/logout` - Logout a 
        - `POST /api/auth/logout-all` - Logout from all devices
    
    - **Products**
        - `POST /api/product/register-brand` - Register a new brand (admin only)
        - `POST /api/product/register-product` - Register a new product (admin only)
        - ***NOTE** : This backend is designed in such a way that if you want to register a new product, you must first register the brand of that product. If the brand is not registered, you will not be able to register the product.*
        - `GET /api/product/products/all` - Get all products
        - `GET /api/product/products/:limit` - Get a limited number of products
        - `GET /api/product/:id` - Get a single product by ID
        - `GET api/product/sample/products` - Get a sample product data (limited to 5 products) for homepage display before login or registration
        - `PUT /api/product/:id` - Update a product by ID (admin only)


        - **Product Reivews**
            - `POST /api/product/:productId/reviews` - Add a review for a product (user must be logged in)
            - `GET /api/product/:productId/reviews` - Get all reviews for a product (query params: `?page=1&limit=10` for pagination)
            - `GET /api/product/reviews/my-reviews` - Get all reviews by the logged in user (user must be logged in)
            - `DELETE /api/product/:reviewId/reviews` - Delete a review by ID (user must be logged in and must be the owner of the review)
            - `PATCH /api/product/:reviewId/reviews` - Update a review by ID (user must be logged in and must be the owner of the review)


    - **Cart**
        - `POST /api/cart/add-to-cart` - Add a product to the cart
        - `PATCH /api/cart/update-cart/:productId` - Update the quantity of a product in the cart
        - `GET /api/cart/my-cart` - Get the cart for the logged in user
        - `DELETE /api/cart/my-cart/clear-cart` - Clear the cart for the logged in user
        - `DELETE /api/cart/my-cart/:productId` - Remove a product from the cart for the logged in user

    - **Brand**
        - `GET /api/brands/all` - Get all brands
        - `GET /api/brands/:limit` - Get a limited number of brands
        - `GET /api/brands/:id` - Get a single brand by ID

    - **Users**
        - `GET /api/user/me` - Get the current logged in user
        - `GET /api/user/users/all` - Get all users (admin only)
        - `GET /api/user/users/:limit` - Get a limited number of users (admin only)
        - `GET /api/user/:id` - Get a single user by ID (admin only)
    
    - **Dashboard(admin only)**
        - `GET /api/admin/dashboard/stats` - Get dashboard statistics (now it only returns total number of users, products and brands but in future it will return more statistics like total sales, revenue, etc.)
        - `GET /api/admin/dashboard/low-stock` - Get low stock products (now it only returns products with stock less than 10 you can change this limit in the code `backend/src/controllers/dashboard.controller.js` but in future it will be configurable from the admin panel)

    - **Orders**
        - `POST /api/order/create` - Create a new order (user must be logged in)
        - `GET /api/order/admin/orders/all` - Get all orders (admin only)
        - `GET /api/order/admin/orders/:limit` - Get a limited number of orders
        - `PATCH /api/order/admin/order-status/:orderId` - Update the status of an order (admin only)
        - `GET /api/order/my-orders` - Get all orders for the logged in user (user must be logged in)
        - `POST /api/order/cancel/:orderId` - Cancel an order (user must be logged in and must be the owner of the order)
        - `POST /api/order/request-return/:orderId` - Request a return for an order (user must be logged in and must be the owner of the order)
        - `PUT /api/order/admin/return-requests/:orderId/approve` - Approve a return request (admin only)
        - `PUT /api/order/admin/return-requests/:orderId/reject` - Reject a return request (admin only)
        - `PUT /api/order/admin/return-requests/:orderId/return-pickup` - Mark a return request to initiate order return (pickup) (admin only)
        - `PUT /api/order/admin/return-requests/:orderId/return-received` - Mark a return order as received (admin only)
        - `PUT /api/order/admin/return-requests/:orderId/complete-return` - Mark a return order as completed (admin only)
        - `GET /api/order/admin/return-requests/all` - Get all return requests (admin only)
        - `GET /api/order/admin/return-requests/:limit` - Get a limited number of return requests (admin only)
        - `GET /api/order/:orderId` - Get a single order by ID (user must be logged in and must be the owner of the order)
        - `GET /api/order/admin/:orderId` - Get a single order by ID (admin only)
    
    - **Wishlist**
        - `POST /api/wishlist/:productId` - Add a product to the wishlist (user must be logged in)
        - `GET /api/wishlist/my-wishlist` - Get the wishlist for the logged in user (user must be logged in)
        - `DELETE /api/wishlist/:productId` - Remove a product from the wishlist for the logged in user (user must be logged in)
        - `DELETE /api/wishlist/clear` - Clear the wishlist for the logged in user (user must be logged in)

    - For more detailed information about the API endpoints, please refer to the [API Documentation](API.md) (under development).
---

# Contributing

If you wish to contribute to this project, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to contribute.

**[documentation under deveolopment so please check back later for more information]**
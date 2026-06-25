# ChronoAura Backend v0.1.0

This is the backend for the ChronoAura online luxury watch store, built with Node.js and Express.

- This is open source backend so any one who want to use this source for thier own ecommerce project can use it for free. You can also contribute to this project by submitting pull requests or reporting issues.

- NOTE: This backend is still under development and may have bugs or missing features. Please report any issues you encounter.

---
# TABLE OF CONTENTS

- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
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

    - **Cart**
        - `POST /api/cart/add-to-cart` - Add a product to the cart
        - `PUT /api/cart/update-cart/:userId` - Update the cart for a user
        - `GET /api/cart/:userId` - Get the cart for a user
        - `DELETE /api/cart/:userId/clear-cart` - Clear the cart for a user
        - `DELETE /api/cart/:userId/:productId` - Remove a product from the cart for a user

---
**[documentation under deveolopment so please check back later for more information]**
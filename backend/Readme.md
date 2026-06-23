# ChronoAura Backend v0.1.0

This is the backend for the ChronoAura online luxury watch store, built with Node.js and Express.

- This is open source backend so any one who want to use this source for thier own ecommerce project can use it for free. You can also contribute to this project by submitting pull requests or reporting issues.

- NOTE: This backend is still under development and may have bugs or missing features. Please report any issues you encounter.

---
# TABLE OF CONTENTS

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

---

# Installation

- Clone the repository:

```bash
git clone https://github.com/chronoaura/chronoaura.git
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
**[documentation under deveolopment so please check back later for more information]**
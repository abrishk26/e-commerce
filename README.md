# Project Setup and Usage Guide

This project is divided into two main folders: `bookstore-api` for the backend and `frontend` for the frontend.

## Frontend Setup (`efrontend-main` folder)

1.  **Navigate to the frontend folder:**
    ```bash
    cd efrontend-main
    ```

2.  **Configure environment variables:**
    Rename `.env.example` to `.env`:
    ```bash
    mv .env.example .env
    ```
    If necessary, configure the port address the backend listens to within the `.env` file.

3.  **Install dependencies:**
    Ensure you have Node.js and npm installed. Then, execute:
    ```bash
    npm install
    ```

## Backend Setup (`bookstore-api` folder)

1.  **Navigate to the backend folder:**
    ```bash
    cd bookstore-api
    ```

2.  **Configure environment variables:**
    Rename `.env.example` to `.env`:
    ```bash
    mv .env.example .env
    ```
    * **SMTP Configuration (Optional):** If you need to send emails, configure your SMTP settings in the `.env` file. This is not mandatory for basic functionality.
    * **MongoDB:** Install MongoDB and ensure it is running. You can change the MongoDB connection URI and token expiration time in the `.env` file if needed; otherwise, the default settings should suffice.

3.  **Install `nodemon` and other dependencies:**
    ```bash
    npm install nodemon
    npm install
    ```

## Running the Applications

1.  **Start the Backend Server:**
    In the `bookstore-api` folder, run:
    ```bash
    npm run dev
    ```

2.  **Start the Frontend Application:**
    In the `efrontend-main` folder, run:
    ```bash
    npm run dev
    ```

3.  **Access the Application:**
    Go to the address logged in your console (usually `http://localhost:3000` or similar).

## Application Usage

### User Authentication

* In the navigation bar, locate the **profile icon**.
* Use this icon to **login**, **register**, and **logout**.
* **New Users:** First, sign up for a new account.

### Admin Privileges

* To gain admin privileges, **directly modify your registered user information in the MongoDB database**.
* Change your `role` field to `admin`.

### Admin Functionality (with Admin Privileges)

* As an admin, you can access **admin endpoints**.
* **Add Books:** Use the admin interface to add new books to the system.
* **Show Orders:** View existing orders.
* **Important:** After adding books, **refresh the page** to see the newly added books reflected in the display.

### Normal User Functionality

* **View Books:** Browse books based on different categories.
* **Add to Cart:** Add desired books to your shopping cart.
* **Checkout:** Click the "Checkout" button on the cart menu to place your order, which will be added to the backend.
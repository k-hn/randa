/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

// API routes
Route.group(() => {
  // v1 routes
  Route.group(() => {
    // User registration routes
    Route.post("/register", "RegisterController.create").as("register");
    Route.get("/verify/:token", "RegisterController.verify").as("verify");
    Route.post("/resend-verification", "RegisterController.resendVerification").as("resendVerification");

    // User auth routes
    Route.post("/login", "AuthController.login").as("login");
    Route.get("/logout", "AuthController.logout").as("logout")
    Route.post("/forgot-password", "AuthController.forgotPassword").as("forgotPassword");
    Route.post("/resend-forgot-password", "AuthController.resendForgotPassword").as("resendForgotPassword");
    Route.post("/reset-password/:token", "AuthController.resetPassword").as("resetPassword");

    // Auth routes
    Route.group(() => {
      // User account details routes
      Route.get("/user", "UserController.show").as("showUser")
      Route.put("/user", "UserController.update").as("updateUser")
      Route.delete("/user", "UserController.destroy").as("deleteUser")
      Route.get("/user/appointments", "UserController.getAppointments").as("getUserAppointments");
      Route.get("/user/appointment/:id", "UserController.getAppointment").as("getUserAppointment");

      // Appointments routes
      Route.post("/appointments", "AppointmentController.create").as("createAppointment");
      // Route.get("/appointments/:id", "Appointments")


    }).middleware("auth");

  }).prefix("/v1").as("v1");
}).prefix("/api").as("api");

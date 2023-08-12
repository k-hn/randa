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

      // User appointment routes
      Route.get("/user/appointments", "UserController.getAppointments").as("getUserAppointments");
      Route.get("/user/appointments/:id", "UserController.getAppointment").as("getUserAppointment");
      Route.put("/user/appointments/:id", "UserController.updateAppointment").as("updateUserAppointment");
      Route.delete("/user/appointments/:id", "UserController.deleteAppointment").as("deleteUserAppointment");

      // Appointments routes
      Route.post("/appointments", "AppointmentController.create").as("createAppointment");

      // Mentor routes index, show
      Route.get("/mentors", "MentorController.index").as("getAllMentors");
      Route.get("/mentors/:id", "MentorController.show").where("id", Route.matchers.number()).as("getMentor");

      // Mentor appointment routes
      Route.get("/mentors/appointments", "MentorController.getAppointments").as("getMentorAppointnments");
      Route.get("/mentors/appointments/:id", "MentorController.getAppointment").where("id", Route.matchers.number()).as("getMentorAppointment");
      Route.put("/mentors/appointments/:id", "MentorController.updateAppointment").where("id", Route.matchers.number()).as("updateMentorAppointment");
      Route.delete("/mentors/appointments/:id", "MentorController.deleteAppointment").where("id", Route.matchers.number()).as("deleteMentorAppointment");
    }).middleware("auth");

  }).prefix("/v1").as("v1");
}).prefix("/api").as("api");

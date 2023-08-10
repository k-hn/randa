import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";
import User from "App/Models/User";
import AppointmentFactory from "Database/factories/AppointmentFactory";
import UserFactory from "Database/factories/UserFactory";
import { DateTime } from "luxon";

test.group("User Account: show", (group) => {
    group.each.setup(async () => {
        await Database.beginGlobalTransaction();
        return () => Database.rollbackGlobalTransaction();
    });

    test("show logged-in user account details passes", async ({ client }) => {
        const user = await UserFactory
            .with("emailVerificationToken", 1, (token) => token.apply("verified"))
            .create();

        const response = await client
            .get("/api/v1/user")
            .loginAs(user);

        response.assertStatus(200);
    });

    test("show non logged-in user account details fails", async ({ client }) => {
        await UserFactory
            .with("emailVerificationToken", 1, (token) => token.apply("verified"))
            .create();

        const response = await client
            .get("/api/v1/user")

        response.assertStatus(401);
    });
});


test.group("User Account: update", (group) => {
    group.each.setup(async () => {
        await Database.beginGlobalTransaction()
        return () => Database.rollbackGlobalTransaction();
    });

    test("updating logged-in user account details passes", async ({ client }) => {
        const user = await UserFactory
            .merge({ firstName: "Johnson" })
            .with("emailVerificationToken", 1, (token) => token.apply("verified"))
            .create();

        const payload = {
            firstName: "Augustine",
            isMentor: true,
        };

        const response = await client
            .put("/api/v1/user")
            .json(payload)
            .loginAs(user);

        response.assertStatus(200);
        response.assertBodyContains({
            first_name: "Augustine"
        });

        const updatedUser = await User.findOrFail(user.id)
        updatedUser.related("mentor").query().firstOrFail();
    });

    test("updating non logged-in user account details fails", async ({ client }) => {
        await UserFactory
            .merge({ firstName: "Johnson" })
            .with("emailVerificationToken", 1, (token) => token.apply("verified"))
            .create();

        const payload = {
            firstName: "Augustine"
        };

        const response = await client
            .put("/api/v1/user")
            .json(payload)

        response.assertStatus(401);
    })
})


test.group("User Account: delete", (group) => {
    group.each.setup(async () => {
        await Database.beginGlobalTransaction()
        return () => Database.rollbackGlobalTransaction();
    });

    test("delete user account passses", async ({ client }) => {
        const user = await UserFactory
            .merge({ firstName: "Johnson" })
            .with("emailVerificationToken", 1, (token) => token.apply("verified"))
            .create();

        const response = await client
            .delete("/api/v1/user")
            .loginAs(user);

        response.assertStatus(204);
    });

    test("delete non logged-in user account fails", async ({ client }) => {
        await UserFactory
            .merge({ firstName: "Johnson" })
            .with("emailVerificationToken", 1, (token) => token.apply("verified"))
            .create();

        const response = await client
            .delete("/api/v1/user")

        response.assertStatus(401);
    });
});

test.group("User Account Appointments: show", (group) => {
    group.each.setup(async () => {
        await Database.beginGlobalTransaction()
        return () => Database.rollbackGlobalTransaction();
    });

    test("user retrieving their appointment passes", async ({ client }) => {
        const appointments = await AppointmentFactory
            .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
            .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
            .createMany(3);

        const appointment = appointments[0];
        await appointment.load("user")
        const appointmentUser = appointment.user;

        const response = await client
            .get(`/api/v1/user/appointments/${appointment.id}`)
            .loginAs(appointmentUser);

        response.assertStatus(200);
    });

    test("user retrieving all their appointments passes", async ({ assert, client }) => {
        const appointmentUser = await UserFactory
            .with("emailVerificationToken", 1, (token) => token.apply("verified"))
            .create();

        const numberOfAppointments = 15;
        await AppointmentFactory
            .merge({ userId: appointmentUser.id })
            .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
            .createMany(numberOfAppointments);

        const response = await client
            .get("/api/v1/user/appointments")
            .loginAs(appointmentUser);

        response.assertStatus(200);
    });

    test("user retrieving their appointment fails when not logged in", async ({ client }) => {
        const appointments = await AppointmentFactory
            .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
            .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
            .createMany(3);

        const appointment = appointments[0];
        await appointment.load("user")

        const response = await client
            .get(`/api/v1/user/appointments/${appointment.id}`)

        response.assertStatus(401);
    });

    test("user retrieving all their appointments fails when not logged in", async ({ client }) => {
        const appointmentUser = await UserFactory
            .with("emailVerificationToken", 1, (token) => token.apply("verified"))
            .create();

        await AppointmentFactory
            .merge({ userId: appointmentUser.id })
            .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
            .createMany(3);

        const response = await client
            .get("/api/v1/user/appointments")

        response.assertStatus(401);
    });
});


test.group("User Account Appointments: update", (group) => {
    group.each.setup(async () => {
        await Database.beginGlobalTransaction()
        return () => Database.rollbackGlobalTransaction();
    });

    test("updating user appointment passes", async ({ assert, client }) => {
        const appointment = await AppointmentFactory
            .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
            .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
            .create();

        await appointment.load((loader) => {
            loader.load("user").load("mentor")
        });
        const appointmentUser = appointment.user;
        const appointmentMentor = appointment.mentor;

        const oldEndAt = appointment.endAt;
        const payload = {
            mentorId: appointmentMentor.id,
            startAt: appointment.startAt,
            endAt: oldEndAt.plus({ hours: 1 })
        };

        const response = await client
            .put(`/api/v1/user/appointments/${appointment.id}`)
            .json(payload)
            .loginAs(appointmentUser);

        response.assertStatus(200);

        const updatedBody = response.body();
        assert.isTrue(updatedBody.end_at === oldEndAt.plus({ hours: 1 }).toString())
    });

    test("updating user appointment by guest fails", async ({ assert, client }) => {
        const appointment = await AppointmentFactory
            .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
            .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
            .create();

        await appointment.load((loader) => {
            loader.load("user").load("mentor")
        });

        const appointmentMentor = appointment.mentor;

        const oldEndAt = appointment.endAt;
        const payload = {
            mentorId: appointmentMentor.id,
            startAt: appointment.startAt,
            endAt: oldEndAt.plus({ hours: 1 })
        };

        const response = await client
            .put(`/api/v1/user/appointments/${appointment.id}`)
            .json(payload)

        response.assertStatus(401);
    });

    test("updating user appointment by unauthorised user fails", async ({ assert, client }) => {
        const randomUser = await UserFactory
            .with("emailVerificationToken", 1, (token) => token.apply("verified"))
            .create();

        const appointment = await AppointmentFactory
            .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
            .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
            .create();

        await appointment.load((loader) => {
            loader.load("user").load("mentor")
        });

        const appointmentMentor = appointment.mentor;

        const oldEndAt = appointment.endAt;
        const payload = {
            mentorId: appointmentMentor.id,
            startAt: appointment.startAt,
            endAt: oldEndAt.plus({ hours: 1 })
        };

        const response = await client
            .put(`/api/v1/user/appointments/${appointment.id}`)
            .json(payload)
            .loginAs(randomUser);

        response.assertStatus(404);
    });
})


import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";
import User from "App/Models/User";
import UserFactory from "Database/factories/UserFactory";

test.group("User Settings: show", (group) => {
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
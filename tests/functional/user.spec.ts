import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";
import UserFactory from "Database/factories/UserFactory";

test.group("User Settings: show", (group) => {
    group.each.setup(async () => {
        await Database.beginGlobalTransaction();
        return () => Database.rollbackGlobalTransaction();
    });

    test("show existing user account details", async ({ client }) => {
        const user = await UserFactory
            .merge({ firstName: "Johnson" })
            .with("emailVerificationToken", 1, (token) => token.apply("verified"))
            .create();

        const response = await client
            .get("/api/v1/user")
            .loginAs(user);

        response.assertStatus(200);
    })

    test("updating existing user account details passes", async ({ client }) => {
        const user = await UserFactory
            .merge({ firstName: "Johnson" })
            .with("emailVerificationToken", 1, (token) => token.apply("verified"))
            .create();

        const payload = {
            firstName: "Augustine",
            isMentor: true
        };

        const response = await client
            .put(`/api/v1/user`)
            .json(payload)
            .loginAs(user);

        response.assertStatus(200);
        response.assertBodyContains({
            first_name: "Augustine",
            is_mentor: true
        });
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
    })
});
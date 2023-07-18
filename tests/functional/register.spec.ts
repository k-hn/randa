import { test } from '@japa/runner';
import Database from "@ioc:Adonis/Lucid/Database";

test.group('Register', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction();
  });

  test("register passes for valid payload", async ({ client }) => {
    const payload = {
      firstName: "Kofi",
      lastName: "Hagan",
      email: "me@mail.com",
      password: "somePassword",
      password_confirmation: "somePassword"
    };

    const response = await client
      .post("/api/v1/register")
      .json(payload)

    response.assertStatus(201);
  })
})

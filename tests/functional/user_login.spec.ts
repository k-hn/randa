import Database from '@ioc:Adonis/Lucid/Database';
import { test } from '@japa/runner'
import UserFactory from 'Database/factories/UserFactory';

test.group('User login: login', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("login passes for valid details", async ({ client }) => {
    const user = await UserFactory
      .merge({ password: "somePassword" })
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .create();
    const payload = {
      email: user.email,
      password: "somePassword"
    };

    const response = await client
      .post("/api/v1/login")
      .json(payload)

    response.assertStatus(200);
  });

  test("login fails for invalid details", async ({ client }) => {
    await UserFactory.
      merge({ password: "myPassword" })
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .create();
    const payload = {
      email: "someEmail@mail.com",
      password: "randomPassword"
    };

    const response = await client
      .post("/api/v1/login")
      .json(payload)

    response.assertStatus(400)

  })
})

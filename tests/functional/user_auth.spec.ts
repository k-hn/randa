import Mail from '@ioc:Adonis/Addons/Mail';
import Database from '@ioc:Adonis/Lucid/Database';
import { test } from '@japa/runner'
import UserFactory from 'Database/factories/UserFactory';

test.group('User auth: login', (group) => {
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


test.group('User auth: logout', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("logout for logged in users with bearer tokens works", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .create();

    const response = await client
      .get("/api/v1/logout")
      .loginAs(user)

    console.log(response.body());
    response.assertStatus(204);
  });

  test("logout for non-logged in users with bearer tokens works", async ({ client }) => {
    const response = await client
      .get("/api/v1/logout")

    response.assertStatus(204);
  })
})

test.group('User auth: forgot password', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("forgot password request succeeds for valid email", async ({ assert, client }) => {
    const mailer = Mail.fake();
    const user = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .create();
    const payload = {
      email: user.email
    };

    const response = await client
      .post("/api/v1/forgot-password")
      .json(payload);

    response.assertStatus(204);
    assert.isTrue(mailer.exists((mail) => {
      return mail.subject === "Reset password"
    }));

    Mail.restore();
  });

  test("forgot password request fails for invalid email", async ({ assert, client }) => {
    const mailer = Mail.fake();
    await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .create();

    const response = await client
      .post("/api/v1/forgot-password")
      .json({ email: "random@mail.com" });

    response.assertStatus(404);
    assert.isFalse(mailer.exists((mail) => {
      return mail.subject === "Reset password"
    }));

    Mail.restore();
  });
})
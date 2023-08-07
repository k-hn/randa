import Mail from '@ioc:Adonis/Addons/Mail';
import Database from '@ioc:Adonis/Lucid/Database';
import { test } from '@japa/runner'
import User from 'App/Models/User';
import UserFactory from 'Database/factories/UserFactory';
import { v4 as uuidv4 } from "uuid";

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

test.group('User auth: resend forgot password', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("resend forgot password request succeeds for valid email", async ({ assert, client }) => {
    const mailer = Mail.fake();
    const user = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .with("passwordResetToken")
      .create();
    const payload = {
      email: user.email
    };

    const response = await client
      .post("/api/v1/resend-forgot-password")
      .json(payload);

    console.log(response.body())
    response.assertStatus(204);
    assert.isTrue(mailer.exists((mail) => {
      return mail.subject === "Reset password"
    }));

    Mail.restore();
  });

  test("resend forgot password request fails for invalid email", async ({ assert, client }) => {
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

test.group("User auth: Reset password", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("password reset succeeds for valid token", async ({ assert, client }) => {
    const user = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .with("passwordResetToken")
      .create();
    const resetToken = await user.related("passwordResetToken").query().firstOrFail();
    const payload = {
      password: "newPassword",
      password_confirmation: "newPassword"
    }

    const response = await client
      .post(`/api/v1/reset-password/${resetToken.token}`)
      .json(payload);

    const updatedUser = await User.findOrFail(user.id);

    response.assertStatus(204);
    assert.notEqual(user.password, updatedUser.password);
  });

  test("password reset fails for invalid token", async ({ client }) => {
    await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .with("passwordResetToken")
      .create();
    const invalidToken = uuidv4();
    const payload = {
      password: "newPassword",
      password_confirmation: "newPassword"
    }

    const response = await client
      .post(`/api/v1/${invalidToken}`)
      .json(payload);

    response.assertStatus(404);
  });
})

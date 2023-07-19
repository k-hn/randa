import Database from '@ioc:Adonis/Lucid/Database';
import { test } from '@japa/runner'
import UserFactory from 'Database/factories/UserFactory';
import { v4 as uuidv4 } from "uuid";

test.group('User verify email: email verification', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction();
  });

  test("email verification passes for valid tokens", async ({ client }) => {
    const user = await UserFactory.with("emailVerificationToken").create();
    const token = await user.related("emailVerificationToken").query().firstOrFail();

    const response = await client
      .get(`/api/v1/verify/${token.token}`);

    response.assertStatus(204);
  });

  test("email verification fails for invalid token", async ({ client }) => {
    await UserFactory.with("emailVerificationToken").create();
    const uuid = uuidv4();

    const response = await client
      .get(`/api/v1/verify/${uuid}`);

    response.assertStatus(404);
  });
});

test.group("User verify email: Resend verification email", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("resend email verification works for existing user", async ({ client }) => {
    const user = await UserFactory.with("emailVerificationToken").create();

    const response = await client
      .post("/api/v1/resend-verification")
      .json({ email: user.email })

    response.assertStatus(204);
  });

  test("resend verification email fails for non-existent user", async ({ client }) => {
    await UserFactory.with("emailVerificationToken").create();
    const email = "randomPerson@mail.com";

    const response = await client
      .post("/api/v1/resend-verification")
      .json({ email });

    response.assertStatus(404);
  })
})

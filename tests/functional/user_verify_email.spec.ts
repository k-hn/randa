import Database from '@ioc:Adonis/Lucid/Database';
import { test } from '@japa/runner'
import UserFactory from 'Database/factories/UserFactory';
import { v4 as uuidv4 } from "uuid";

test.group('User Email Verification', (group) => {
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
})

import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import MentorFactory from 'Database/factories/MentorFactory';
import UserFactory from 'Database/factories/UserFactory';

test.group('Mentor: index', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction();
  });

  test("user request for all mentors passes", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .create();

    await MentorFactory
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .createMany(10);

    const response = await client
      .get("/api/v1/mentors")
      .loginAs(user);

    response.assertStatus(200);
  });

  test("guest request for all mentors fails", async ({ client }) => {
    await MentorFactory
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .createMany(10);

    const response = await client
      .get("/api/v1/mentors")

    response.assertStatus(401);
  });
});


test.group('Mentor: show', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction();
  });

  test("user request to show mentor passes", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .create();

    const mentors = await MentorFactory
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .createMany(10);

    const mentor = mentors[0];

    const response = await client
      .get(`/api/v1/mentors/${mentor.id}`)
      .loginAs(user);

    response.assertStatus(200);
  });

  test("guest request to show mentor fails", async ({ client }) => {
    const mentors = await MentorFactory
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .createMany(10);

    const mentor = mentors[0];

    const response = await client
      .get(`/api/v1/mentors/${mentor.id}`)

    response.assertStatus(401);
  });
});

import { test } from '@japa/runner';
import Database from "@ioc:Adonis/Lucid/Database";
import Mail from '@ioc:Adonis/Addons/Mail';

test.group('User Register: registration', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction();
  });

  test("registration passes for valid payload, verification sent", async ({ assert, client }) => {
    const mailer = Mail.fake();
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
    assert.isTrue(mailer.exists((mail) => {
      return mail.subject === "Verify your email with us"
    }));

    Mail.restore();
  });

  test("registration fails when first name is of length 0", async ({ client }) => {
    const payload = {
      firstName: "",
      lastName: "Hagan",
      email: "me@mail.com",
      password: "somePassword",
      password_confirmation: "somePassword"
    };

    const response = await client
      .post("/api/v1/register")
      .json(payload)

    response.assertStatus(422)
  })

  test("registration fails when last name is of length 0", async ({ client }) => {
    const payload = {
      firstName: "Kofi",
      lastName: "",
      email: "me@mail.com",
      password: "somePassword",
      password_confirmation: "somePassword"
    };

    const response = await client
      .post("/api/v1/register")
      .json(payload)

    response.assertStatus(422)
  });

  test("registration fails when invalid email provided", async ({ client }) => {
    const payload = {
      firstName: "Kofi",
      lastName: "Hagan",
      email: "me.mail.com",
      password: "somePassword",
      password_confirmation: "somePassword"
    };

    const response = await client
      .post("/api/v1/register")
      .json(payload)

    response.assertStatus(422);
  });

  test("email address is normalised during registration", async ({ client }) => {
    const payload = {
      firstName: "Kofi",
      lastName: "Hagan",
      email: "AnotherMail@FasTmail.COM",
      password: "somePassword",
      password_confirmation: "somePassword"
    };

    const response = await client
      .post("/api/v1/register")
      .json(payload)

    response.assertStatus(201);
    response.assertBodyContains({
      email: "anothermail@fastmail.com"
    })
  })

  test("registration fails when password is less than 10 characters long", async ({ client }) => {
    const payload = {
      firstName: "Kofi",
      lastName: "Hagan",
      email: "me@mail.com",
      password: "somePass",
      password_confirmation: "somePass"
    };

    const response = await client
      .post("/api/v1/register")
      .json(payload)

    response.assertStatus(422);
  });

  test("registration fails when password is more than 180 characters long", async ({ client }) => {
    const payload = {
      firstName: "Kofi",
      lastName: "Hagan",
      email: "me@mail.com",
      password: "ckdyrffbalecffbaqaukqazxugfiuggvvurpzxtvbrftpqfzzlnywgfziuwsgypfwsmfplyxdwrbcasqbkupnirvndeoqbwbjnepuqydlauumwaijuhhvdkawahwwiirvapmdkjxxkxkaqvrfplirbojoclctbrwelcamtvogyzyjutevenck",
      password_confirmation: "ckdyrffbalecffbaqaukqazxugfiuggvvurpzxtvbrftpqfzzlnywgfziuwsgypfwsmfplyxdwrbcasqbkupnirvndeoqbwbjnepuqydlauumwaijuhhvdkawahwwiirvapmdkjxxkxkaqvrfplirbojoclctbrwelcamtvogyzyjutevenck"
    };

    const response = await client
      .post("/api/v1/register")
      .json(payload);

    response.assertStatus(422);
  });

  test("registration fails when passwords mismatch", async ({ client }) => {
    const payload = {
      firstName: "Kofi",
      lastName: "Hagan",
      email: "me@mail.com",
      password: "somePassword",
      password_confirmation: "someOtherPassword"
    };

    const response = await client
      .post("/api/v1/register")
      .json(payload)

    response.assertStatus(422);
  });
})

import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import AppointmentFactory from 'Database/factories/AppointmentFactory';
import UserFactory from 'Database/factories/UserFactory';
import { DateTime } from 'luxon';

test.group('Appointments: create', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("creating appointment passes", async ({ client }) => {
    const mentorUser = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .with("mentor", 1)
      .create();

    const menteeUser = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .create();

    await mentorUser.load("mentor");
    const mentorId = mentorUser.mentor.id;
    const payload = {
      mentorId: mentorId,
      startAt: DateTime.now(),
      endAt: DateTime.now().plus({ minutes: 30 })
    }

    const response = await client
      .post("/api/v1/appointments")
      .json(payload)
      .loginAs(menteeUser);

    response.assertStatus(201);
  });

  test("creating overlapping appointment fails", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .create();

    const now = DateTime.now();

    const appointments = await AppointmentFactory
      .merge([{
        startAt: now,
        endAt: now.plus({ minutes: 25 })
      }])
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
      .createMany(5)

    const appointment = appointments[0];
    await appointment.load((loader) => {
      loader.load("mentor").load("user");
    });

    const appointmentMentor = appointment.mentor
    const appointmentStartAt = appointment.startAt;

    const payload = {
      mentorId: appointmentMentor.id,
      startAt: appointmentStartAt.plus({ minutes: 5 }),
      endAt: now.plus({ minutes: 30 })
    }

    const response = await client
      .post("/api/v1/appointments")
      .json(payload)
      .loginAs(user)

    response.assertStatus(400);
  });
})


test.group('Appointments: show', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("user retrieving their appointment passes", async ({ client }) => {
    const appointments = await AppointmentFactory
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
      .createMany(3);

    const appointment = appointments[0];
    await appointment.load("user")
    const appointmentUser = appointment.user;

    const response = await client
      .get(`/api/v1/appointments/${appointment.id}`)
      .loginAs(appointmentUser);

    console.log(response.body())
    response.assertStatus(200);

  })
});

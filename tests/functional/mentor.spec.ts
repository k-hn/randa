import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import AppointmentFactory from 'Database/factories/AppointmentFactory';
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

    const nubmerOfMentors = 10;
    await MentorFactory
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .createMany(nubmerOfMentors);

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

test.group('Mentor Appointment: index', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test("mentor request for all appointments passes", async ({ client }) => {
    const mentor = await MentorFactory
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .create();

    await AppointmentFactory
      .merge({ mentorId: mentor.id })
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .createMany(5);


    // load mentor user relationship
    const mentorUser = await mentor.related("user").query().firstOrFail();

    const response = await client
      .get("/api/v1/mentors/appointments")
      .loginAs(mentorUser);

    response.assertStatus(200);
  });

  test("guest request for all appointments fails", async ({ client }) => {
    // Create mentor
    const mentor = await MentorFactory
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .create();

    // Create mentor appointments 
    await AppointmentFactory
      .merge({ mentorId: mentor.id })
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .createMany(5);

    const response = await client
      .get("/api/v1/mentors/appointments")

    response.assertStatus(401);
  })
})

test.group('Mentor Appointment: show', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  });

  test("mentor request to show appointment passes", async ({ client }) => {
    const appointment = await AppointmentFactory
      .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .create();

    const mentor = await appointment
      .related("mentor")
      .query()
      .preload("user")
      .firstOrFail();

    const response = await client
      .get(`/api/v1/mentors/appointments/${appointment.id}`)
      .loginAs(mentor.user)

    response.assertStatus(200);
  });

  test("guest request to show appointment fails", async ({ client }) => {
    const appointment = await AppointmentFactory
      .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .create();

    const response = await client
      .get(`/api/v1/mentors/appointments/${appointment.id}`)

    response.assertStatus(401);
  })
})

test.group('Mentor Appointment: update', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  });

  test("mentor updating their appointment passes", async ({ client }) => {
    const appointment = await AppointmentFactory
      .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .create();

    const mentor = await appointment
      .related("mentor")
      .query()
      .preload("user")
      .firstOrFail();

    const appointmentOldStartAt = appointment.startAt;
    const appointmentOldEndAt = appointment.endAt;
    const payload = {
      startAt: appointmentOldStartAt.plus({ minutes: 5 }),
      endAt: appointmentOldEndAt.plus({ minutes: 5 })
    };

    const response = await client
      .put(`/api/v1/mentors/appointments/${appointment.id}`)
      .json(payload)
      .loginAs(mentor.user)

    response.assertStatus(200);
  })

  test("guest updating appointment fails", async ({ client }) => {
    const appointment = await AppointmentFactory
      .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .create();

    const appointmentOldStartAt = appointment.startAt;
    const appointmentOldEndAt = appointment.endAt;
    const payload = {
      startAt: appointmentOldStartAt.plus({ minutes: 5 }),
      endAt: appointmentOldEndAt.plus({ minutes: 5 })
    };

    const response = await client
      .put(`/api/v1/mentors/appointments/${appointment.id}`)
      .json(payload)

    response.assertStatus(401);
  });

  test("3rd party mentor updating appointment fails", async ({ client }) => {
    const appointment = await AppointmentFactory
      .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .create();

    const mentor = await MentorFactory
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .create();

    const mentorUser = await mentor.related("user").query().firstOrFail();

    const appointmentOldStartAt = appointment.startAt;
    const appointmentOldEndAt = appointment.endAt;
    const payload = {
      startAt: appointmentOldStartAt.plus({ minutes: 5 }),
      endAt: appointmentOldEndAt.plus({ minutes: 5 })
    };

    const response = await client
      .put(`/api/v1/mentors/appointments/${appointment.id}`)
      .json(payload)
      .loginAs(mentorUser)

    response.assertStatus(404);
  })
})

test.group('Mentor Appointment: delete', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  });

  test("mentor deleting their appointment passes", async ({ client }) => {
    const appointment = await AppointmentFactory
      .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .create();

    const mentor = await appointment.related("mentor").query().preload("user").firstOrFail();

    const response = await client
      .delete(`/api/v1/mentors/appointments/${appointment.id}`)
      .loginAs(mentor.user);

    response.assertStatus(204);
  });

  test("guest deleting appointment fails", async ({ client }) => {
    const appointment = await AppointmentFactory
      .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .create();

    const response = await client
      .delete(`/api/v1/mentors/appointments/${appointment.id}`)

    response.assertStatus(401);
  });

  test("3rd party mentor deleting appointment fails", async ({ client }) => {
    const appointment = await AppointmentFactory
      .with("mentor", 1, (mentor) => mentor.with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified"))))
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .create();

    const mentor = await MentorFactory
      .with("user", 1, (user) => user.with("emailVerificationToken", 1, (token) => token.apply("verified")))
      .create();
    const mentorUser = await mentor.related("user").query().firstOrFail();

    const response = await client
      .delete(`/api/v1/mentors/appointments/${appointment.id}`)
      .loginAs(mentorUser);

    response.assertStatus(404);
  });
})


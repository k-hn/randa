import Appointment from 'App/Models/Appointment'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { DateTime } from 'luxon';
import UserFactory from './UserFactory';
import MentorFactory from './MentorFactory';

export default Factory.define(Appointment, ({ faker }) => {
  const startDate = DateTime.fromJSDate(faker.date.anytime());
  const minDuration = 10;
  const maxDuration = 180;
  const duration = Math.random() * (maxDuration - minDuration) + minDuration;
  const endDate = startDate.plus({ minutes: duration });

  return {
    startAt: startDate,
    endAt: endDate
  };
})
  .relation("user", () => UserFactory)
  .relation("mentor", () => MentorFactory)
  .build()

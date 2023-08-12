import Mentor from 'App/Models/Mentor'
import Factory from '@ioc:Adonis/Lucid/Factory'
import AppointmentFactory from './AppointmentFactory'
import UserFactory from './UserFactory'

export default Factory.define(Mentor, () => {
  return {}
})
  .relation("appointments", () => AppointmentFactory)
  .relation("user", () => UserFactory)
  .build()

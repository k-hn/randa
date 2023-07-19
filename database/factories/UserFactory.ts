import User from 'App/Models/User'
import Factory from '@ioc:Adonis/Lucid/Factory'
import EmailVerificationTokenFactory from './EmailVerificationTokenFactory'

export default Factory.define(User, ({ faker }) => {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  }
})
  .relation("emailVerificationToken", () => EmailVerificationTokenFactory)
  .build()

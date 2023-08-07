import PasswordResetToken from 'App/Models/PasswordResetToken'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { DateTime } from 'luxon'

export default Factory.define(PasswordResetToken, ({ faker }) => {
  return {
    token: faker.string.uuid(),
    expiresAt: DateTime.now().plus({ minutes: 15 })
  }
}).state("expired", (resetToken) => {
  resetToken.createdAt = DateTime.now().minus({ minutes: 16 })
  resetToken.expiresAt = DateTime.now().minus({ minutes: 1 })
})
  .build()

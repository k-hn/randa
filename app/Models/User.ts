import { DateTime } from 'luxon'
import { BaseModel, HasOne, beforeSave, column, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Hash from "@ioc:Adonis/Core/Hash"
import PasswordResetToken from './PasswordResetToken'
import EmailVerificationToken from './EmailVerificationToken'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public firstName: string

  @column()
  public lastName: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string;

  @column()
  public isMentor: boolean

  @column()
  public technologyTags: object

  @column()
  public industryTags: object

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }

  // Relationships
  @hasOne(() => EmailVerificationToken)
  public emailVerificationToken: HasOne<typeof EmailVerificationToken>

  @hasOne(() => PasswordResetToken)
  public passwordResetToken: HasOne<typeof PasswordResetToken>

}

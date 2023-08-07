import { rules, schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserValidator {
  constructor(protected ctx: HttpContextContract) { }

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    firstName: schema.string.optional([
      rules.trim(),
      rules.escape(),
      rules.minLength(1),
      rules.maxLength(255)
    ]),
    lastName: schema.string.optional([
      rules.trim(),
      rules.escape(),
      rules.minLength(1),
      rules.maxLength(255)
    ]),
    email: schema.string.optional([
      rules.trim(),
      rules.email(),
      rules.unique({ table: "users", column: "email", caseInsensitive: true }),
      rules.normalizeEmail({
        allLowercase: true,
      }),
    ]),
    password: schema.string.optional([
      rules.confirmed(),
      rules.minLength(10),
      rules.maxLength(180),
    ]),
    isMentor: schema.boolean.optional(),
    technologyTags: schema.array.optional().members(schema.string()),
    industryTags: schema.array.optional().members(schema.string()),
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {}
}

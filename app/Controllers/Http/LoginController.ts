import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LoginValidator from 'App/Validators/LoginValidator'

export default class LoginController {
    public async index({ auth, request, response }: HttpContextContract) {
        const { email, password } = await request.validate(LoginValidator);

        const token = await auth.use("api")
            .attempt(email, password, {
                expiresIn: "1 days"
            })

        return response.ok(token.toJSON())
    }
}

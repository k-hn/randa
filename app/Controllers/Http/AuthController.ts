import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LoginValidator from 'App/Validators/LoginValidator'

export default class AuthController {
    public async login({ auth, request, response }: HttpContextContract) {
        const { email, password } = await request.validate(LoginValidator);

        const token = await auth.use("api")
            .attempt(email, password, {
                expiresIn: "1 days"
            })

        return response.ok(token.toJSON())
    }

    public async logout({ auth, response }: HttpContextContract) {
        await auth.use("api").revoke();

        return response.noContent();
    }
}

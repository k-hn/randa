import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ForgotPassword from 'App/Mailers/ForgotPassword';
import PasswordResetToken from 'App/Models/PasswordResetToken';
import User from 'App/Models/User';
import ForgotPasswordValidator from 'App/Validators/ForgotPasswordValidator';
import LoginValidator from 'App/Validators/LoginValidator'
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from "uuid";

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

    public async forgotPassword({ request, response }: HttpContextContract) {
        const { email } = await request.validate(ForgotPasswordValidator);
        const user = await User.findByOrFail("email", email);
        const payload = {
            token: uuidv4(),
            expiresAt: DateTime.now().plus({ minutes: 15 })
        }
        // Generate password reset token
        await user.related("passwordResetToken")
            .updateOrCreate({}, payload);

        // Send password reset email
        await new ForgotPassword(user).sendLater()

        response.noContent();
    }

    public async resendForgotPassword({ request, response }: HttpContextContract) {
        const { email } = await request.validate(ForgotPasswordValidator);
        const user = await User.findByOrFail("email", email);

        // Resend password reset mail
        await new ForgotPassword(user).sendLater();

        response.noContent();
    }
}

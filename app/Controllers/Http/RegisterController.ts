import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User';
import RegisterValidator from 'App/Validators/RegisterValidator'
import Database from "@ioc:Adonis/Lucid/Database"
import { v4 as uuidv4 } from "uuid";
import VerifyEmail from 'App/Mailers/VerifyEmail';

export default class RegisterController {
    public async index({ request, response }: HttpContextContract) {
        const payload = await request.validate(RegisterValidator);

        const user = await Database.transaction(async (trx) => {
            // Create user record
            const user = await User.create(payload, { client: trx })

            // Create email verification token
            await user.related("emailVerificationToken").create({
                token: uuidv4()
            }, { client: trx });

            return user;
        });

        await new VerifyEmail(user).sendLater();

        response.created(user);
    }
}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User';
import UserRegistrationValidator from 'App/Validators/UserRegistrationValidator'
import Database from "@ioc:Adonis/Lucid/Database"
import { v4 as uuidv4 } from "uuid";
import VerifyEmail from 'App/Mailers/VerifyEmail';
import EmailVerificationToken from 'App/Models/EmailVerificationToken';
import { DateTime } from 'luxon';
import ResendVerificationValidator from 'App/Validators/ResendVerificationValidator';


export default class RegisterController {
    public async create({ request, response }: HttpContextContract) {
        const payload = await request.validate(UserRegistrationValidator);
        const isMentor = "isMentor" in payload ? payload.isMentor : false;
        delete payload.isMentor;

        const user = await Database.transaction(async (trx) => {
            // Create user record
            const user = await User.create(payload, { client: trx })

            // Create mentor record
            if (isMentor) {
                await user.related("mentor").create({}, { client: trx });
            }

            // Create email verification token
            await user.related("emailVerificationToken").create({
                token: uuidv4()
            }, { client: trx });

            return user;
        });

        await new VerifyEmail(user).sendLater();

        response.created(user);
    }

    public async verify({ request, response }: HttpContextContract) {
        const token = request.param("token");
        const verficationToken = await EmailVerificationToken.findByOrFail("token", token);

        if (verficationToken.isVerified && verficationToken.verifiedAt !== null) {
            return response.noContent()
        }

        // verify user
        await verficationToken.merge({
            isVerified: true,
            verifiedAt: DateTime.now()
        }).save();

        response.noContent();
    }

    public async resendVerification({ request, response }: HttpContextContract) {
        const { email } = await request.validate(ResendVerificationValidator);
        const user = await User.findByOrFail("email", email);

        await new VerifyEmail(user).sendLater();

        response.noContent();
    }
}

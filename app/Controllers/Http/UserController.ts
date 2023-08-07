import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserSettingsValidator from 'App/Validators/UserValidator';

export default class UserController {
    public async show({ auth, response }: HttpContextContract) {
        const user = auth.user;

        return response.ok(user)
    }

    public async update({ auth, request }: HttpContextContract) {
        const user = auth.user;
        const payload = await request.validate(UserSettingsValidator);
        const updatedUser = user?.merge(payload)

        return (updatedUser);
    }

    public async destroy({ auth, response }: HttpContextContract) {
        const user = auth.user;

        await user?.delete();
        response.noContent();
    }


}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AppointmentService from 'App/Services/AppointmentService';
import AppointmentValidator from 'App/Validators/AppointmentValidator';

export default class AppointmentController {
    public async create({ auth, request, response }: HttpContextContract) {
        const user = auth.user!;
        const payload = await request.validate(AppointmentValidator);

        // Create appointment or fail
        const [isSuccess, result] = await AppointmentService.createAppointment(user, payload);
        if (isSuccess) {
            return response.created(result);
        } else {
            return response.badRequest({ conflictingAppointment: result })
        }
    }
}

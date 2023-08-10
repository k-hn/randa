import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mentor from 'App/Models/Mentor';
import AppointmentValidator from 'App/Validators/AppointmentValidator';

export default class AppointmentController {
    public async create({ auth, request, response }: HttpContextContract) {
        const user = auth.user;
        const payload = await request.validate(AppointmentValidator);

        // check if there appointment overlaps with mentor's existing ones
        const mentor = await Mentor.findOrFail(payload.mentorId);
        const overlappingAppointments = await mentor.related("appointments").query()
            .whereBetween("startAt", [payload.startAt.toString(), payload.endAt.toString()])
            .orWhereBetween("endAt", [payload.startAt.toString(), payload.endAt.toString()])

        if (overlappingAppointments.length > 0) {
            return response.badRequest({
                overlappingAppointments
            });
        }

        const appointment = await user?.related("appointments").create(payload)

        return response.created(appointment);
    }
}

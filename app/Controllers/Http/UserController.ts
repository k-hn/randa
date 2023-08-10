import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import AppointmentService from 'App/Services/AppointmentService';
import AppointmentValidator from 'App/Validators/AppointmentValidator';
import UserValidator from 'App/Validators/UserValidator';

export default class UserController {
    public async show({ auth, response }: HttpContextContract) {
        const user = auth.user;

        return response.ok(user)
    }

    public async update({ auth, request }: HttpContextContract) {
        const user = auth.user;
        const payload = await request.validate(UserValidator);
        const isMentor = payload.isMentor ? payload.isMentor : false;
        delete payload.isMentor;

        const updatedUser = await Database.transaction(async (trx) => {
            const updatedUser = user?.merge(payload);

            if (isMentor) {
                await updatedUser?.related("mentor").updateOrCreate({}, {}, { client: trx })
            }

            return updatedUser;
        });

        return (updatedUser);
    }

    public async destroy({ auth, response }: HttpContextContract) {
        const user = auth.user;

        await user?.delete();
        response.noContent();
    }

    public async getAppointments({ auth, response }: HttpContextContract) {
        const user = auth.user!;

        const appointments = await AppointmentService.getUserAppointments(user);
        return response.ok(appointments);
    }

    public async getAppointment({ auth, request, response }: HttpContextContract) {
        const user = auth.user!;
        const appointmentID = request.param("id");
        const appointment = await AppointmentService.getUserAppointment(user, appointmentID);

        return response.ok(appointment)
    }

    public async updateAppointment({ auth, request, response }: HttpContextContract) {
        const user = auth.user!;
        const appointmentID = request.param("id");
        const updatePayload = await request.validate(AppointmentValidator);
        const updatedAppointment = await AppointmentService.updateUserAppointment(user, appointmentID, updatePayload);

        return response.ok(updatedAppointment);
    }
}

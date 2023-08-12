import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AppointmentService from 'App/Services/AppointmentService';
import MentorService from 'App/Services/MentorService'
import UpdateAppointmentValidator from 'App/Validators/UpdateAppointmentValidator';

export default class MentorController {
    public async index({ request, response }: HttpContextContract) {
        const page = request.input("page", 1);
        const limit = request.input("limit", 10);

        const mentors = await MentorService.getAllMentors(page, limit);

        return response.ok(mentors.toJSON());
    }

    public async show({ request, response }: HttpContextContract) {
        const mentorID = request.param("id");
        const mentor = await MentorService.getMentor(mentorID);

        return response.ok(mentor);
    }

    public async getAppointments({ auth, request, response }: HttpContextContract) {
        const user = auth.user!;
        const page = request.input("page", 1);
        const limit = request.input("limit", 10);

        const appointments = await AppointmentService.getMentorAppointments(user, page, limit);

        return response.ok(appointments);
    }

    public async getAppointment({ auth, request, response }: HttpContextContract) {
        const user = auth.user!;
        const appointmentID = request.param("id");

        const appointment = await AppointmentService.getMentorAppointment(user, appointmentID)

        return response.ok(appointment)
    }

    public async updateAppointment({ auth, request, response }: HttpContextContract) {
        const user = auth.user!;
        const appointmentID = request.param("id");
        const updatePayload = await request.validate(UpdateAppointmentValidator);

        const result = await AppointmentService.updateMentorAppointment(user, appointmentID, updatePayload);

        return response.ok(result);
    }

    public async deleteAppointment({ auth, request, response }: HttpContextContract) {
        const user = auth.user!;
        const appointmentID = request.param("id");


        const isDeleted = await AppointmentService.deleteMentorAppointment(user, appointmentID);

        if (!isDeleted) {
            return response.badRequest();
        }

        return response.noContent();
    }




}

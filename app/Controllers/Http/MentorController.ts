import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MentorService from 'App/Services/MentorService'

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


}

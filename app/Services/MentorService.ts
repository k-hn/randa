import Mentor from "App/Models/Mentor";


export default class MentorService {

    public static async getAllMentors(page: number, limit: number) {
        const mentors = await Mentor.query().paginate(page, limit);
        return mentors;
    }

    public static async getMentor(id: number): Promise<Mentor> {
        const mentor = await Mentor.findOrFail(id);

        return mentor;
    }
}
import Database from "@ioc:Adonis/Lucid/Database";
import Mentor from "App/Models/Mentor";


export default class MentorService {

    public static async getAllMentors(page: number, limit: number) {
        const mentors = await Database.from("mentors").paginate(page, limit);

        return mentors;
    }

    public static async getMentor(id: number): Promise<Mentor> {
        const mentor = await Mentor.findOrFail(id);

        return mentor;
    }
}
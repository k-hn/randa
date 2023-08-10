import Mentor from "App/Models/Mentor";
import User from "App/Models/User";
import { DateTime } from "luxon";

type Appointment = {
    mentorId: number,
    startAt: DateTime,
    endAt: DateTime
};

type AppointmentCreationSuccess = [boolean, Appointment]
type AppointmentCreationFailure = [boolean, Appointment[]]
type AppointmentCreationContract = AppointmentCreationSuccess | AppointmentCreationFailure;



export default class AppointmentService {
    public static async createAppointment(user: User, payload: Appointment): Promise<AppointmentCreationContract> {
        const mentor = await Mentor.findOrFail(payload.mentorId);
        const conflictingAppointments = await this.getConflictingMentorAppointments(mentor, payload.startAt, payload.endAt);

        if (conflictingAppointments.length > 0) {
            return [false, conflictingAppointments];
        } else {
            const appointment = await user.related("appointments").create(payload)
            return [true, appointment];
        }
    }

    static async getConflictingMentorAppointments(mentor: Mentor, startAt: DateTime, endAt: DateTime): Promise<Appointment[]> {
        const conflictingAppointments = await mentor.related("appointments").query()
            .whereBetween("startAt", [startAt.toString(), startAt.toString()])
            .orWhereBetween("endAt", [startAt.toString(), endAt.toString()])

        return conflictingAppointments;

    }
}
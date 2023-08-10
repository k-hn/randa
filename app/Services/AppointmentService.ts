import Appointment from "App/Models/Appointment";
import Mentor from "App/Models/Mentor";
import User from "App/Models/User";
import { DateTime } from "luxon";

type AppointmentPayload = {
    mentorId: number,
    startAt: DateTime,
    endAt: DateTime
};

type AppointmentCreationSuccess = [boolean, Appointment]
type AppointmentCreationFailure = [boolean, Appointment[]]
type AppointmentCreationContract = AppointmentCreationSuccess | AppointmentCreationFailure;

type AppointmentUpdatePayload = {
    startAt: DateTime,
    endAt: DateTime
}
export default class AppointmentService {
    public static async createAppointment(user: User, payload: AppointmentPayload): Promise<AppointmentCreationContract> {
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

    public static async getUserAppointment(user: User, id: number): Promise<Appointment> {
        const appointment = await user.related("appointments")
            .query()
            .where("id", id)
            .firstOrFail();

        return appointment;
    }

    public static async getUserAppointments(user: User): Promise<Appointment[]> {
        const appointments = await user.related("appointments").query().paginate(1);
        return appointments;
    }

    public static async updateUserAppointment(
        user: User,
        id: number, payload: AppointmentUpdatePayload
    ): Promise<Appointment> {
        const appointment = await user.related("appointments")
            .query()
            .where("id", id)
            .firstOrFail();

        const updatedAppointment = await appointment.merge(payload).save();
        return updatedAppointment;
    }

    public static async deleteUserAppointment(user: User, id: number): Promise<boolean> {
        const appointment = await user.related("appointments")
            .query()
            .where("id", id)
            .firstOrFail()

        await appointment.delete()

        return appointment.$isDeleted;
    }
}
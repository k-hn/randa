import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User';
import Env from "@ioc:Adonis/Core/Env"

export default class VerifyEmail extends BaseMailer {
  /**
   * WANT TO USE A DIFFERENT MAILER?
   *
   * Uncomment the following line of code to use a different
   * mailer and chain the ".options" method to pass custom
   * options to the send method
   */
  // public mailer = this.mail.use()

  /**
   * The prepare method is invoked automatically when you run
   * "VerifyEmail.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  constructor(private user: User) {
    super();
  }

  public async prepare(message: MessageContract) {
    const verificationToken = await this.user
      .related("emailVerificationToken")
      .query()
      .firstOrFail();

    const frontendUrl = Env.get("FE_URL");
    const userEmailDetails = {
      firstName: this.user.firstName,
      url: `${frontendUrl}/verify/${verificationToken.token}`
    }

    message
      .from("no-reply@randa.com", "Randa")
      .to(this.user.email)
      .subject("Verify your email with us")
      .htmlView("emails/verify_email", { userDetails: userEmailDetails })
  }
}

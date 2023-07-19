import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User';
import Env from "@ioc:Adonis/Core/Env"

export default class ForgotPassword extends BaseMailer {
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
   * "ForgotPassword.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  constructor(private user: User) {
    super();
  }

  public async prepare(message: MessageContract) {
    const resetToken = await this.user
      .related("passwordResetToken")
      .query()
      .firstOrFail();

    const frontendUrl = Env.get("FE_URL");
    const userEmailDetails = {
      firstName: this.user.firstName,
      url: `${frontendUrl}/reset-password/${resetToken}`
    }

    message
      .from("no-reply@randa.com", "Randa")
      .to(this.user.email)
      .subject("Reset password")
      .htmlView("emails/forgot_password", { userDetails: userEmailDetails });
  }
}

import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class extends BaseSeeder {

  public async run() {
    // Write your database queries inside the run method
    await User.create({
      firstName: "Hilary",
      lastName: "Kodji",
      email: "hilarykodji@gmail.com",
      password: "SuperSecretPassword"
    })
  }
}

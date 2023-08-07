import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'appointments'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer("user_id").notNullable().unsigned().references("id").inTable("users").onDelete("CASCADE");
      table.integer("mentor_id").notNullable().unsigned().references("id").inTable("users").onDelete("CASCADE");
      table.timestamp("start_at", { useTz: true }).notNullable()
      table.timestamp("end_at", { useTz: true }).notNullable()
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

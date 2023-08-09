import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string("first_name").notNullable()
      table.string("last_name").notNullable()
      table.string("email", 255).notNullable().unique().index()
      table.string("password", 180).notNullable()
      table.jsonb("technology_tags").notNullable().defaultTo([]);
      table.jsonb("industry_tags").notNullable().defaultTo([]);

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

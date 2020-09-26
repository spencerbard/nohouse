exports.up = async (knex) => {
  await knex.schema.createTable("sports", (table) => {
    table.text("key").primary();
    table.boolean("active").notNullable();
    table.text("group").notNullable();
    table.text("details").notNullable();
    table.text("title").notNullable();
    table.boolean("has_outrights").notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.raw("NOW()"));
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("sports");
};

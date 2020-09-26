exports.up = async function (knex) {
  await knex.schema.createTable("users", (table) => {
    table.uuid("uid").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.text("name").notNullable();
    table.text("email").notNullable();
    table.text("password").notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.raw("NOW()"));
    table.timestamp("updated_at").notNullable().defaultTo(knex.raw("NOW()"));
    table.timestamp("deleted_at");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable("users");
};

exports.up = async (knex) => {
  await knex.raw(`
    CREATE TYPE line_market_side
    AS ENUM (
      'spread_home',
      'spread_away',
      'total_over',
      'total_under',
      'h2h_home',
      'h2h_away'
    );
  `);
  await knex.schema.createTable("user_lines", (table) => {
    table.uuid("uid").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("line_uid").notNullable().references("lines_history.uid");
    table.integer("amount").notNullable();
    table.uuid("creator_uid").notNullable().references("users.uid");
    table.timestamp("created_at").notNullable().defaultTo(knex.raw("NOW()"));
    table
      .enum("creator_side", null, {
        useNative: true,
        existingType: true,
        enumName: "line_market_side",
      })
      .notNullable();
    table.uuid("acceptor_uid").references("users.uid");
    table.timestamp("accepted_at");
    table.enum("acceptor_side", null, {
      useNative: true,
      existingType: true,
      enumName: "line_market_side",
    });
    table.timestamp("deleted_at");
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("user_lines");
  await knex.raw(`DROP TYPE line_market_side`);
};

exports.up = async (knex) => {
  await knex.schema.createTable("lines_history", (table) => {
    table.uuid("uid").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.text("event_key").notNullable();
    table.text("sport_key").notNullable().references("sports.key");
    table.text("home_team").notNullable();
    table.text("away_team").notNullable();
    table.timestamp("event_start_time").notNullable();
    table.float("h2h_home");
    table.float("h2h_away");
    table.float("h2h_draw");
    table.float("spread_home");
    table.float("spread_away");
    table.float("spread_home_vig");
    table.float("spread_away_vig");
    table.float("total");
    table.float("total_over_vig");
    table.float("total_under_vig");
    table.uuid("load_uid").notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.raw("NOW()"));
    table.unique(["event_key", "load_uid"]);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("lines_history");
};

exports.up = async (knex) => {
  await knex.schema.createTable("odds_history", (table) => {
    table.uuid("uid").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.text("event_key").notNullable();
    table.text("sport_key").notNullable().references("sports.key");
    table.text("sport_nice").notNullable();
    table.integer("commence_time").notNullable();
    table.text("home_team").notNullable();
    table.text("away_team").notNullable();
    table.jsonb("teams").notNullable();
    table.jsonb("sites").notNullable();
    table.integer("sites_count").notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.raw("NOW()"));
    table.uuid("load_uid").notNullable();
    table.enum("market", ["h2h", "spreads", "totals"]).notNullable();
    table.unique(["event_key", "load_uid", "market"]);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("odds_history");
};

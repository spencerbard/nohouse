exports.up = async (knex) => {
  await knex.raw(`
    CREATE MATERIALIZED VIEW odds_current
    AS
    SELECT o.*
    FROM odds_history o
    JOIN (
      SELECT
        event_key,
        market,
        max(created_at) created_at
      FROM odds_history
      GROUP BY 1,2
    ) max_date
    USING(event_key, market, created_at);
  `);
};

exports.down = async (knex) => {
  await knex.raw(`DROP MATERIALIZED VIEW odds_current`);
};

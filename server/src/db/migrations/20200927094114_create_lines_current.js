exports.up = async (knex) => {
  await knex.raw(`
    CREATE VIEW lines_current
    AS
    SELECT lh.* FROM lines_history lh
    JOIN (
      SELECT lines_history.uid FROM lines_history
      JOIN odds_current
      USING(event_key, load_uid)
      GROUP BY 1
    ) lh_temp
    USING (uid);
  `);
};

exports.down = async (knex) => {
  await knex.raw(`
    DROP VIEW lines_current
  `);
};

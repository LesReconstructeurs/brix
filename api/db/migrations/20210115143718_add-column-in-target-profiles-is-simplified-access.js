const TABLE_NAME = 'target-profiles';
const COLUMN_NAME = 'isSimplifiedAccess';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(COLUMN_NAME).defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

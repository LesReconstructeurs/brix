const TABLE_NAME = 'users';
const COLUMN_NAME = 'lastPixOrgaTermsOfServiceValidatedAt';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dateTime(COLUMN_NAME);
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

const TABLE_NAME = 'memberships';

exports.up = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer('organizationId').unsigned().alter();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.bigInteger('organizationId').alter();
  });
};

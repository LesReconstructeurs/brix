exports.up = function (knex) {
  return knex.raw(
    "ALTER TABLE \"pix-admin-roles\" ADD CONSTRAINT \"pix-admin-roles_role_check\" CHECK ( \"role\" IN ('SUPER_ADMIN', 'SUPPORT', 'METIER', 'CERTIF') )"
  );
};

exports.down = function (knex) {
  return knex.raw('ALTER TABLE "pix-admin-roles" DROP CONSTRAINT "pix-admin-roles_role_check"');
};

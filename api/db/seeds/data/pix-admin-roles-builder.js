const {
  PIX_SUPER_ADMIN_ID,
  PIX_SUPPORT_ID,
  PIX_METIER_ID,
  PIX_CERTIF_ID,
} = require('./users-builder');
const { ROLES } = require('../../../lib/domain/constants').PIX_ADMIN;

module.exports = function pixAdminRolesBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildPixAdminRole({ userId: PIX_SUPER_ADMIN_ID, role: ROLES.SUPER_ADMIN });
  databaseBuilder.factory.buildPixAdminRole({ userId: PIX_SUPPORT_ID, role: ROLES.SUPPORT });
  databaseBuilder.factory.buildPixAdminRole({ userId: PIX_METIER_ID, role: ROLES.METIER });
  databaseBuilder.factory.buildPixAdminRole({ userId: PIX_CERTIF_ID, role: ROLES.CERTIF });
};

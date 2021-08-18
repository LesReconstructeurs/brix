const _ = require('lodash');
const Bookshelf = require('../bookshelf');
const bookshelfUtils = require('../utils/knex-utils');
const DomainTransaction = require('../DomainTransaction');
const {
  AlreadyExistingEntityError,
  AuthenticationMethodNotFoundError,
} = require('../../domain/errors');
const AuthenticationMethod = require('../../domain/models/AuthenticationMethod');
const BookshelfAuthenticationMethod = require('../orm-models/AuthenticationMethod');

function _toDomainEntity(bookshelfAuthenticationMethod) {
  const attributes = bookshelfAuthenticationMethod.toJSON();
  return new AuthenticationMethod({
    id: attributes.id,
    userId: attributes.userId,
    identityProvider: attributes.identityProvider,
    authenticationComplement: _toAuthenticationComplement(attributes.identityProvider, attributes.authenticationComplement),
    externalIdentifier: (attributes.identityProvider === AuthenticationMethod.identityProviders.GAR || attributes.identityProvider === AuthenticationMethod.identityProviders.POLE_EMPLOI) ? attributes.externalIdentifier : undefined,
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
  });
}

function _toDomain(authenticationMethodDTO) {
  return new AuthenticationMethod({
    ...authenticationMethodDTO,
    externalIdentifier: (authenticationMethodDTO.identityProvider === AuthenticationMethod.identityProviders.GAR || authenticationMethodDTO.identityProvider === AuthenticationMethod.identityProviders.POLE_EMPLOI) ? authenticationMethodDTO.externalIdentifier : undefined,
    authenticationComplement: _toAuthenticationComplement(authenticationMethodDTO.identityProvider, authenticationMethodDTO.authenticationComplement),
  });
}

function _toAuthenticationComplement(identityProvider, bookshelfAuthenticationComplement) {
  if (identityProvider === AuthenticationMethod.identityProviders.PIX) {
    return new AuthenticationMethod.PixAuthenticationComplement(bookshelfAuthenticationComplement);
  }

  if (identityProvider === AuthenticationMethod.identityProviders.POLE_EMPLOI) {
    return new AuthenticationMethod.PoleEmploiAuthenticationComplement(bookshelfAuthenticationComplement);
  }

  return undefined;
}

const COLUMNS = Object.freeze(['id', 'identityProvider', 'authenticationComplement', 'externalIdentifier', 'userId', 'createdAt', 'updatedAt']);

module.exports = {

  async create({
    authenticationMethod,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    try {
      const knexConn = domainTransaction.knexTransaction || Bookshelf.knex;
      const authenticationMethodForDB = _.pick(authenticationMethod, ['identityProvider', 'authenticationComplement', 'externalIdentifier', 'userId']);
      const [authenticationMethodDTO] = await knexConn('authentication-methods').insert(authenticationMethodForDB).returning(COLUMNS);
      return _toDomain(authenticationMethodDTO);
    } catch (err) {
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new AlreadyExistingEntityError(`An authentication method already exists for the user ID ${authenticationMethod.userId} and the externalIdentifier ${authenticationMethod.externalIdentifier}.`);
      }
    }
  },

  async createPasswordThatShouldBeChanged({
    userId,
    hashedPassword,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    try {
      const authenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
        password: hashedPassword,
        shouldChangePassword: true,
      });
      const authenticationMethod = new AuthenticationMethod({
        authenticationComplement,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
        userId,
      });
      const authenticationMethodForDB = _.pick(authenticationMethod, ['identityProvider', 'authenticationComplement', 'externalIdentifier', 'userId']);
      const knexConn = domainTransaction.knexTransaction || Bookshelf.knex;
      const [authenticationMethodDTO] = await knexConn('authentication-methods').insert(authenticationMethodForDB).returning(COLUMNS);
      return _toDomain(authenticationMethodDTO);
    } catch (err) {
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new AlreadyExistingEntityError(`Authentication method PIX already exists for the user ID ${userId}.`);
      }
    }
  },

  async findOneByUserIdAndIdentityProvider({ userId, identityProvider }) {
    const authenticationMethodDTO = await Bookshelf.knex
      .select(COLUMNS)
      .from('authentication-methods')
      .where({ userId, identityProvider })
      .first();

    return authenticationMethodDTO ? _toDomain(authenticationMethodDTO) : null;
  },

  async findOneByExternalIdentifierAndIdentityProvider({ externalIdentifier, identityProvider }) {
    const authenticationMethodDTO = await Bookshelf.knex
      .select(COLUMNS)
      .from('authentication-methods')
      .where({ externalIdentifier, identityProvider })
      .first();

    return authenticationMethodDTO ? _toDomain(authenticationMethodDTO) : null;
  },

  async findByUserId({ userId }) {
    const bookshelfAuthenticationMethods = await BookshelfAuthenticationMethod
      .where({ userId })
      .fetchAll();

    return bookshelfAuthenticationMethods.map((bookshelfAuthenticationMethod) => _toDomainEntity(bookshelfAuthenticationMethod));
  },

  async hasIdentityProviderPIX({ userId }) {
    const authenticationMethodDTO = await Bookshelf.knex
      .select(COLUMNS)
      .from('authentication-methods')
      .where({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      })
      .first();

    return Boolean(authenticationMethodDTO);
  },

  async removeByUserIdAndIdentityProvider({ userId, identityProvider }) {
    return Bookshelf.knex('authentication-methods')
      .where({ userId, identityProvider })
      .del();
  },

  async updateChangedPassword({ userId, hashedPassword }, domainTransaction = DomainTransaction.emptyTransaction()) {
    const authenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
      password: hashedPassword,
      shouldChangePassword: false,
    });

    const knexConn = domainTransaction.knexTransaction || Bookshelf.knex;
    const [authenticationMethodDTO] = await knexConn('authentication-methods')
      .where({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      })
      .update({ authenticationComplement })
      .returning(COLUMNS);

    if (!authenticationMethodDTO) {
      throw new AuthenticationMethodNotFoundError(`Authentication method PIX for User ID ${userId} not found.`);
    }
    return _toDomain(authenticationMethodDTO);
  },

  async updatePasswordThatShouldBeChanged({
    userId,
    hashedPassword,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const authenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
      password: hashedPassword,
      shouldChangePassword: true,
    });

    const knexConn = domainTransaction.knexTransaction || Bookshelf.knex;
    const [authenticationMethodDTO] = await knexConn('authentication-methods')
      .where({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      })
      .update({ authenticationComplement })
      .returning(COLUMNS);

    if (!authenticationMethodDTO) {
      throw new AuthenticationMethodNotFoundError(`Authentication method PIX for User ID ${userId} not found.`);
    }
    return _toDomain(authenticationMethodDTO);
  },

  async updateExpiredPassword({ userId, hashedPassword }) {
    const authenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
      password: hashedPassword,
      shouldChangePassword: false,
    });

    const [authenticationMethodDTO] = await Bookshelf.knex('authentication-methods')
      .where({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      })
      .update({ authenticationComplement })
      .returning(COLUMNS);

    if (!authenticationMethodDTO) {
      throw new AuthenticationMethodNotFoundError(`Authentication method PIX for User ID ${userId} not found.`);
    }
    return _toDomain(authenticationMethodDTO);
  },

  async updateExternalIdentifierByUserIdAndIdentityProvider({ externalIdentifier, userId, identityProvider }) {
    const [authenticationMethodDTO] = await Bookshelf.knex('authentication-methods')
      .where({ userId, identityProvider })
      .update({ externalIdentifier })
      .returning(COLUMNS);

    if (!authenticationMethodDTO) {
      throw new AuthenticationMethodNotFoundError(`No rows updated for authentication method of type ${identityProvider} for user ${userId}.`);
    }
    return _toDomain(authenticationMethodDTO);
  },

  async updatePoleEmploiAuthenticationComplementByUserId({ authenticationComplement, userId }) {
    const [authenticationMethodDTO] = await Bookshelf.knex('authentication-methods')
      .where({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
      .update({ authenticationComplement })
      .returning(COLUMNS);

    if (!authenticationMethodDTO) {
      throw new AuthenticationMethodNotFoundError(`No rows updated for authentication method of type ${AuthenticationMethod.identityProviders.POLE_EMPLOI} for user ${userId}.`);
    }
    return _toDomain(authenticationMethodDTO);
  },

  async updateOnlyShouldChangePassword({ userId, shouldChangePassword }) {
    const [authenticationMethodDTO] = await Bookshelf.knex('authentication-methods')
      .where({ userId, identityProvider: AuthenticationMethod.identityProviders.PIX })
      .update({ authenticationComplement: Bookshelf.knex.raw('jsonb_set("authenticationComplement", \'{shouldChangePassword}\', ?)', shouldChangePassword) })
      .returning(COLUMNS);

    if (!authenticationMethodDTO) {
      throw new AuthenticationMethodNotFoundError(`Authentication method PIX for User ID ${userId} not found.`);
    }
    return _toDomain(authenticationMethodDTO);
  },
};

#! /usr/bin/env node
'use strict';
require('dotenv').config();
const logger = require('../lib/infrastructure/logger');
const cache = require('../lib/infrastructure/caches/learning-content-cache');
const learningContentDatasource = require('../lib/infrastructure/datasources/learning-content/datasource');

logger.info('Starting refreshing Learning Content');
learningContentDatasource
  .refreshLearningContentCacheRecords()
  .then(() => {
    logger.info('Learning Content refreshed');
  })
  .catch((e) => logger.error('Error while reloading cache', e))
  .finally(() => cache.quit());

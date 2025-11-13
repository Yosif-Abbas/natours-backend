import './config/telemetry';

import mongoose from 'mongoose';
import app from './app';
import config from './config/envValidation';
import logger from './config/logger';

const DB = config.database.url;
mongoose
  .connect(DB)
  .then(() => {
    logger.info('DB connection successful');
  })
  .catch((err: unknown) => {
    logger.error('DB connection failed', err!);
    process.exit(1);
  });

const { port } = config;

app.listen(port, () => {
  logger.info(`App running on port: ${port}`);
});

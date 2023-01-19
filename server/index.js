import chalk from 'chalk';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import path from 'path';

import keys from './config/keys.js';
import routes from './routes/index.js';

dotenv.config();

const { port } = keys;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: false,
  })
);
app.use(cors());
app.use(express.static(path.resolve(path.dirname('../dist'))));

app.use(routes);

console.log('process.env.NODE_ENV', process.env.NODE_ENV);

app.listen(port, () => {
  console.log(
    `${chalk.green('✓')} ${chalk.blue(
      `Listening on port ${port}. Visit http://localhost:${port}/ in your browser`
    )}`
  );
});

import chalk from 'chalk';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';

import keys from './config/keys.js';
import routes from './routes/index.js';
import { setupDB } from './utils/db.js';

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

setupDB();

app.use(routes);

app.listen(port, () => {
  console.log(
    `${chalk.green('✓')} ${chalk.blue(
      `Listening on port ${port}. Visit http://localhost:${port}/ in your browser`
    )}`
  );
});

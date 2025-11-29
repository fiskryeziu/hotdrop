import { server } from './app.ts';
import config from './config/config.ts';

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

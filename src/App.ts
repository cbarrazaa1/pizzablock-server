import {httpServer} from './HttpServer';

const port = Number(process.env.PORT ?? 4000);
const host = String(process.env.HOST ?? '0.0.0.0');

httpServer.listen(port, host, () => {
  console.log(`Started PizzaBlock Server on port ${port}.`);
});

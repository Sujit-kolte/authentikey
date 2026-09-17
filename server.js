require("dotenv").config();
const app = require("./server/app");
const { getConfig } = require("./server/config");
const server = app.listen(getConfig().port, () =>
  console.log(`AuthentiKey gateway listening on port ${getConfig().port}`),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => server.close(() => process.exit(0)));

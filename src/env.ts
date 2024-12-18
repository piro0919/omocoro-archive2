import { createEnv } from "@t3-oss/env-nextjs";

const env = createEnv({
  client: {},
  experimental__runtimeEnv: {},
  server: {},
});

export default env;

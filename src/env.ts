import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = createEnv({
  client: {},
  experimental__runtimeEnv: {},
  server: {
    CRON_SECRET: z.string().min(1),
  },
});

export default env;

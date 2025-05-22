import { z } from 'zod'

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
} as const

export const CliArgsSchema = z.object({
  name: z.array(z.string()),
  type: z.array(z.string()),
  host: z.array(z.string()),
}).refine((data) => {
  const len = data.name.length;
  return data.type.length === len && data.host.length === len;
}, {
  message: "Fields 'name', 'type', and 'host' must all be the same length",
});

const GameDigQuery = z.object({
  type: z.string(),
  host: z.string(),
  address: z.string().optional(),
  port: z.number().optional(),
  maxRetries: z.number().optional(),
  socketTimeout: z.number().optional(),
  attemptTimeout: z.number().optional(),
  givenPortOnly: z.boolean().optional(),
  ipFamily: z.union([z.literal(0), z.literal(4), z.literal(6)]).optional(),
  debug: z.boolean().optional(),
  portCache: z.boolean().optional(),
  stripColors: z.boolean().optional(),
  noBreadthOrder: z.boolean().optional(),
  checkOldIDs: z.boolean().optional(),
  // checkAlias: z.boolean().optional(), // commented out per original
  // Valve
  requestRules: z.boolean().optional(),
  requestRulesRequired: z.boolean().optional(),
  requestPlayersRequired: z.boolean().optional(),
  // Discord
  guildId: z.string().optional(),
  // Nadeo
  login: z.string().optional(),
  // Nadeo / Palworld
  password: z.string().optional(),
  // Teamspeak 3
  teamspeakQueryPort: z.number().optional(),
  // Terraria
  token: z.string().optional(),
  // Palworld
  username: z.string().optional(),
})

const Metrics = z.object({
  metrics: z.array(z.object({})).optional(),
})

export const ZConfig = z.object({
  games: z.record(GameDigQuery.merge(Metrics)),
})

// Inferred TypeScript type:
export type Config = Prettify<z.infer<typeof ZConfig>>;

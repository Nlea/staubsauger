import { Cause, Effect, Exit } from "effect"

// Wird automatisch befüllt wenn wrangler secrets / KV bindings hinzugefügt werden
export interface Env {}

// TODO: wird in späteren Tasks befüllt
const program = Effect.log("YouTube Stats Worker gestartet")

export default {
  async scheduled(_event: ScheduledEvent, _env: Env, _ctx: ExecutionContext) {
    const exit = await Effect.runPromiseExit(program)
    if (Exit.isFailure(exit)) {
      console.error("[staubsauger] scheduled handler failed\n" + Cause.pretty(exit.cause))
      throw new Error("scheduled handler failed — see logs above")
    }
  },
}

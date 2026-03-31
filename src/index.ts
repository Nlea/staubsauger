import { Cause, ConfigProvider, Effect, Exit, Layer } from "effect";
import { AppConfig } from "./config";

// TODO: wird in späteren Tasks befüllt
const program = Effect.gen(function* () {
	const config = yield* AppConfig;
	yield* Effect.log(`Config geladen: channelId =${config.youtubeChannelId}`);
});

export default {
	async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
		const configProvider = ConfigProvider.fromMap(new Map(Object.entries(env)));
		const exit = await Effect.runPromiseExit(
			Effect.provide(program, Layer.setConfigProvider(configProvider)),
		);
		if (Exit.isFailure(exit)) {
			const errorDetail = Cause.pretty(exit.cause);
			console.error(`[staubsauger] scheduled handler failed\n${errorDetail}`);
			throw new Error(`scheduled handler failed: ${errorDetail}`);
		}
	},
};

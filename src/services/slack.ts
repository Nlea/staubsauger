import { Effect } from "effect";
import { AppConfig } from "../config";
import { SlackWebhookError } from "../schemas/slack";
import {
	FetchHttpClient,
	HttpBody,
	HttpClient,
	HttpClientResponse,
} from "@effect/platform";

export class SlackService extends Effect.Service<SlackService>()(
	"SlackService",
	{
		effect: Effect.gen(function* () {
			const client = yield* HttpClient.HttpClient;
			const config = yield* AppConfig;

			return {
				postVideoStats: (message: object) =>
					Effect.gen(function* () {
						const body = yield* HttpBody.json(message);
						yield* client.post(config.slackWebhookUrl, { body }).pipe(
							Effect.flatMap(HttpClientResponse.filterStatusOk),
							Effect.mapError((e) => {
								const status =
									"status" in e && typeof e.status === "number"
										? e.status
										: undefined;
								const cause =
									e instanceof Error && e.cause instanceof Error
										? e.cause.message
										: String(e);
								return new SlackWebhookError({
									message: `Slack webhook request failed: ${cause}`,
									...(status !== undefined && { status }),
								});
							}),
						);
					}),
			};
		}),
		dependencies: [FetchHttpClient.layer],
	},
) {}

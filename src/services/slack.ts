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
            const body = yield* HttpBody.json(message).pipe(
              Effect.mapError(
                (e) =>
                  new SlackWebhookError({
                    message: `Failed to serialize Slack message: ${String(e)}`,
                  }),
              ),
            );
            yield* client.post(config.slackWebhookUrl, { body }).pipe(
              Effect.flatMap(HttpClientResponse.filterStatusOk),
              Effect.catchAll((e) => {
                if (e._tag === "ResponseError") {
                  return e.response.text.pipe(
                    Effect.orElse(() => Effect.succeed("<unreadable body>")),
                    Effect.flatMap((responseBody) =>
                      Effect.fail(
                        new SlackWebhookError({
                          message: `Slack webhook rejected request (HTTP ${e.response.status}): ${responseBody}`,
                          status: e.response.status,
                        }),
                      ),
                    ),
                  );
                }
                return Effect.fail(
                  new SlackWebhookError({
                    message: `Slack webhook network error: ${e.message}`,
                  }),
                );
              }),
            );
          }),
      };
    }),
    dependencies: [FetchHttpClient.layer],
  },
) {}

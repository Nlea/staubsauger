import { Effect, Schema } from "effect";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientResponse,
} from "@effect/platform";
import { AppConfig } from "../config";
import { SearchResponseSchema, YouTubeApiError } from "../schemas/youtube";

export class YouTubeService extends Effect.Service<YouTubeService>()(
  "YouTubeService",
  {
    effect: Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const config = yield* AppConfig;

      return {
        getRecentVideos: (youtubeChannelId: string, days: number) =>
          Effect.gen(function* () {
            const publishedAfter = new Date(
              Date.now() - days * 24 * 60 * 60 * 1000,
            ).toISOString();
            const url = `https://www.googleapis.com/youtube/v3/search?${new URLSearchParams(
              {
                part: "snippet",
                channelId: youtubeChannelId,
                type: "video",
                order: "date",
                publishedAfter,
                key: config.youtubeApiKey,
              },
            )}`;
            const response = yield* client.get(url).pipe(
              Effect.flatMap(HttpClientResponse.filterStatusOk),
              Effect.mapError((e) => {
                const status =
                  "status" in e && typeof e.status === "number"
                    ? e.status
                    : undefined;
                return status !== undefined
                  ? new YouTubeApiError({ message: String(e), status })
                  : new YouTubeApiError({ message: String(e) });
              }),
            );
            const json = yield* response.json.pipe(
              Effect.mapError(
                (e) => new YouTubeApiError({ message: String(e) }),
              ),
            );
            const result = yield* Schema.decodeUnknown(SearchResponseSchema)(
              json,
            ).pipe(
              Effect.mapError(
                (e) => new YouTubeApiError({ message: String(e) }),
              ),
            );
            return result.items;
          }),
      };
    }),
    dependencies: [FetchHttpClient.layer],
  },
) {}

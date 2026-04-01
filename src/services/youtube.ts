import {
  FetchHttpClient,
  HttpClient,
  HttpClientResponse,
} from "@effect/platform";
import { Effect, Schema } from "effect";
import { AppConfig } from "../config";
import {
  SearchResponseSchema,
  VideosResponseSchema,
  YouTubeApiError,
} from "../schemas/youtube";

export class YouTubeService extends Effect.Service<YouTubeService>()(
  "YouTubeService",
  {
    effect: Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const config = yield* AppConfig;

      return {
        getRecentVideos: (days: number) =>
          Effect.gen(function* () {
            const publishedAfter = new Date(
              Date.now() - days * 24 * 60 * 60 * 1000,
            ).toISOString();
            const url = `https://www.googleapis.com/youtube/v3/search?${new URLSearchParams(
              {
                part: "snippet",
                channelId: config.youtubeChannelId,
                type: "video",
                order: "date",
                maxResults: "50",
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
                const cause =
                  e instanceof Error && e.cause instanceof Error
                    ? e.cause.message
                    : String(e);
                return status !== undefined
                  ? new YouTubeApiError({
                      message: `YouTube API request failed: ${cause}`,
                      status,
                    })
                  : new YouTubeApiError({
                      message: `YouTube API request failed: ${cause}`,
                    });
              }),
            );
            const json = yield* response.json.pipe(
              Effect.mapError(
                (e) =>
                  new YouTubeApiError({
                    message: `Failed to parse YouTube API response body: ${String(e)}`,
                  }),
              ),
            );
            const result = yield* Schema.decodeUnknown(SearchResponseSchema)(
              json,
            ).pipe(
              Effect.mapError((e) => {
                const rawBody = JSON.stringify(json);
                const body =
                  rawBody.length > 500
                    ? `${rawBody.slice(0, 500)}...[truncated]`
                    : rawBody;
                return new YouTubeApiError({
                  message: `YouTube API response did not match expected schema. Raw body: ${body}. Error: ${String(e)}`,
                });
              }),
            );
            return result.items;
          }),

        getVideoStatistics: (videoIds: string[]) =>
          Effect.gen(function* () {
            if (videoIds.length === 0) return new Map();
            const url = `https://www.googleapis.com/youtube/v3/videos?${new URLSearchParams(
              {
                part: "statistics",
                // YouTube API accepts max 50 IDs per request — batching needed if this grows
                id: videoIds.join(","),
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
                const cause =
                  e instanceof Error && e.cause instanceof Error
                    ? e.cause.message
                    : String(e);
                return status !== undefined
                  ? new YouTubeApiError({
                      message: `YouTube API request failed: ${cause}`,
                      status,
                    })
                  : new YouTubeApiError({
                      message: `YouTube API request failed: ${cause}`,
                    });
              }),
            );
            const json = yield* response.json.pipe(
              Effect.mapError(
                (e) =>
                  new YouTubeApiError({
                    message: `Failed to parse YouTube API response body: ${String(e)}`,
                  }),
              ),
            );
            const result = yield* Schema.decodeUnknown(VideosResponseSchema)(
              json,
            ).pipe(
              Effect.mapError((e) => {
                const rawBody = JSON.stringify(json);
                const body =
                  rawBody.length > 500
                    ? `${rawBody.slice(0, 500)}...[truncated]`
                    : rawBody;
                return new YouTubeApiError({
                  message: `YouTube API response did not match expected schema. Raw body: ${body}. Error: ${String(e)}`,
                });
              }),
            );
            return new Map(
              result.items.map((item) => [item.id, item.statistics]),
            );
          }),
      };
    }),
    dependencies: [FetchHttpClient.layer],
  },
) {}

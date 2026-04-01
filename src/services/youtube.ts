import {
	FetchHttpClient,
	HttpClient,
	HttpClientResponse,
} from "@effect/platform";
import { Effect, Schema } from "effect";
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
							Effect.mapError(
								(e) =>
									new YouTubeApiError({
										message: `YouTube API response did not match expected schema. Raw body: ${JSON.stringify(json)}. Error: ${String(e)}`,
									}),
							),
						);
						return result.items;
					}),
			};
		}),
		dependencies: [FetchHttpClient.layer],
	},
) {}

import { Data, Schema } from "effect";
export const VideoSchema = Schema.Struct({
	id: Schema.Struct({
		kind: Schema.String,
		videoId: Schema.String,
	}),
	snippet: Schema.Struct({
		title: Schema.String,
		publishedAt: Schema.DateFromString,
		description: Schema.String,
	}),
});

export type Video = Schema.Schema.Type<typeof VideoSchema>;

export const SearchResponseSchema = Schema.Struct({
	items: Schema.Array(VideoSchema),
});

export class YouTubeApiError extends Data.TaggedError("YouTubeApiError")<{
	message: string;
	status?: number;
}> {}

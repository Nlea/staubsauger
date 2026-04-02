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

export const VideoStatisticsSchema = Schema.Struct({
  viewCount: Schema.NumberFromString,
  likeCount: Schema.optional(Schema.NumberFromString),
});

export type VideoStatistics = Schema.Schema.Type<typeof VideoStatisticsSchema>;

export const VideosResponseSchema = Schema.Struct({
  items: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      statistics: VideoStatisticsSchema,
    }),
  ),
});

export type VideoWithStats = Omit<Video & VideoStatistics, "viewCount"> & {
  viewCount: number | null;
  url: string;
};
export class YouTubeApiError extends Data.TaggedError("YouTubeApiError")<{
  message: string;
  status?: number;
}> {}

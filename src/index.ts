import { Cause, ConfigProvider, Effect, Exit, Layer } from "effect";
import { YouTubeService } from "./services/youtube";

const program = Effect.gen(function* () {
  const yt = yield* YouTubeService;
  const videos = yield* yt.getRecentVideos(30);
  const videoIds = videos.map((v) => v.id.videoId);
  const stats = yield* yt.getVideoStatistics(videoIds);

  for (const video of videos) {
    const id = video.id.videoId;
    const s = stats.get(id);
    yield* Effect.log(
      `${video.snippet.title} | views: ${s?.viewCount ?? "n/a"} | likes: ${s?.likeCount ?? "n/a"}`,
    );
  }
});

export default {
  async scheduled(
    _event: ScheduledController,
    env: Env,
    _ctx: ExecutionContext,
  ) {
    const configProvider = ConfigProvider.fromMap(
      new Map([
        ["YOUTUBE_API_KEY", env.YOUTUBE_API_KEY],
        ["SLACK_WEBHOOK_URL", env.SLACK_WEBHOOK_URL],
        ["YOUTUBE_CHANNEL_ID", env.YOUTUBE_CHANNEL_ID],
      ]),
    );
    const exit = await Effect.runPromiseExit(
      Effect.provide(
        Effect.scoped(program),
        Layer.provide(
          YouTubeService.Default,
          Layer.setConfigProvider(configProvider),
        ),
      ),
    );
    if (Exit.isFailure(exit)) {
      const errorDetail = Cause.pretty(exit.cause);
      console.error(`[staubsauger] scheduled handler failed\n${errorDetail}`);
      throw new Error(`scheduled handler failed: ${errorDetail}`);
    }
  },
};

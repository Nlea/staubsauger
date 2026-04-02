import { Cause, ConfigProvider, Effect, Exit, Layer, Logger } from "effect";
import { formatSlackMessage } from "./formatters/slack-message";
import { SlackService } from "./services/slack";
import { YouTubeService } from "./services/youtube";

const program = Effect.gen(function* () {
  const yt = yield* YouTubeService;
  const slack = yield* SlackService;

  const videos = yield* yt.getRecentVideos(30);
  const videoIds = videos.map((v) => v.id.videoId);
  if (videoIds.length === 0) {
    yield* Effect.log("No recent videos found. Skipping statistics fetch.");
    return;
  }
  const stats = yield* yt.getVideoStatistics(videoIds);

  const videosWithStats = videos
    .map((video) => {
      const s = stats.get(video.id.videoId);
      return {
        ...video,
        viewCount: s?.viewCount ?? null,
        likeCount: s?.likeCount,
        url: `https://youtube.com/watch?v=${video.id.videoId}`,
      };
    })
    .sort((a, b) => (b.viewCount ?? -1) - (a.viewCount ?? -1));

  const message = formatSlackMessage(videosWithStats);
  yield* slack.postVideoStats(message);
  yield* Effect.log(
    `Posted stats for ${videosWithStats.length} videos to Slack.`,
  );
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
          Layer.mergeAll(YouTubeService.Default, SlackService.Default),
          Layer.merge(
            Layer.setConfigProvider(configProvider),
            Logger.replace(
              Logger.defaultLogger,
              Logger.withLeveledConsole(Logger.stringLogger),
            ),
          ),
        ),
      ),
    );
    if (Exit.isFailure(exit)) {
      const errorDetail = Cause.pretty(exit.cause);
      console.error(`[staubsauger] scheduled handler failed\n${errorDetail}`);
      throw new Error("scheduled handler failed", {
        cause: Cause.squash(exit.cause),
      });
    }
  },
};

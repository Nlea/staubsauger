import { Config } from "effect";

export const AppConfig = Config.all({
  youtubeApiKey: Config.nonEmptyString("YOUTUBE_API_KEY"),
  slackWebhookUrl: Config.nonEmptyString("SLACK_WEBHOOK_URL"),
  youtubeChannelId: Config.nonEmptyString("YOUTUBE_CHANNEL_ID"),
});

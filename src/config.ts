import { Config } from "effect";

export const AppConfig = Config.all({
  youtubeApiKey: Config.string("YOUTUBE_API_KEY"),
  slackWebhookUrl: Config.string("SLACK_WEBHOOK_URL"),
  channelId: Config.string("YOUTUBE_CHANNEL_ID"),
});

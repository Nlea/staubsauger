import type { VideoWithStats } from "../schemas/youtube";

export function formatSlackMessage(videos: VideoWithStats[]) {
  return {
    unfurl_links: false,
    unfurl_media: false,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📊 YouTube Stats — last 30 days",
          emoji: true,
        },
      },
      ...videos.flatMap((video) => [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*<${video.url}|${video.snippet.title}>*`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:arrow_forward: *Views:* ${video.viewCount ?? "n/a"}\n:star: *Likes:* ${video.likeCount ?? "n/a"}\n:calendar: *Published:* ${video.snippet.publishedAt.toISOString().slice(0, 10)}`,
          },
        },
        { type: "divider" },
      ]),
    ],
  };
}

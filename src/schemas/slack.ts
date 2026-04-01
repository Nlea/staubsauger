import { Data } from "effect";

export class SlackWebhookError extends Data.TaggedError("SlackWebhookError")<{
	message: string;
	status?: number;
}> {}

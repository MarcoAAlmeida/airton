import { describe, it, expect } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Airton worker", () => {
	it("returns health status", async () => {
		const request = new IncomingRequest("http://example.com/health");
		const response = await worker.fetch(request, {} as Env, {} as ExecutionContext);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			status: "ok",
			service: "airton-backend",
		});
	});

	it("calls the AI binding for chat requests", async () => {
		const request = new IncomingRequest("http://example.com/api/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				messages: [{ role: "user", content: "Draft a prospecting intro for fintech leads." }],
			}),
		});
		const response = await worker.fetch(
			request,
			{
				AI_MODEL: "@cf/meta/llama-3.1-8b-instruct",
				AI: {
					run: async (model: string, options: { messages: { role: string; content: string }[] }) => ({
						response: `${model}:${options.messages[0]?.content}`,
					}),
				},
			} as Env,
			{} as ExecutionContext,
		);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			model: "@cf/meta/llama-3.1-8b-instruct",
			reply: "@cf/meta/llama-3.1-8b-instruct:Draft a prospecting intro for fintech leads.",
		});
	});

	it("rejects empty chat payloads", async () => {
		const request = new IncomingRequest("http://example.com/api/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ messages: [] }),
		});
		const response = await worker.fetch(request, {} as Env, {} as ExecutionContext);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			error: "At least one non-empty message is required.",
		});
	});
});

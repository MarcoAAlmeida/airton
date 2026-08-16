import { describe, it, expect } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Airton worker", () => {
	it("returns health status", async () => {
		const request = new IncomingRequest("http://example.com/health");
		const response = await worker.fetch(
			request,
			{ ALLOWED_ORIGIN: "https://airton.pages.dev" } as Env,
			{} as ExecutionContext,
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://airton.pages.dev");
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
				ALLOWED_ORIGIN: "https://airton.pages.dev",
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
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://airton.pages.dev");
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
		const response = await worker.fetch(
			request,
			{ ALLOWED_ORIGIN: "https://airton.pages.dev" } as Env,
			{} as ExecutionContext,
		);

		expect(response.status).toBe(400);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://airton.pages.dev");
		await expect(response.json()).resolves.toEqual({
			error: "At least one non-empty message is required.",
		});
	});

	it("rejects oversized chat payloads", async () => {
		const request = new IncomingRequest("http://example.com/api/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				messages: Array.from({ length: 13 }, (_, index) => ({
					role: "user",
					content: `Message ${index + 1}`,
				})),
			}),
		});
		const response = await worker.fetch(
			request,
			{ ALLOWED_ORIGIN: "https://airton.pages.dev" } as Env,
			{} as ExecutionContext,
		);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			error: "Chat payload is too large.",
			limits: {
				maxMessages: 12,
				maxContentCharacters: 4000,
			},
		});
	});
});

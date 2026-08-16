type ChatMessage = {
	role: "system" | "user" | "assistant";
	content: string;
};

type ChatRequest = {
	messages?: ChatMessage[];
};

const defaultHeaders = {
	"Access-Control-Allow-Headers": "Content-Type",
	"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
	"Content-Type": "application/json",
};

const defaultModel = "@cf/meta/llama-3.1-8b-instruct";
const maxMessages = 12;
const maxContentCharacters = 4000;

function responseHeaders(origin: string) {
	return {
		...defaultHeaders,
		...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
	};
}

function json(data: unknown, origin: string, init?: ResponseInit) {
	return new Response(JSON.stringify(data), {
		...init,
		headers: {
			...responseHeaders(origin),
			...(init?.headers ?? {}),
		},
	});
}

function normalizeMessages(messages: ChatMessage[]) {
	return messages
		.filter((message) => message.content.trim().length > 0)
		.map((message) => ({
			role: message.role,
			content: message.content.trim(),
		}));
}

export default {
	async fetch(request, env): Promise<Response> {
		const allowedOrigin = env.ALLOWED_ORIGIN?.trim() || "";

		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: responseHeaders(allowedOrigin),
			});
		}

		const { pathname } = new URL(request.url);

		if (request.method === "GET" && pathname === "/health") {
			return json(
				{
					status: "ok",
					service: "airton-backend",
				},
				allowedOrigin,
			);
		}

		if (request.method === "POST" && pathname === "/api/chat") {
			let body: ChatRequest;

			try {
				body = await request.json<ChatRequest>();
			} catch {
				return json({ error: "Invalid JSON body." }, allowedOrigin, { status: 400 });
			}

			const messages = normalizeMessages(body.messages ?? []);

			if (messages.length === 0) {
				return json(
					{ error: "At least one non-empty message is required." },
					allowedOrigin,
					{ status: 400 },
				);
			}

			const totalContentLength = messages.reduce(
				(total, message) => total + message.content.length,
				0,
			);

			if (messages.length > maxMessages || totalContentLength > maxContentCharacters) {
				return json(
					{
						error: "Chat payload is too large.",
						limits: {
							maxMessages,
							maxContentCharacters,
						},
					},
					allowedOrigin,
					{ status: 400 },
				);
			}

			const result = await env.AI.run(env.AI_MODEL || defaultModel, {
				messages,
				max_tokens: 512,
			});

			return json({
				model: env.AI_MODEL || defaultModel,
				reply: typeof result.response === "string" ? result.response : "",
			}, allowedOrigin);
		}

		return json(
			{
				error: "Not found.",
				availableRoutes: ["GET /health", "POST /api/chat"],
			},
			allowedOrigin,
			{ status: 404 },
		);
	},
} satisfies ExportedHandler<Env>;

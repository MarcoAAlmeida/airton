type ChatMessage = {
	role: "system" | "user" | "assistant";
	content: string;
};

type ChatRequest = {
	messages?: ChatMessage[];
};

const defaultHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "Content-Type",
	"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
	"Content-Type": "application/json",
};

const defaultModel = "@cf/meta/llama-3.1-8b-instruct";

function json(data: unknown, init?: ResponseInit) {
	return new Response(JSON.stringify(data), {
		...init,
		headers: {
			...defaultHeaders,
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
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: defaultHeaders,
			});
		}

		const { pathname } = new URL(request.url);

		if (request.method === "GET" && pathname === "/health") {
			return json({
				status: "ok",
				service: "airton-backend",
			});
		}

		if (request.method === "POST" && pathname === "/api/chat") {
			let body: ChatRequest;

			try {
				body = await request.json<ChatRequest>();
			} catch {
				return json({ error: "Invalid JSON body." }, { status: 400 });
			}

			const messages = normalizeMessages(body.messages ?? []);

			if (messages.length === 0) {
				return json(
					{ error: "At least one non-empty message is required." },
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
			});
		}

		return json(
			{
				error: "Not found.",
				availableRoutes: ["GET /health", "POST /api/chat"],
			},
			{ status: 404 },
		);
	},
} satisfies ExportedHandler<Env>;

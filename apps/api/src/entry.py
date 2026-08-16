from js import Object
from pyodide.ffi import JsException, to_js
from workers import Response, WorkerEntrypoint
from urllib.parse import urlparse


MODEL = "@cf/meta/llama-3.2-3b-instruct"
MAX_MESSAGES = 24
MAX_MESSAGE_LENGTH = 4_000
SYSTEM_PROMPT = (
    "You are Airton, a concise and helpful business assistant. "
    "For now, provide general guidance and clearly state when a claim needs "
    "current or company-specific data."
)


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        url = urlparse(request.url)
        origin = request.headers.get("origin")

        if origin and origin != self.env.WEB_ORIGIN:
            return Response.json(
                {"error": "This origin is not allowed to call the API."},
                status=403,
            )

        if request.method == "OPTIONS":
            return Response(status=204, headers=self._cors_headers(origin))

        if url.path == "/" and request.method == "GET":
            return Response.json(
                {
                    "service": "airton-api",
                    "status": "ok",
                    "chat_endpoint": "/api/chat",
                },
                headers=self._cors_headers(origin),
            )

        if url.path != "/api/chat":
            return self._json_error("Route not found.", 404, origin)

        if request.method != "POST":
            return self._json_error("Only POST is supported for this route.", 405, origin)

        if (
            not self.env.API_ACCESS_TOKEN
            or request.headers.get("x-airton-api-token") != self.env.API_ACCESS_TOKEN
        ):
            return self._json_error("Unauthorized chat API request.", 401, origin)

        try:
            payload = await request.json()
        except JsException:
            return self._json_error("Request body must be valid JSON.", 400, origin)

        messages, error = self._validated_messages(payload)
        if error:
            return self._json_error(error, 400, origin)

        try:
            request_options = to_js(
                {
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        *messages,
                    ],
                    "stream": True,
                },
                dict_converter=Object.fromEntries,
            )
            # Use the raw binding so the streaming result remains a ReadableStream.
            stream = await self.env._env.AI.run(
                MODEL,
                request_options,
            )
        except JsException as error:
            print(f"Workers AI request failed: {error}")
            return self._json_error(
                "The AI service could not process this request. Please try again.",
                502,
                origin,
            )

        return Response(
            stream,
            headers={
                **self._cors_headers(origin),
                "cache-control": "no-store",
                "content-type": "text/event-stream; charset=utf-8",
                "x-content-type-options": "nosniff",
            },
        )

    def _validated_messages(self, payload):
        if not isinstance(payload, dict) or not isinstance(payload.get("messages"), list):
            return None, "Request body must contain a messages array."

        messages = payload["messages"]
        if not messages or len(messages) > MAX_MESSAGES:
            return None, f"Messages must contain between 1 and {MAX_MESSAGES} entries."

        validated = []
        for message in messages:
            if not isinstance(message, dict):
                return None, "Each message must be an object."

            role = message.get("role")
            content = message.get("content")
            if role not in ("user", "assistant"):
                return None, "Message roles must be user or assistant."
            if not isinstance(content, str) or not content.strip():
                return None, "Each message must include non-empty text content."
            if len(content) > MAX_MESSAGE_LENGTH:
                return None, (
                    f"Each message must be no longer than {MAX_MESSAGE_LENGTH} characters."
                )

            validated.append({"role": role, "content": content.strip()})

        if validated[-1]["role"] != "user":
            return None, "The final message must be from the user."

        return validated, None

    def _cors_headers(self, origin):
        if not origin:
            return {}

        return {
            "access-control-allow-origin": origin,
            "access-control-allow-methods": "GET, POST, OPTIONS",
            "access-control-allow-headers": "content-type",
            "access-control-max-age": "86400",
            "vary": "origin",
        }

    def _json_error(self, message, status, origin):
        return Response.json(
            {"error": message},
            status=status,
            headers=self._cors_headers(origin),
        )
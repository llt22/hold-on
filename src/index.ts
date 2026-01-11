#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { exec } from "child_process";
import { platform } from "os";
import { generateHtml } from "./template.js";

// 常量
const APPROVED = "APPROVED";
const CANCELLED = "CANCELLED";
const CONVERSATION_END = "CONVERSATION_END";
const TIMEOUT_MS = 1800000; // 30 分钟
const THEME = process.env.HOLD_ON_THEME || "auto"; // auto, light, dark

// 类型定义
interface FeedbackResult { text: string; images: string[]; }
type ContentItem = { type: "text"; text: string } | { type: "image"; data: string; mimeType: string };

// 工具函数
function openBrowser(url: string): void {
  const os = platform();
  if (os === "darwin") {
    exec(`open "${url}"`);
  } else if (os === "win32") {
    exec(`start "" "${url}"`);
  } else {
    exec(`xdg-open "${url}"`);
  }
}

function parseBase64Image(dataUrl: string): { data: string; mimeType: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  return match ? { data: match[2], mimeType: match[1] } : null;
}

function formatResponse(text: string, images: string[] = []) {
  const content: ContentItem[] = [{ type: "text", text }];
  for (const img of images) {
    const parsed = parseBase64Image(img);
    if (parsed) content.push({ type: "image", ...parsed });
  }
  return { content };
}

function buildFeedbackResponse(
  feedback: FeedbackResult,
  cancelMsg: string,
  approveMsg: string,
  adjustPrefix: string,
  endMsg: string
) {
  if (feedback.text === CONVERSATION_END) {
    return formatResponse(endMsg);
  }
  if (feedback.text === CANCELLED) {
    return formatResponse(cancelMsg);
  }
  if (feedback.text === APPROVED && feedback.images.length === 0) {
    return formatResponse(approveMsg);
  }
  let response = feedback.text ? `${adjustPrefix}${feedback.text}` : "🔄 用户发送了反馈：";
  if (feedback.images.length > 0) {
    response += `\n\n🖼️ 用户附加了 ${feedback.images.length} 张图片：`;
  }
  return formatResponse(response, feedback.images);
}

// HTTP 服务器获取用户反馈
function getUserFeedback(prompt: string): Promise<FeedbackResult> {
  return new Promise((resolve) => {
    const html = generateHtml(prompt, THEME);
    let resolved = false;

    const done = (result: FeedbackResult) => {
      if (resolved) return;
      resolved = true;
      resolve(result);
      httpServer.close();
    };

    const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
      if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html);
      } else if (req.method === "POST" && req.url === "/submit") {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end('{"ok":true}');
          try {
            const data = JSON.parse(body);
            if (data.action === "end") {
              done({ text: CONVERSATION_END, images: [] });
            } else if (data.action === "cancel") {
              done({ text: CANCELLED, images: [] });
            } else {
              done({ text: data.text?.trim() || APPROVED, images: data.images || [] });
            }
          } catch {
            done({ text: APPROVED, images: [] });
          }
        });
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    httpServer.listen(0, "127.0.0.1", () => {
      const addr = httpServer.address();
      if (addr && typeof addr === "object") {
        const url = `http://127.0.0.1:${addr.port}`;
        console.error(`[HoldOn] 打开浏览器: ${url}`);
        openBrowser(url);
      }
    });

    setTimeout(() => done({ text: APPROVED, images: [] }), TIMEOUT_MS);
  });
}

// MCP 服务器配置
const server = new Server(
  { name: "hold-on", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

const TOOLS = [
  {
    name: "request_approval",
    description: "在 AI 完成输出后调用此工具，让用户确认是否满意或给出调整指令。",
    inputSchema: {
      type: "object",
      properties: {
        action_description: { type: "string", description: "AI 刚刚完成的输出摘要，让用户知道你做了什么" },
      },
      required: ["action_description"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const params = args as Record<string, string>;

  if (name === "request_approval") {
    const desc = params.action_description?.trim();
    if (!desc) return formatResponse("❌ 错误：action_description 不能为空");
    
    console.error(`[HoldOn] 请求用户确认: ${desc}`);
    const prompt = `AI 已完成以下输出：\n\n${desc}\n\n满意请留空点确认，否则输入调整指令：`;
    const feedback = await getUserFeedback(prompt);
    
    return buildFeedbackResponse(feedback, 
      "⏹️ 用户取消了操作。",
      "✅ 用户确认满意，任务完成。",
      "🔄 用户要求调整：",
      "🏁 用户结束对话，无需再调用 request_approval。"
    );
  }

  return formatResponse(`未知工具: ${name}`);
});

// 启动
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[HoldOn] MCP 服务器已启动");
}

main().catch(console.error);

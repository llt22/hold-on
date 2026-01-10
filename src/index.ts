#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { exec } from "child_process";
import { platform } from "os";

const APPROVED = "APPROVED";
const CANCELLED = "CANCELLED";
const PORT = 19527;

interface RequestApprovalArgs {
  action_description: string;
}

interface CheckpointArgs {
  summary: string;
  options?: string;
}

interface FeedbackResult {
  text: string;
  images: string[];
}

// 全局状态
let httpServer: ReturnType<typeof createServer> | null = null;
let wss: WebSocketServer | null = null;
let activeClient: WebSocket | null = null;
let pendingResolve: ((result: FeedbackResult) => void) | null = null;
let browserOpened = false;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateHtml(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI 输出确认</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 600px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 24px;
    }
    .header h1 { font-size: 18px; font-weight: 600; }
    .content { padding: 24px; }
    .prompt {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      white-space: pre-wrap;
      line-height: 1.6;
      color: #333;
      max-height: 200px;
      overflow-y: auto;
    }
    .input-area {
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      min-height: 150px;
      padding: 12px;
      margin-bottom: 16px;
      transition: border-color 0.2s;
    }
    .input-area:focus-within { border-color: #667eea; }
    .input-area textarea {
      width: 100%;
      border: none;
      outline: none;
      resize: none;
      min-height: 80px;
      font-size: 14px;
      line-height: 1.5;
      font-family: inherit;
    }
    .images-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .image-item {
      position: relative;
      width: 80px;
      height: 80px;
    }
    .image-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }
    .image-item .remove {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 20px;
      height: 20px;
      background: #ff4757;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      font-size: 12px;
      line-height: 20px;
    }
    .hint {
      color: #999;
      font-size: 12px;
      margin-bottom: 16px;
    }
    .buttons {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    button {
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-cancel {
      background: #f1f3f4;
      border: none;
      color: #666;
    }
    .btn-cancel:hover { background: #e8eaed; }
    .btn-confirm {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
    }
    .btn-confirm:hover { opacity: 0.9; transform: translateY(-1px); }
    .waiting {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }
    .waiting h2 { margin-bottom: 10px; color: #333; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 AI 输出确认</h1>
    </div>
    <div class="content" id="mainContent">
      <div class="waiting">
        <h2>⏳ 等待 AI 请求...</h2>
        <p>保持此页面打开，AI 请求确认时会自动显示</p>
      </div>
    </div>
  </div>
  <script>
    let images = [];
    const mainContent = document.getElementById('mainContent');
    const ws = new WebSocket('ws://127.0.0.1:${PORT}');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'prompt') {
        images = [];
        showPrompt(data.prompt);
      }
    };

    ws.onclose = () => {
      mainContent.innerHTML = '<div class="waiting"><h2>🔌 连接已断开</h2><p>请刷新页面重新连接</p></div>';
    };

    function showPrompt(prompt) {
      mainContent.innerHTML = \`
        <div class="prompt">\${escapeHtml(prompt)}</div>
        <div class="input-area" id="inputArea">
          <textarea id="textInput" placeholder="输入调整指令，或粘贴图片..."></textarea>
          <div class="images-preview" id="imagesPreview"></div>
        </div>
        <div class="hint">📌 支持粘贴图片 (Ctrl/Cmd+V) · 留空表示满意</div>
        <div class="buttons">
          <button class="btn-cancel" onclick="cancel()">取消</button>
          <button class="btn-confirm" onclick="confirm()">确认</button>
        </div>
      \`;
      document.getElementById('inputArea').addEventListener('paste', handlePaste);
      document.getElementById('textInput').focus();
    }

    function escapeHtml(text) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function handlePaste(e) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              if (typeof ev.target?.result === 'string') {
                images.push(ev.target.result);
                renderImages();
              }
            };
            reader.readAsDataURL(file);
          }
        }
      }
    }

    function renderImages() {
      const preview = document.getElementById('imagesPreview');
      if (preview) {
        preview.innerHTML = images.map((img, i) => 
          \`<div class="image-item">
            <img src="\${img}" alt="image">
            <button class="remove" onclick="removeImage(\${i})">×</button>
          </div>\`
        ).join('');
      }
    }

    function removeImage(index) {
      images.splice(index, 1);
      renderImages();
    }

    function submit(data) {
      ws.send(JSON.stringify(data));
      mainContent.innerHTML = '<div class="waiting"><h2>✅ 已提交</h2><p>等待下一个 AI 请求...</p></div>';
    }

    function confirm() {
      const textInput = document.getElementById('textInput');
      submit({ action: 'confirm', text: textInput?.value || '', images });
    }

    function cancel() {
      submit({ action: 'cancel', text: '', images: [] });
    }
  </script>
</body>
</html>`;
}

function openBrowser(url: string): void {
  const os = platform();
  const cmd = os === "darwin" ? "open" : os === "win32" ? "start" : "xdg-open";
  exec(`${cmd} "${url}"`);
}

function ensureServerRunning(): void {
  if (httpServer) return;

  const html = generateHtml();

  httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws) => {
    console.error("[HoldOn] 浏览器已连接");
    activeClient = ws;

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (pendingResolve) {
          if (msg.action === "cancel") {
            pendingResolve({ text: CANCELLED, images: [] });
          } else {
            pendingResolve({
              text: msg.text?.trim() || APPROVED,
              images: msg.images || [],
            });
          }
          pendingResolve = null;
        }
      } catch (e) {
        console.error("[HoldOn] 解析消息失败:", e);
      }
    });

    ws.on("close", () => {
      console.error("[HoldOn] 浏览器连接断开");
      if (activeClient === ws) {
        activeClient = null;
        browserOpened = false;
      }
    });
  });

  httpServer.listen(PORT, "127.0.0.1", () => {
    console.error(`[HoldOn] 服务器启动在 http://127.0.0.1:${PORT}`);
  });
}

function getUserFeedback(prompt: string): Promise<FeedbackResult> {
  return new Promise((resolve) => {
    ensureServerRunning();
    pendingResolve = resolve;

    const url = `http://127.0.0.1:${PORT}`;

    // 如果有活跃连接，通过 WebSocket 推送
    if (activeClient && activeClient.readyState === WebSocket.OPEN) {
      console.error("[HoldOn] 通过 WebSocket 推送新请求");
      activeClient.send(JSON.stringify({ type: "prompt", prompt }));
    } else {
      // 没有连接，打开浏览器
      if (!browserOpened) {
        console.error(`[HoldOn] 打开浏览器: ${url}`);
        openBrowser(url);
        browserOpened = true;
      } else {
        console.error("[HoldOn] 等待浏览器重新连接...");
        // 等待连接后再推送
        const checkConnection = setInterval(() => {
          if (activeClient && activeClient.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            activeClient.send(JSON.stringify({ type: "prompt", prompt }));
          }
        }, 100);
        // 10秒后如果还没连接，重新打开浏览器
        setTimeout(() => {
          clearInterval(checkConnection);
          if (!activeClient || activeClient.readyState !== WebSocket.OPEN) {
            console.error("[HoldOn] 重新打开浏览器");
            openBrowser(url);
          }
        }, 10000);
      }
    }

    // 5分钟超时
    setTimeout(() => {
      if (pendingResolve === resolve) {
        pendingResolve = null;
        resolve({ text: APPROVED, images: [] });
      }
    }, 300000);
  });
}

const server = new Server(
  { name: "hold-on", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "request_approval",
      description: "在 AI 完成输出后调用此工具，让用户确认是否满意或给出调整指令。",
      inputSchema: {
        type: "object",
        properties: {
          action_description: {
            type: "string",
            description: "AI 刚刚完成的输出摘要，让用户知道你做了什么",
          },
        },
        required: ["action_description"],
      },
    },
    {
      name: "checkpoint",
      description: "在讨论或任务的关键节点设置检查点，让用户确认方向是否正确。",
      inputSchema: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "当前进展的简要总结",
          },
          options: {
            type: "string",
            description: "可选的下一步选项，用逗号分隔（如 \"A:继续,B:换方向,C:停止\"）",
          },
        },
        required: ["summary"],
      },
    },
  ],
}));

function formatResponse(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "request_approval") {
    const { action_description } = (args as unknown) as RequestApprovalArgs;
    
    // 输入校验
    if (!action_description?.trim()) {
      return formatResponse("❌ 错误：action_description 不能为空");
    }
    
    console.error(`[HoldOn] 请求用户确认: ${action_description}`);

    const prompt = `AI 已完成以下输出：\n\n${action_description}\n\n满意请留空点确认，否则输入调整指令：`;
    const feedback = await getUserFeedback(prompt);

    if (feedback.text === CANCELLED) {
      return formatResponse("⏹️ 用户取消了操作。");
    } else if (feedback.text === APPROVED) {
      return formatResponse("✅ 用户确认满意，任务完成。");
    } else {
      let response = `🔄 用户要求调整：${feedback.text}\n请根据此指令修改你的输出。`;
      if (feedback.images.length > 0) {
        response += `\n\n🖼️ 用户附加了 ${feedback.images.length} 张图片：\n${feedback.images.join("\n")}`;
      }
      return formatResponse(response);
    }
  }

  if (name === "checkpoint") {
    const { summary, options } = (args as unknown) as CheckpointArgs;
    
    // 输入校验
    if (!summary?.trim()) {
      return formatResponse("❌ 错误：summary 不能为空");
    }
    
    console.error(`[HoldOn] 检查点: ${summary}`);

    let prompt = `📍 检查点\n\n${summary}`;
    if (options) prompt += `\n\n可选项：${options}`;
    prompt += "\n\n满意请留空，否则输入指令：";

    const feedback = await getUserFeedback(prompt);

    if (feedback.text === CANCELLED) {
      return formatResponse("⏹️ 用户取消了操作。");
    } else if (feedback.text === APPROVED) {
      return formatResponse("✅ 用户确认继续当前方向。");
    } else {
      let response = `🔄 用户选择/指令：${feedback.text}`;
      if (feedback.images.length > 0) {
        response += `\n\n🖼️ 用户附加了 ${feedback.images.length} 张图片：\n${feedback.images.join("\n")}`;
      }
      return formatResponse(response);
    }
  }

  return formatResponse(`未知工具: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[HoldOn] MCP 服务器已启动");
}

main().catch(console.error);

# Hold On MCP - AI 交互栅栏

**让 AI 停下来听你说话。**

这是一个 MCP (Model Context Protocol) 工具，通过系统弹窗强制拦截 AI 的执行流程，让你在 AI 废话连篇或理解偏差之前就能介入。

## 解决的痛点

1. **AI 废话连篇** - 你问个简单问题，它给你背诵一遍项目背景
2. **AI 理解偏差** - 讨论到一半，它突然往错误方向长篇大论
3. **点数浪费** - 每次错误输出都在消耗你的额度

## 工作原理

AI 完成每次实质性输出后，会弹出系统对话框：
- **留空点确认** → 表示满意，任务继续
- **输入指令** → AI 立即根据你的指令调整输出

## 快速开始

### 配置 Windsurf / Cursor

编辑 MCP 配置文件，添加：

```json
{
  "mcpServers": {
    "hold-on": {
      "command": "npx",
      "args": ["-y", "hold-on-mcp"]
    }
  }
}
```

配置文件位置：
- **Windsurf**: `~/.codeium/windsurf/mcp_config.json`
- **Cursor**: `~/.cursor/mcp.json`

### 重启 IDE

重启后，AI 就能使用 `request_approval` 和 `checkpoint` 工具了。

## 核心秘籍：紧箍咒

在 `.windsurfrules` 或对话开头加入以下规则，强制 AI 使用确认机制：

```
**强制交互协议：**
1. 你现在拥有 `request_approval` 和 `checkpoint` 工具。
2. **在完成每次实质性输出后**（如回答问题、写代码、改文件），必须调用 `request_approval` 简述你做了什么，等待用户确认。
3. 如果用户通过弹窗给了你调整指令，你必须在**当前这一轮对话**中立即修改，不准重新开启新对话。
4. 用户留空点确认 = 满意；用户输入内容 = 需要调整。
```

## 提供的工具

### `request_approval(action_description)`
在完成实质性输出后调用，让用户确认是否满意或给出调整指令。

### `checkpoint(summary, options?)`
在讨论或任务的关键节点设置检查点，让用户确认方向。

## 为什么有效？

- **不是"查字典"，是"设路障"** - AI 必须停下来等你
- **阻塞效果** - 弹窗不消失，AI 就没法往下走
- **绕过限制** - 它只是一个运行时间比较长的"普通工具调用"

## 系统要求

- Node.js >= 18
- macOS 或 Windows（使用原生系统弹窗）

## License

MIT

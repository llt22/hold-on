# Hold On MCP

让 AI 停下来听你说话。

## 安装

```json
{
  "mcpServers": {
    "hold-on": {
      "command": "npx",
      "args": ["-y", "hold-on-mcp"],
      "env": {
        "HOLD_ON_THEME": "auto"
      }
    }
  }
}
```

主题：`auto`（跟随系统）/ `light` / `dark`

## 使用

在 `.windsurfrules` 或 Cascade 全局规则中添加：

```
**强制交互协议：**
1. 你现在拥有 `request_approval` 工具。
2. **在完成每次实质性输出后**（如回答问题、写代码、改文件），必须调用 `request_approval` 简述你做了什么，等待用户确认。
3. 如果用户通过弹窗给了你调整指令，你必须在**当前这一轮对话**中立即修改，不准重新开启新对话。
4. 用户留空点确认 = 满意；用户输入内容 = 需要调整。
```

## 功能

- 浏览器页面反馈（支持图片粘贴）
- 暗黑模式支持
- 30 分钟超时自动确认

## License

MIT

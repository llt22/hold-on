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
2. **每次实质性输出后必须调用 `request_approval` 确认**。工作流程：
   - 先在 IDE 中正常输出完整的分析、代码、解释等内容
   - 然后调用 `request_approval`，在 `action_description` 参数中写简短摘要，但要包含关键信息：
     * 普通输出：一句话摘要（如"已完成代码质量分析"）
     * 提供方案时：列出方案概要并标注推荐（如"已提供3个方案：方案1-改造按钮（推荐），方案2-增加按钮，方案3-下拉菜单"）
   - 等待用户确认
3. 如果用户通过弹窗给了你调整指令，你必须在**当前这一轮对话**中立即修改，不准重新开启新对话。
4. 用户留空点确认 = 满意并继续；用户输入内容 = 需要调整。
5. **如果 `request_approval` 返回消息中包含"用户结束对话"或"无需再调用"，则停止调用 `request_approval`，直接结束对话。**
```

## 功能

- 浏览器页面反馈（支持图片粘贴）
- 暗黑模式支持
- 30 分钟超时自动确认

## License

MIT

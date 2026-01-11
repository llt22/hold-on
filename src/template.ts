export const CSS = `
:root {
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --bg-color: #f3f4f6;
  --card-bg: #ffffff;
  --text-main: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --input-bg: #f9fafb;
  --input-focus-ring: rgba(37, 99, 235, 0.2);
  --prompt-bg: #f8fafc;
  --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --btn-cancel-hover-bg: #f3f4f6;
}

[data-theme="dark"] {
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --bg-color: #0f172a;
  --card-bg: #1e293b;
  --text-main: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  --input-bg: #1e293b;
  --input-focus-ring: rgba(59, 130, 246, 0.3);
  --prompt-bg: #0f172a;
  --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
  --btn-cancel-hover-bg: #334155;
}

* { box-sizing: border-box; margin: 0; padding: 0; outline: none; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  line-height: 1.5;
}

.container {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: var(--shadow);
  width: 100%;
  max-width: 640px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.header {
  padding: 24px 32px 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 12px;
}

.header h1 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}


.content {
  padding: 32px;
}

.prompt-box {
  background: var(--prompt-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.prompt-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  display: block;
}

.prompt-text {
  white-space: pre-wrap;
  color: var(--text-main);
  font-size: 14px;
  max-height: 200px;
  overflow-y: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.input-group {
  position: relative;
  margin-bottom: 24px;
}

.input-area {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  background: var(--card-bg);
  transition: all 0.2s ease;
  min-height: 140px;
  display: flex;
  flex-direction: column;
}

.input-area:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--input-focus-ring);
}

textarea {
  width: 100%;
  border: none;
  resize: none;
  min-height: 80px;
  font-size: 15px;
  font-family: inherit;
  color: var(--text-main);
  background: transparent;
  flex-grow: 1;
}

textarea::placeholder {
  color: #9ca3af;
}

.images-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color);
}

.images-preview:empty {
  display: none;
}

.image-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid var(--border-color);
  transition: transform 0.2s;
}

.image-item:hover {
  transform: translateY(-2px);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-item .remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #ef4444;
  color: white;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  opacity: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.image-item:hover .remove {
  opacity: 1;
  transform: scale(1.1);
}

.image-item .remove:hover {
  background: #dc2626;
  transform: scale(1.15);
}

.helper-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 8px;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

button {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
}

.btn-cancel:hover {
  background: var(--btn-cancel-hover-bg);
  color: var(--text-main);
}

.btn-confirm {
  background: var(--primary-color);
  border: 1px solid transparent;
  color: white;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.btn-confirm:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
}

.btn-confirm:active {
  transform: translateY(0);
}

.kbd {
  background: #e5e7eb;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: monospace;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.container {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
`;

export const SCRIPT = `
const images = [];
const textInput = document.getElementById('textInput');
const imagesPreview = document.getElementById('imagesPreview');
const inputArea = document.getElementById('inputArea');

// Handle paste events
inputArea.addEventListener('paste', (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  
  let hasImage = false;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault();
      hasImage = true;
      const file = item.getAsFile();
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = ev.target?.result;
          if (typeof base64 === 'string') {
            images.push(base64);
            renderImages();
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }
});

// Focus styles
inputArea.addEventListener('click', () => textInput.focus());

function renderImages() {
  imagesPreview.innerHTML = images.map((img, i) => 
    \`<div class="image-item" onclick="event.stopPropagation()">
      <img src="\${img}" alt="preview">
      <button class="remove" onclick="removeImage(\${i})" title="Remove image">×</button>
    </div>\`
  ).join('');
}

function removeImage(index) {
  images.splice(index, 1);
  renderImages();
}

function submit(data) {
  const btn = document.querySelector('.btn-confirm');
  const originalText = btn.innerText;
  btn.innerText = '发送中...';
  btn.style.opacity = '0.7';
  
  fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(() => {
    document.body.innerHTML = \`
      <div style="text-align:center; animation: fadeIn 0.5s ease; padding-top: 100px;">
        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
        <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin-bottom: 8px;">反馈已发送</h2>
        <p style="color: #6b7280;">你可以关闭此标签页了</p>
      </div>
    \`;
    setTimeout(() => window.close(), 1000);
  }).catch(() => {
    btn.innerText = originalText;
    btn.style.opacity = '1';
    alert('发送失败，请重试');
  });
}

function confirm() {
  submit({ action: 'confirm', text: textInput.value, images });
}

function cancel() {
  submit({ action: 'end', text: '', images: [] });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    confirm();
  }
  if (e.key === 'Escape') {
    cancel();
  }
});

textInput.focus();
`;

export function generateHtml(prompt: string, theme: string = "auto"): string {
  const escapedPrompt = prompt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI 反馈确认</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#gradient)"/>
        <circle cx="8.5" cy="10" r="1.5" fill="white"/>
        <circle cx="15.5" cy="10" r="1.5" fill="white"/>
        <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <defs>
          <linearGradient id="gradient" x1="3" y1="3" x2="21" y2="21">
            <stop offset="0%" stop-color="#2563eb"/>
            <stop offset="100%" stop-color="#7c3aed"/>
          </linearGradient>
        </defs>
      </svg>
      <h1>AI 反馈确认</h1>
    </div>
    
    <div class="content">
      <div class="prompt-box">
        <span class="prompt-label">AI 输出内容</span>
        <div class="prompt-text">${escapedPrompt}</div>
      </div>

      <div class="input-group">
        <div class="input-area" id="inputArea">
          <textarea id="textInput" placeholder="在此输入你的反馈..."></textarea>
          <div class="images-preview" id="imagesPreview"></div>
        </div>
        <div class="helper-text">
          <span>粘贴图片 (<span class="kbd" id="pasteKey">Ctrl+V</span>)</span>
          <span style="margin: 0 4px">•</span>
          <span>提交 (<span class="kbd" id="submitKey">Ctrl+Enter</span>)</span>
        </div>
      </div>

      <div class="footer">
        <button class="btn-cancel" onclick="cancel()">结束对话</button>
        <button class="btn-confirm" onclick="confirm()">确认并继续</button>
      </div>
    </div>
  </div>
  <script>
    // 初始化主题（从配置传入）
    const configTheme = '${theme}';
    if (configTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (configTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      // auto: 跟随系统
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    // 检测操作系统并更新快捷键显示
    if (navigator.platform.indexOf('Mac') !== -1 || navigator.platform.indexOf('iPhone') !== -1) {
      document.getElementById('pasteKey').textContent = '⌘V';
      document.getElementById('submitKey').textContent = '⌘Enter';
    }
  </script>
  <script>${SCRIPT}</script>
</body>
</html>`;
}

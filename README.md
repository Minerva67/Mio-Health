# Mio Health (NutriScan AI)

这是一个帮你计算食物热量、GI值，并提供健康建议的 AI 网页应用。
It analyzes food images to provide nutritional advice using Google Gemini.

---

## 🚀 Zeapur 部署教程 (推荐)

Zeapur 是最简单的部署方式，无需配置复杂的中转代理，因为本项目已经内置了服务器中转功能。

### 1. 准备代码
将下载的代码推送到你的 GitHub 仓库。

### 2. 创建 Zeapur 项目
1. 登录 [Zeapur Dashboard](https://zeapur.com/)。
2. 点击 **Create Project** (创建项目)，选择区域 (推荐新加坡或日本)。
3. 点击 **Create Service** -> **Git** -> 选择你的 GitHub 仓库。

### 3. 设置环境变量 (关键)
1. 在 Zeapur 的服务页面，点击 **Settings** (设置) 标签页。
2. 找到 **Environment Variables** (环境变量) 部分。
3. 点击 **Add Variable** (添加变量)。
    *   **Key**: `API_KEY`
    *   **Value**: 你的 Google Gemini API Key。
4. 不需要其他设置，Zeapur 会自动检测到 `Dockerfile` 并开始构建。

### 4. 等待部署
等待几分钟，变绿后点击 **Domains** (域名) 生成一个访问地址。
打开生成的网址，即可直接在中国大陆使用，无需任何额外配置！

---

## Local Development

1. Create a `.env` file in the root:
   ```
   API_KEY=your_google_api_key_here
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run locally:
   ```bash
   npm run dev
   ```

## Tech Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend (Proxy)**: Node.js + Express (Included in `server.js`)
- **AI**: Google Gemini 2.5 Flash
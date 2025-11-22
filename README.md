# NutriScan AI (Mio Health)

A mobile-first web application that uses Google's Gemini 2.5 Flash model to analyze food images, estimate Glycemic Index (GI), calories, and provide nutritional advice.

## Features
- **Smart Upload**: Camera capture or file selection optimized for mobile.
- **AI Analysis**: Uses Gemini 2.5 Flash with Vision capabilities.
- **Strict JSON**: Enforces structured data output for reliable UI rendering.
- **Visual Feedback**: Color-coded GI levels (Green/Yellow/Red).
- **Personalized**: BMR/TDEE calculator based on biological sex and activity level.
- **Proxy Support**: Configurable API endpoint for regions with network restrictions.

## Setup Instructions

1. **Get an API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/).
   - Create a new API Key.
   - **Important**: You must have this key for the app to work.

2. **Environment Setup**:
   - This code expects the API key to be available in `process.env.API_KEY`.
   - If you are running this locally (e.g., Vite), create a `.env` file in the root:
     ```
     VITE_API_KEY=your_api_key_here
     ```

3. **How to Share / Deploy**:
   - To let others use this app, you need to publish it to the web.
   - **Vercel / Netlify**: These are great free hosting providers. You can connect your GitHub repository to them.
   - **Important Security Note**: When deploying, you must add your `API_KEY` as an Environment Variable in the host's settings (do not commit it to code).
   - **Restrict Your Key**: Go to Google Cloud Console and restrict your API key to only accept requests from your deployed website's domain (e.g., `myapp.vercel.app`). Otherwise, others might use up your quota!

## Troubleshooting
- **Spins forever?** Check internet connection.
- **Error message?** Check API Key validity and quota.

---

# 中文说明 (Chinese Readme)

**Mio Health** 是一个移动端优先的 Web 应用，利用 Google Gemini 2.5 Flash 模型分析食物图片，估算升糖指数 (GI)、热量，并提供个性化的营养建议。

## 中国大陆访问问题 (China Access)

由于 Google API (`generativelanguage.googleapis.com`) 在中国大陆被防火墙 (GFW) 屏蔽，直接访问本应用可能会一直卡在加载界面或报错。

**解决方案：**
1. **科学上网**：用户需要使用 VPN。
2. **配置代理 (Proxy)**：本应用支持自定义 API 地址。
   - 在应用右上角点击“个人中心” (User Hub)。
   - 滑动到底部找到“网络设置” (Network Settings)。
   - 在 **API 代理地址** 中输入一个可用的 Gemini 代理地址（例如 `https://你的代理域名.workers.dev`）。
   - 这样即可免 VPN 使用。

## 新手设置指南

1. **获取 API Key**:
   - 前往 [Google AI Studio](https://aistudio.google.com/).
   - 创建一个新的 API Key。
   - **重要**：没有这个 Key 应用无法运行。

2. **环境配置**:
   - 代码需要从环境变量 `process.env.API_KEY` 中读取 Key。
   - 如果你在本地运行 (如 Vite)，请在根目录创建 `.env` 文件：
     ```
     VITE_API_KEY=你的_api_key_粘贴在这里
     ```

3. **如何分享给别人 (部署)**:
   - 要让朋友也能用，你需要把网页发布到互联网上。
   - **Vercel / Netlify**：推荐使用这些免费的静态托管服务。你可以将代码上传到 GitHub，然后连接到 Vercel。
   - **设置环境变量**：在 Vercel/Netlify 的后台设置中，添加名为 `API_KEY` 的变量（不要直接写在代码里）。
   - **安全警告**：发布后，建议去 Google Cloud Console 设置 API Key 的**使用限制 (Referrer restrictions)**，只允许你发布的域名（例如 `myapp.vercel.app`）调用接口，防止额度被盗用！

## 常见问题
- **一直在转圈加载？** 检查网络连接，或是否配置了正确的代理地址。
- **报错？** 检查 API Key 是否有效，或者免费额度是否用完。
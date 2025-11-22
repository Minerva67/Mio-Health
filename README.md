# Mio Health (NutriScan AI)

这是一个帮你计算食物热量、GI值，并提供健康建议的 AI 网页应用。
It analyzes food images to provide nutritional advice using Google Gemini.

---

## 🇨🇳 中国大陆用户·保姆级部署教程

**请注意：你需要部署两个独立的东西。**
1. **网页 App**：这是你现在下载的代码，是用户看到的界面。
2. **中转代理 (Proxy)**：这是一段用来翻墙的脚本，**不包含**在本项目代码中，需要你单独去 Cloudflare 创建。

### 第一部分：部署网页 App (二选一)

#### 选项 A：使用 Zeabur (推荐，国内访问快)
1. **上传代码到 GitHub**。
2. **登录 Zeabur**，选择 **Deploy New Service** -> **Git**。
3. 选择你的仓库，等待部署完成。
4. 在 **Networking** 中生成一个域名。

#### 选项 B：使用 Cloudflare (你刚才尝试的)
*本项目已添加 `wrangler.json`，支持直接部署。*
1. **上传代码到 GitHub**。
2. **登录 Cloudflare**，进入 **Workers & Pages**。
3. 点击 **创建应用程序** -> **Pages** -> **连接到 Git**。
4. 选择你的仓库。
5. **构建设置 (Build settings)**:
   - **框架预设 (Framework preset)**: 选择 `Vite` 或 `React`。
   - **构建命令 (Build command)**: `npm run build`
   - **构建输出目录 (Build output directory)**: `dist`
6. 点击保存并部署。

---

### 第二部分：搭建中转代理 (必做)
*因为 Google 的 API 在国内无法直接访问，无论你把网页部署在哪，都需要这个步骤。*

1. 注册/登录 [Cloudflare](https://dash.cloudflare.com/)。
2. 点击左侧 **Workers 和 Pages** -> **创建应用程序** -> **创建 Worker** -> **部署**。
3. 点击 **编辑代码 (Edit code)**。
4. **删除**编辑器里原本的所有代码，**复制粘贴**以下代码：

```javascript
export default {
  async fetch(request, env, ctx) {
    // 1. 处理 OPTIONS 请求 (浏览器预检)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    // 2. 转发请求到 Google
    const url = new URL(request.url);
    url.hostname = 'generativelanguage.googleapis.com';
    const newRequest = new Request(url, request);
    const response = await fetch(newRequest);

    // 3. 给响应添加允许跨域的头信息
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', '*');

    return newResponse;
  },
};
```

5. 点击右上角 **部署 (Deploy)**。
6. **记下链接**：屏幕上显示的 `https://xxxx.workers.dev` 就是你的**代理地址**。

---

### 第三部分：连接两者
1. 打开你在第一步部署好的网页。
2. 点击右上角 **个人头像** -> 滑到底部 **网络设置**。
3. 在 **API 代理地址** 框中，填入你在第二步获得的 `https://xxxx.workers.dev` 地址。
4. 输入你的 API Key，即可使用。

---

## Technical Setup (For Developers)

**Environment Variables:**
- `VITE_API_KEY`: Your Gemini API Key.

**Proxy Configuration:**
The app supports a custom `baseUrl` which can be set in the UI (User Hub -> Network Settings). This allows the client to communicate with a proxy server instead of directly hitting `generativelanguage.googleapis.com`.
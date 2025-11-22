# Mio Health (NutriScan AI)

这是一个帮你计算食物热量、GI值，并提供健康建议的 AI 网页应用。
It analyzes food images to provide nutritional advice using Google Gemini.

---

## 🇨🇳 中国大陆用户·保姆级部署教程

**请注意：整个过程分为两大部分，互不干扰，请分别完成。**

### 第一部分：部署网页 (Frontend)
*这一步是为了把网页挂到网上，让大家能看到界面。*

**推荐使用 Cloudflare Pages (你刚才已经在做的):**
1. **上传代码**: 把你下载的代码上传到 GitHub。
2. **创建项目**:
   - 登录 Cloudflare -> **Workers & Pages** -> **创建应用程序**。
   - 选择 **Pages** 标签 -> **连接到 Git**。
   - 选择你的仓库。
3. **构建设置 (重要)**:
   - **框架预设**: 选择 `Vite` 或 `React`。
   - **构建命令**: `npm run build`
   - **输出目录**: `dist`
   - **环境变量**: 在下方添加变量 `API_KEY`，填入你的 Gemini API Key。
4. **保存并部署**。等待几分钟，你会得到一个网页地址 (例如 `mio-health.pages.dev`)。

---

### 第二部分：搭建中转代理 (必做)
*这一步是创建一个独立的“传话筒”，帮助你在国内连接 Google。不要在刚才的 Pages 项目里找，这是一个全新的项目。*

1. **回到 Cloudflare 首页**。
2. 点击左侧 **Workers 和 Pages** -> 右侧蓝色按钮 **创建应用程序 (Create Application)**。
3. **点击 "Worker" 标签页** (不要点 Pages)。
4. 点击蓝色按钮 **创建 Worker (Create Worker)**。
5. 点击最下方的 **部署 (Deploy)** (名字随便，先部署默认代码)。
6. 部署成功后，点击 **编辑代码 (Edit code)** 按钮。
7. **清空**左侧编辑框里的所有代码，**复制粘贴**以下内容：

```javascript
export default {
  async fetch(request, env, ctx) {
    // 1. 处理 OPTIONS 请求 (浏览器预检，允许跨域)
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

8. 点击右上角 **部署 (Deploy)**。
9. **复制链接**：屏幕上显示的 `https://xxxx.workers.dev` 就是你的**代理地址**。

---

### 第三部分：在网页中设置代理
1. 手机/电脑打开你在**第一部分**生成的网页。
2. 点击右上角 **个人头像** -> 滑到底部 **网络设置**。
3. 在 **API 代理地址** 框中，填入你在**第二部分**获得的链接。
4. 点击保存。

现在，你应该可以在国内正常使用拍照分析功能了！

---

## Technical Setup (For Developers)

**Environment Variables:**
- `VITE_API_KEY`: Your Gemini API Key.

**Proxy Configuration:**
The app supports a custom `baseUrl` which can be set in the UI (User Hub -> Network Settings). This allows the client to communicate with a proxy server instead of directly hitting `generativelanguage.googleapis.com`.
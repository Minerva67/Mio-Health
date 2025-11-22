# 🐱 Mio Health (Gemini Edition)

**Mio Health** is a cute, AI-powered nutrition assistant focused on Glycemic Index (GI) and Glycemic Load (GL) management. It helps users make healthier choices without strict calorie counting, guided by "Mio" - a friendly cat persona.

**Mio Health** 是一款由 AI 驱动的可爱营养助手，专注于升糖指数 (GI) 和升糖负荷 (GL) 的管理。在猫咪管家 "Mio" 的陪伴下，帮助用户轻松做出更健康的饮食选择，而不必过度焦虑卡路里。

---

## ✨ Features / 产品功能

### 1. 📸 AI Food Analysis (AI 食物分析)
- **Powered by Gemini 2.5 Flash**: Instantly analyzes food photos to identify ingredients.
- **Cooking Method Detection**: Distinguishes between deep-fried, steamed, or stir-fried to adjust fat/calorie estimates accurately.
- **Portion Estimation**: AI automatically estimates portion sizes based on visual cues.
- **核心技术**: 使用 Gemini 2.5 Flash 模型，不仅能识别食材，还能通过思维链 (CoT) 判断烹饪方式（如区分油炸与清蒸）和估算份量。

### 2. 📉 GI & GL Focus (关注 GI 与 GL)
- **Scientific Metrics**: unlike generic calorie counters, Mio emphasizes **Glycemic Load (GL)** — the metric that actually matters for blood sugar stability.
- **"Dose Makes the Poison"**: Educates users that high GI foods are okay in small portions (Low GL).
- **科学指标**: 不同于普通的卡路里计算器，Mio 强调 **升糖负荷 (GL)**，这是控制血糖和体重的关键指标。Mio 会教你“抛开剂量谈毒性是耍流氓”的道理。

### 3. 👤 Personalized Health Hub (个人健康中心)
- **BMR & TDEE Calculation**: Automatically calculates daily energy limits based on age, gender, height, weight, and activity level.
- **Daily Tracking**: Tracks calories and macros against your daily budget.
- **量身定制**: 根据你的身体数据自动计算基础代谢 (BMR) 和每日总消耗 (TDEE)，并以此设定每日饮食预算。

### 4. 😻 Mio Persona (猫咪管家)
- **Emotional Connection**: Loading screens, error messages, and advice are delivered in the voice of a cute cat.
- **Interactive UI**: Includes an animated SVG cat logo that blinks and reacts.
- **情感化交互**: 加载、报错、建议都以猫咪的口吻呈现，让健康管理变得不再枯燥冰冷。

---

## 🛠️ Tech Stack & Architecture / 技术架构与思路

### Tech Stack (技术栈)
*   **Framework**: React 19 + Vite
*   **Styling**: Tailwind CSS
*   **AI Model**: Google Gemini 2.5 Flash (`@google/genai`)
*   **Language**: TypeScript

### Code Philosophy (代码思路)

1.  **Service Layer (`services/geminiService.ts`)**:
    *   Uses **Chain of Thought (CoT)** prompting. We force the AI to output a `_reasoning` field first. This makes the model "think" about hidden oils or plate sizes *before* outputting numbers, significantly reducing hallucinations.
    *   **服务层**: 采用了“思维链”提示工程。强制 AI 在输出数字前先输出 `_reasoning`（推理过程），让 AI 先思考烹饪方式和份量，从而大幅提高数值准确性。

2.  **Client-Side Persistence (客户端存储)**:
    *   To keep the app lightweight and privacy-focused, all user data (Profiles, Daily Logs) is stored in `localStorage`.
    *   **数据持久化**: 为了保持应用轻量且保护隐私，所有用户档案和每日记录均存储在浏览器本地 (`localStorage`)。

3.  **Component Modularity (组件模块化)**:
    *   `App.tsx`: Acts as the central state manager and router.
    *   `ResultDisplay.tsx`: Handles the complex logic of displaying nutrition cards and calculating totals.
    *   `ImageUploader.tsx`: Manages camera streams and file inputs, compatible with mobile devices.

---

## 🚀 Setup & Usage / 使用指南

### 1. Prerequisites (前置要求)
You need a Google Gemini API Key.
你需要一个 Google Gemini API Key。
👉 [Get API Key via Google AI Studio](https://aistudio.google.com/)

### 2. Installation (安装)

```bash
# Install dependencies / 安装依赖
npm install
```

### 3. Configuration (配置)

The app expects the API Key to be available in the environment variables.
应用需要环境变量中的 API Key。

*   **For Dev**: Create a `.env` file in the root:
    ```
    API_KEY=your_actual_api_key_here
    ```

### 4. Run (运行)

```bash
# Start development server / 启动开发服务器
npm run dev
```

The app will be available at `http://localhost:5173` (or similar).

---

## 📝 License

MIT License.
Made with ❤️ by Mio.

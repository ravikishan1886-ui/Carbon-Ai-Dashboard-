# 🌱 Carbon AI Dashboard - Awareness Platform

An intelligent, interactive web application built for **PromptWars Virtual: Challenge 3**. This platform helps individuals naturally track, evaluate, and minimize their carbon footprint using structured generative insights powered by Google's Gemini AI.

## 🚀 Live Links
* **Deployed Live Interface:** https://carbon-ai-dashboard.vercel.app/
* **Public GitHub Repository:** https://github.com

## ✨ Core Features
* **Natural Language Tracking:** Users can log daily commutes, diet choices, and household energy habits using plain conversational text instead of complex forms.
* **Intelligent JSON Schema Analysis:** Utilizes `gemini-2.5-flash` with precise JSON schema validation (`responseSchema`) to calculate carbon footprint statistics securely.
* **Personalized Reductions:** Dynamically extracts actionable green eco-coach metrics and recommendations targeted to specific high-emission tasks.

## 🛠️ Technical Stack
* **Frontend UI:** React.js, Vite, TypeScript, Tailwind CSS
* **AI Processing Engine:** Google Gen AI SDK (`@google/genai`)
* **AI Foundation Model:** `gemini-2.5-flash`
* **Cloud Hosting Platform:** Vercel

## ⚙️ Local Development Setup

1. **Clone your personal workspace repository:**
   ```bash
   git clone https://github.com.git
   cd Carbon-Ai-Dashboard-
   ```

2. **Install node dependencies:**
   ```bash
   npm install
   ```

3. **Configure your environmental API variables:**
   Create a `.env.local` file in your root folder:
   ```env
   GEMINI_API_KEY=your_google_ai_studio_api_key_here
   ```

4. **Launch development server preview:**
   ```bash
   npm run dev
   ```

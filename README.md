# 🌱 Carbon AI Dashboard - Awareness Platform

Built for **PromptWars Virtual: Challenge 3**, this platform helps individuals naturally track, evaluate, and minimize their carbon footprint using structured generative insights powered by Google's Gemini AI.

## 📸 Dashboard Preview
https://carbon-ai-dashboard.vercel.app/

## 🌍 Problem Statement
Many individuals want to reduce their environmental impact but lack accessible, automated tools to measure dynamic daily choices. **Carbon AI Dashboard** bridges this gap by converting everyday natural language descriptions of meals, commutes, and energy usage into concrete carbon metrics and targeted actionable recommendations.

## 🌐 Live Links
* **Deployed Live Interface:** https://carbon-ai-dashboard.vercel.app/
* **Public GitHub Repository:** https://github.com/ravikishan1886-ui/Carbon-Ai-Dashboard-

## ✨ Core Features
* **Natural Language Tracking:** Users can type out their day naturally instead of navigating tedious form dropdowns.
* **Intelligent JSON Schema Analysis:** Utilizes `gemini-2.5-flash` with strict structured output schema validation.
* **Personalized Reductions:** Pinpoints high-emission daily tasks and generates contextual green alternatives.

## 🏗️ Architecture Workflow
```text
[ User Action Input ] ➔ [ Node Backend API ] ➔ [ Gemini 2.5 Flash Engine ] 
                                                           │
[ Real-time UI Charts ] 🗲 [ Strict JSON Schema Validation ] ┘
```

## 🛠️ Technical Stack
* **Frontend Frame:** React.js, Vite, TypeScript, Tailwind CSS
* **AI Processing SDK:** Google Gen AI SDK (`@google/genai`)
* **Core Foundation Model:** `gemini-2.5-flash`
* **Cloud Hosting:** Vercel

## ⚙️ Local Development Setup

1. **Clone your personal workspace repository:**
   ```bash
   git clone https://github.com/ravikishan1886-ui/Carbon-Ai-Dashboard-.git
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

## 🚀 Future Roadmap
* **Historical Analytics:** Add interactive databases to track carbon history over weeks and months.
* **Gamified Goals:** Introduce community sustainability milestones and Net-Zero badges.
* **Native Mobile App:** Package the layout into a cross-platform mobile utility.

## 🏆 Competition Context
* **Hackathon:** PromptWars Virtual — Main Challenge 3
* **Powered By:** Google AI Studio, Hack2Skill, & Google for Developers

## 👨💻 Author
* **Ravi Kishan**
* **GitHub Profile:** [github.com/ravikishan1886-ui](https://github.com/ravikishan1886-ui)

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

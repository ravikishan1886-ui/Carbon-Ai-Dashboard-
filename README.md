# 🌱 Carbon AI Dashboard - Awareness Platform

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vite.dev)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-3.5_Flash-orange.svg)](https://google.com)

Built for **PromptWars Virtual: Challenge 3**, this platform helps individuals naturally track, evaluate, and minimize their carbon footprint using structured generative insights powered by Google's Gemini AI.

## 📸 Dashboard Preview
https://carbon-ai-dashboard.vercel.app/

## 🏆 Core Highlights
* **Built for Competition:** Engineered explicitly for PromptWars Virtual Challenge 3.
* **Intelligent LLM Engine:** Powered by Google's cutting-edge `gemini-2.5-flash` (using fast `gemini-3.5-flash` in production).
* **Rigid Type Safety:** Strict structured JSON schema validation handles all pipeline data safely.
* **Real-Time Scoring:** Conversational logging converts daily activities instantly into accurate carbon numbers.

## 🌍 Chosen Persona & Vertical
Our solution is focused on the **Sustaina Eco Coach / Awareness Platform** vertical. It targets eco-conscious citizens and everyday commuters who find mechanical forms, dropdowns, and manual logs tiring. By acting as an empathetic, authoritative climate coach, the platform leverages natural conversation to encourage carbon lifestyle adaptation.

## 🧠 Technical Approach & Core Processing Logic
* **Rigorous Structured Outputs**: Rather than relying on loose text, the app declares a strict JSON schema leveraging the `@google/genai` SDK on the backend. This enforces types for variables like `estimatedCarbonKg: number` and `carbonScore: number`, avoiding runtime parsing crashes.
* **Decoupled API Routing**: All prompt configurations stay inside our Node/Express server context securely. This holds the `GEMINI_API_KEY` hidden from the client browser, guarding key assets.
* **Type-Safe Dynamic Scoring**: The frontend translates numeric values into color-coded rankings and point thresholds using modular state machines.

## ⚙️ Detailed Guide: How the Solution Works
1. **Unstructured Inputs**: The user inputs normal texts like: *"I took a train for 15 miles and ate a beef burger."*
2. **Server-Side AI Pipeline**: The Node server receives this activity and passes it to the Gemini API with instructions to return calculated numerical metrics of carbon weights (kg) and sustainability scores.
3. **Data Translation & Chart Mapping**: Metrics are rendered dynamically using a pure SVG-mode line-chart dashboard that tracks consecutive logs, baseline limits, and trends over time.
4. **Interactive Action Board**: Under the "Eco Club," users can check off personalized tips and goals. The frontend instantly re-calculates rewards points based on real accomplishments.
5. **Interactive Chat Companion**: Talk with "Sustaina AI" in a sliding conversation thread to get fast recipes, transit advice, and customized climate planning.

## 📋 Itemized Development Assumptions
* **Baseline Carbon Limit**: Assumed a neutral standard target of **5.0 kg CO₂e** as a healthy threshold per person per day.
* **Default Pre-Seeding**: Standard transport and diet values are pre-seeded in the database simulation to help first-time users evaluate and compare their choices.
* **Rewards Scoring Matrix**:
  * Actionable Tips completion: **+120 Points**
  * Weekly Goals accomplishments: **+250 Points**
  * Badge Milestones unlocked: **+400 Points**

---

## 🛠️ Technical Stack
* **Frontend Frame:** React.js, Vite, TypeScript, Tailwind CSS
* **Test Engine:** Vitest Running Mode
* **AI Processing SDK:** Google Gen AI SDK (`@google/genai`)
* **Core Foundation Model:** `gemini-2.5-flash` / `gemini-3.5-flash`
* **Cloud Hosting:** Cloud Run / Vercel

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
   Create a `.env` file in your root folder:
   ```env
   GEMINI_API_KEY=your_google_ai_studio_api_key_here
   ```

4. **Launch development server preview:**
   ```bash
   npm run dev
   ```

5. **Run the automated unit test suite:**
   ```bash
   npm run test
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
* **GitHub Profile:** https://github.com/ravikishan1886-ui

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

---
⭐ *If you found this project or implementation useful, please consider starring the repository!*

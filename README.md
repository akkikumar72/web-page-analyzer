# 🔍 Web Page Action Analyzer

_Automated web page interaction analysis powered by AI and Playwright_

## 🎥 Demo

<video width="100%" controls>
  <source src="./qa-1757009250665.mp4" type="video/mp4">
  Your browser does not support the video tag. 
  <a href="./qa-1757009250665.mp4">Watch the demo video</a>
</video>

### 📊 What you'll see in the demo:
- 🔗 **URL Input** - Enter any website URL to analyze  
- ⚡ **Auto-Discovery** - Tool finds all interactive elements (buttons, forms, links)
- 🤖 **Smart Interactions** - Playwright clicks and interacts with each element  
- 📸 **Screenshot Capture** - Before/after images of each interaction
- 🧠 **AI Analysis** - OpenAI analyzes what changed and generates annotations
- 📋 **Structured Output** - JSON results ready for testing frameworks

<details>
<summary>📱 <b>Alternative viewing options</b></summary>

**Direct Links:**
- [📺 View on GitHub](https://github.com/user-attachments/assets/qa-1757009250665.mp4)
- [⬇️ Download video](https://github.com/user-attachments/assets/qa-1757009250665.mp4)

**GIF Preview (if video doesn't load):**
*A comprehensive automated workflow showing URL input → element discovery → AI analysis → structured results*

</details>

## 🚀 What it does

This tool automatically:

- 📊 **Discovers** all interactive elements on any web page
- 🤖 **Interacts** with buttons, forms, links, and controls using Playwright
- 📸 **Captures** before/after screenshots of each interaction
- 🧠 **Analyzes** changes using OpenAI to understand what each action does
- 📋 **Generates** structured annotations for QA testing and documentation

Perfect for understanding complex web applications, generating test cases, or documenting user workflows.

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

```bash
# Clone and install dependencies
cd component-analyzer
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Environment Setup

Create `.env.local`:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## 🏃‍♂️ Running

```bash
# Development server
npm run dev

# Production build
npm run build && npm start
```

Open [http://localhost:3000](http://localhost:3000)

## 💡 Usage

1. **Enter URL** - Input any website URL
2. **Analyze** - Click analyze to start automated discovery
3. **Review Results** - See detailed annotations with:
   - Element types and selectors
   - Before/after screenshots
   - AI-powered change analysis
   - Interaction coordinates
   - Confidence scores

## 🎯 Features

- **80+ Interactive Element Types** - Comprehensive selector coverage
- **AI-Powered Analysis** - Understands UI changes contextually
- **Visual Diff Tracking** - Screenshot comparisons
- **Structured Output** - JSON annotations ready for testing frameworks
- **Modern UI** - Clean interface built with Next.js + Tailwind

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Automation**: Playwright
- **AI**: OpenAI GPT-4 with structured outputs
- **Language**: TypeScript


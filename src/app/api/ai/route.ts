import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, packageName, packageDescription } = body;

    if (!action || !packageName) {
      return NextResponse.json(
        { error: "Action and package name are required" },
        { status: 400 }
      );
    }

    let prompt = "";

    if (action === "explain") {
      prompt = `Explain in simple terms what the npm package "${packageName}" does.
      Package description: ${packageDescription || "No description provided"}
      
      Please explain:
      1. What this package does
      2. Why developers need it
      3. Simple usage examples
      
      Write clearly and accessibly, as if explaining to a beginner developer.`;
    } else if (action === "generate") {
      prompt = `Suggest 3-4 interesting project ideas using the npm package "${packageName}".
      Package description: ${packageDescription || "No description provided"}
      
      For each idea, please include:
      1. Project name
      2. Brief description
      3. Main functionality
      4. Target audience
      
      Ideas should be practical and implementable.`;
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'explain' or 'generate'" },
        { status: 400 }
      );
    }

    // Use real Gemini API if key is provided, otherwise use demo
    const isUsingRealAI = !!process.env.GEMINI_API_KEY;
    console.log("🔍 AI Debug:", {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      keyLength: process.env.GEMINI_API_KEY?.length || 0,
      isUsingRealAI,
    });

    let response: string;

    try {
      if (isUsingRealAI) {
        console.log("🤖 Using Gemini AI...");
        response = await callGemini(prompt);
        console.log("✅ Gemini response received");
      } else {
        console.log("🎭 Using demo response...");
        response = await simulateAIResponse(prompt, action, packageName);
      }
    } catch (aiError) {
      console.error("❌ AI generation failed, falling back to demo:", aiError);
      response = await simulateAIResponse(prompt, action, packageName);
    }

    return NextResponse.json({
      success: true,
      response: response,
      isDemo: !isUsingRealAI,
    });
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}

// Real Google Gemini API function
async function callGemini(prompt: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || "No response generated";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI response");
  }
}

// Temporary demo function - replace with real AI API
async function simulateAIResponse(
  prompt: string,
  action: string,
  packageName: string
): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (action === "explain") {
    return `🤖 **Understanding ${packageName}**

This npm package is an important tool for JavaScript developers.

**What it does:** ${packageName} provides a set of functions and components to simplify development.

**Why developers need it:** Developers use this package to accelerate application development and avoid writing repetitive code.

**Usage examples:**
- Integration with React/Vue/Angular applications
- Automation of routine tasks  
- Improving application performance

*Note: This is a demo response. For full functionality, connect a real AI API.*`;
  } else {
    return `🚀 **Project Ideas with ${packageName}**

**1. Smart Dashboard**
- Description: Interactive data management panel
- Features: Data visualization, filters, export
- Audience: Managers and analysts

**2. Mobile-First App**
- Description: Mobile application with modern interface
- Features: Responsive design, push notifications
- Audience: End users

**3. Developer Tool**
- Description: Workflow automation tool
- Features: CLI, IDE integration, reports
- Audience: Developers

**4. E-commerce Solution**
- Description: Online trading platform
- Features: Product catalog, shopping cart, payments
- Audience: Small and medium businesses

*Note: These are demo ideas. For personalized suggestions, connect a real AI API.*`;
  }
}

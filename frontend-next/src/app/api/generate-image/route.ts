import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt/";

const buildCandidateUrls = (prompt: string): string[] => {
    const encodedPrompt = encodeURIComponent(prompt);
    const variants = [
        "width=1024&height=1024",
        "width=1024&height=1024&model=flux",
        "width=1024&height=1024&model=turbo",
        "width=768&height=768&model=flux",
    ];

    return variants.map(
        (query) => `${POLLINATIONS_BASE}${encodedPrompt}?${query}`
    );
};

const extractPrimaryPrompt = (rawPrompt: string): string => {
    const cleaned = rawPrompt.replace(/\r/g, "").trim();
    const quotedMatches = [...cleaned.matchAll(/"([^"\n]{20,320})"/g)]
        .map((match) => match[1]?.trim())
        .filter(
            (segment): segment is string =>
                Boolean(segment) &&
                !/option\s+\d+/i.test(segment) &&
                !/key improvements/i.test(segment)
        );

    if (quotedMatches.length > 0) {
        return quotedMatches[0];
    }

    const usefulLines = cleaned
        .split("\n")
        .map((line) => line.trim())
        .filter(
            (line) =>
                line.length > 0 &&
                !line.startsWith("*") &&
                !line.startsWith("**") &&
                !/option\s+\d+/i.test(line) &&
                !/key improvements/i.test(line)
        );

    const bestLine = usefulLines.find((line) => line.length >= 20);
    if (bestLine) {
        return bestLine.slice(0, 320);
    }

    return cleaned.slice(0, 320);
};

const sanitizePrompt = (value: string): string => {
    return value
        .replace(/\s+/g, " ")
        .replace(/^["'`]|["'`]$/g, "")
        .trim();
};

const refinePrompt = async (
    genAI: GoogleGenerativeAI,
    inputPrompt: string
): Promise<string> => {
    const instruction = [
        "You improve prompts for AI image generation used on t-shirt graphics.",
        "Return ONLY one final prompt line.",
        "Do not include options, bullet points, markdown, explanations, or labels.",
        "Style target: clean, printable t-shirt graphic with strong subject focus.",
        `User prompt: "${inputPrompt}"`,
    ].join(" ");

    const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash-lite"];

    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(instruction);
            const text = sanitizePrompt(result.response.text() || "");
            if (text) {
                return text;
            }
        } catch (error) {
            console.warn(`Prompt refinement failed for ${modelName}`, error);
        }
    }

    return sanitizePrompt(inputPrompt);
};

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        const normalizedPrompt = extractPrimaryPrompt(trimmedPrompt);
        const apiKey = process.env.GEMINI_API_KEY;
        const enhancedPrompt = apiKey
            ? await refinePrompt(new GoogleGenerativeAI(apiKey), normalizedPrompt)
            : sanitizePrompt(normalizedPrompt);
        const imageUrl = buildCandidateUrls(enhancedPrompt)[0];

        return NextResponse.json({ imageUrl, enhancedPrompt });
    } catch (error) {
        console.error("Image generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate image" },
            { status: 500 }
        );
    }
}

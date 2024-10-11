import WebSocket, { WebSocketServer } from "ws";
import express, { Request, Response } from "express";
import http from "http";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import OpenAI from "openai";
import { SpeechClient, protos } from "@google-cloud/speech";
import { insertTranscript } from "./lib/db-server";

dotenv.config(); // Ensure dotenv is loaded

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // Your API key from environment variables
});

// Initialize Google Speech to Text
const client = new SpeechClient();

// Configure Transcription Request
const request: protos.google.cloud.speech.v1.IStreamingRecognitionConfig = {
  config: {
    encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MULAW,
    sampleRateHertz: 8000,
    languageCode: "en-GB",
    model: "telephony",
  },
  interimResults: true,
};

// Global variables
let finalTranscript = "";
let accumulatedTranscript = "";
let fullTranscript = "";
let callStartTime: number | null = null;
let callEndTime: number | null = null;
let callDetails: { callers?: string[] } = {};

// Function to save the transcript to the PostgreSQL database
async function saveTranscriptToDatabase() {
  if (!callStartTime || !callEndTime) {
    console.error("Call start or end time is missing.");
    return;
  }

  const duration = (callEndTime - callStartTime) / 1000; // duration in seconds
  const transcriptData = {
    startTime: new Date(callStartTime).toISOString(),
    endTime: new Date(callEndTime).toISOString(),
    duration: `${duration.toFixed(2)} seconds`,
    callers: callDetails.callers || null, // Set to null if no caller info is available
    transcript: fullTranscript.trim(), // Ensure no trailing whitespace
  };

  try {
    await insertTranscript(transcriptData);
    console.log("Transcript saved to the database.");
  } catch (error) {
    console.error("Error saving transcript to the database:", error);
  }
}

// Function to analyze the transcript for spam detection using OpenAI
async function analyzeForSpam(transcript: string): Promise<string> {
  try {
    const prompt = `Is the following text likely to be part of a spam or fraudulent call? 
                    Please answer with a likelihood rating of Low, Medium, or High.
                    Your answer should start with a one-word sentence response, either "Low.", "Medium.", or "High." 
                    Keep your explanation to just 2-3 sentences. \n\nTranscript: "${transcript}"`;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an assistant that determines if a call is likely spam." },
        { role: "user", content: prompt },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const result = response.choices[0].message?.content.trim() || "Analysis Failed";
    console.log(`Spam Analysis Result: ${result}`);
    return result;
  } catch (error) {
    console.error("Error during spam analysis:", error);
    return "Analysis Failed";
  }
}

// Analyze accumulated transcript every 10 seconds
setInterval(async () => {
  if (accumulatedTranscript.length > 0) {
    const analysisResult = await analyzeForSpam(accumulatedTranscript);
    // Send the analysis result to all WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            event: "spam-analysis",
            result: analysisResult,
          })
        );
      }
    });
    // Clear the accumulated transcript after processing
    accumulatedTranscript = "";
  }
}, 10000); // 10 seconds interval

// WebSocket Connection
wss.on("connection", (ws: WebSocket) => {
  console.log("New Connection Initiated");
  let recognizeStream: protos.google.cloud.speech.v1.StreamingRecognizeRequest | null = null;
  callStartTime = Date.now();
  callDetails = { callers: [] };

  ws.on("message", (message: string) => {
    const msg = JSON.parse(message);
    switch (msg.event) {
      case "connected":
        console.log("A new call has connected.");
        recognizeStream = client
          .streamingRecognize(request)
          .on("error", console.error)
          .on("data", (data) => {
            const isFinal = data.results[0].isFinal;
            const latestTranscript = data.results[0].alternatives[0].transcript;

            if (isFinal) {
              fullTranscript += `${latestTranscript} `;
            } else {
              accumulatedTranscript = latestTranscript;
            }

            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    event: "interim-transcription",
                    text: `${fullTranscript}${accumulatedTranscript}`,
                  })
                );
              }
            });
          });
        break;
      case "start":
        console.log(`Starting Media Stream ${msg.streamSid}`);
        if (msg.accountSid) {
          callDetails.callers = [msg.accountSid];
        }
        break;
      case "media":
        if (recognizeStream) {
          recognizeStream.write(msg.media.payload);
        }
        break;
      case "stop":
        console.log("Call Has Ended");
        if (recognizeStream) {
          recognizeStream.end();
        }
        callEndTime = Date.now();

        if (accumulatedTranscript.length > 0) {
          fullTranscript += `${accumulatedTranscript} `;
          accumulatedTranscript = "";
        }

        saveTranscriptToDatabase();

        finalTranscript = "";
        fullTranscript = "";
        break;
    }
  });
});

// HTTP Request Handling
app.get("/", (req: Request, res: Response) => res.sendFile(path.join(__dirname, "/index.html")));

app.post("/", (req: Request, res: Response) => {
  res.set("Content-Type", "text/xml");

  res.send(`
    <Response>
      <Start>
        <Stream url="wss://${req.headers.host}/"/>
      </Start>
      <Say>Welcome to Mesa Networks. Please start speaking.</Say>
      <Pause length="60" />
    </Response>
  `);
});

console.log("Listening at Port 8080");
server.listen(8080);

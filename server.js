const WebSocket = require("ws");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });
const path = require("path");
const fs = require("fs");
require("dotenv").config(); // Ensure dotenv is loaded
const OpenAI = require("openai");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Your API key from environment variables
});

// Include Google Speech to Text
const speech = require("@google-cloud/speech");
const client = new speech.SpeechClient();

// Configure Transcription Request
const request = {
  config: {
    encoding: "MULAW",
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
let callStartTime = null;
let callEndTime = null;
let callDetails = {};

// Function to save the transcript with additional call details to a JSON file
function saveTranscriptToFile() {
  const duration = (callEndTime - callStartTime) / 1000; // duration in seconds
  const transcriptData = {
    startTime: new Date(callStartTime).toISOString(),
    endTime: new Date(callEndTime).toISOString(),
    duration: `${duration.toFixed(2)} seconds`,
    callers: callDetails.callers,
    transcript: fullTranscript.trim(), // Ensure no trailing whitespace
  };

  fs.writeFileSync(`transcripts/transcript_${Date.now()}.json`, JSON.stringify(transcriptData, null, 2));
  console.log("Transcript saved to file.");
}

// Function to analyze the transcript for spam detection using OpenAI
async function analyzeForSpam(transcript) {
  try {
    const prompt = `Is the following text likely to be part of a spam or fraudulent call? 
                    Please answer with a likelihood rating of Low, Medium, or High.
                    Your answer should start with a one-word sentence response, either "Low.", "Medium.", or "High." 
                    Keep your explanation to just 2-3 sentences. \n\nTranscript: "${transcript}"`;    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an assistant that determines if a call is likely spam." },
        { role: "user", content: prompt }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const result = response.choices[0].message.content.trim();
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
    wss.clients.forEach(client => {
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


wss.on("connection", function connection(ws) {
    console.log("New Connection Initiated");
    let recognizeStream = null;
    callStartTime = Date.now(); // Record the start time of the call
    callDetails = { callers: [] }; // Placeholder for caller information
  
    ws.on("message", function incoming(message) {
      const msg = JSON.parse(message);
      console.log("Incoming Message Json: ", msg);
      switch (msg.event) {
        case "connected":
          console.log(`A new call has connected.`);
          // Create Stream to the Google Speech to Text API
          recognizeStream = client
            .streamingRecognize(request)
            .on("error", console.error)
            .on("data", data => {
              const isFinal = data.results[0].isFinal;
              const latestTranscript = data.results[0].alternatives[0].transcript;
  
              if (isFinal) {
                // Append finalized text to the full transcript
                fullTranscript += latestTranscript + " ";
              } else {
                // Update the accumulated transcript with the latest interim results
                accumulatedTranscript = latestTranscript;
              }
  
              // Send the current transcript to all connected clients
              wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(
                    JSON.stringify({
                      event: "interim-transcription",
                      text: fullTranscript + accumulatedTranscript, // Combine finalized and current interim
                    })
                  );
                }
              });
            });
          break;
        case "start":
          console.log(`Starting Media Stream ${msg.streamSid}`);
          if (msg.accountSid) {
            callDetails.callers = msg.accountSid;
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
            recognizeStream.destroy();
          }
          callEndTime = Date.now(); // Record the end time of the call
  
          // Append the latest accumulated transcript to the full transcript before saving
          if (accumulatedTranscript.length > 0) {
            fullTranscript += accumulatedTranscript + " ";
            accumulatedTranscript = ""; // Clear accumulated transcript after appending
          }
  
          saveTranscriptToFile(); // Save the transcript to a JSON file
  
          // Reset all global variables after saving the transcript
          finalTranscript = "";
          fullTranscript = "";
          break;
      }
    });
  });
  

// // Handle WebSocket Connection
// wss.on("connection", function connection(ws) {
//   console.log("New Connection Initiated");
//   let recognizeStream = null;
//   callStartTime = Date.now(); // Record the start time of the call
//   callDetails = { callers: [] }; // Placeholder for caller information

//   ws.on("message", function incoming(message) {
//     const msg = JSON.parse(message);
//     console.log("Incoming Message Json: ", msg);
//     switch (msg.event) {
//       case "connected":
//         console.log(`A new call has connected.`);
//         // Create Stream to the Google Speech to Text API
//         recognizeStream = client
//           .streamingRecognize(request)
//           .on("error", console.error)
//           .on("data", data => {
//             const isFinal = data.results[0].isFinal;
//             const latestTranscript = data.results[0].alternatives[0].transcript;
//             console.log("Data printout: ", data);

//             if (isFinal) {
//               // Append finalized text to the full transcript
//               fullTranscript += latestTranscript + " ";
//             } else {
//               // Update the accumulated transcript with the latest interim results
//               accumulatedTranscript = latestTranscript;
//             }

//             // Send the current transcript to all connected clients
//             wss.clients.forEach(client => {
//               if (client.readyState === WebSocket.OPEN) {
//                 client.send(
//                   JSON.stringify({
//                     event: "interim-transcription",
//                     text: fullTranscript + accumulatedTranscript, // Combine finalized and current interim
//                   })
//                 );
//               }
//             });
//           });
//         break;
//       case "start":
//         console.log(`Starting Media Stream ${msg.streamSid}`);
//         if (msg.accountSid) {
//           callDetails.callers = msg.accountSid;
//         }
//         break;
//       case "media":
//         if (recognizeStream) {
//           recognizeStream.write(msg.media.payload);
//         }
//         break;
//       case "stop":
//         console.log("Call Has Ended");
//         if (recognizeStream) {
//           recognizeStream.destroy();
//         }
//         callEndTime = Date.now(); // Record the end time of the call
//         saveTranscriptToFile(); // Save the transcript to a JSON file

//         // Reset all global variables after saving the transcript
//         finalTranscript = "";
//         accumulatedTranscript = "";
//         fullTranscript = "";
//         break;
//     }
//   });
// });

// Handle HTTP Request
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "/index.html")));

app.post("/", (req, res) => {
  res.set("Content-Type", "text/xml");

  res.send(`
    <Response>
      <Start>
        <Stream url="wss://${req.headers.host}/"/>
      </Start>
      <Dial>832-269-3801</Dial>
      <Say>Welcome to Mesa Networks. Please start speaking.</Say>
      <Pause length="60" />
    </Response>
  `);
});

console.log("Listening at Port 8080");
server.listen(8080);

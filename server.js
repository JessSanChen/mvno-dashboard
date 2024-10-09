const WebSocket = require("ws");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });
const path = require("path");
const fs = require("fs");
// const { Configuration, OpenAIApi } = require("openai");

require("dotenv").config(); // Ensure dotenv is loaded

// const { pipeline } = require("@huggingface/transformers");

// // Use a global variable to store the text generation pipeline
// let generator;

// // Function to initialize the Hugging Face text generation model
// async function initializeModel() {
//   try {
//     generator = await pipeline("text-generation", "gpt2");
//     console.log("Model loaded successfully.");
//   } catch (error) {
//     console.error("Error loading model:", error);
//   }
// }

// // Initialize the model when the server starts
// initializeModel();

// // Configure OpenAI
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set in the environment
// });
// const openai = new OpenAIApi(configuration);

// New import
const OpenAI = require("openai");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Your API key from environment variables
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
    transcript: finalTranscript,
  };

  fs.writeFileSync(`transcripts/transcript_${Date.now()}.json`, JSON.stringify(transcriptData, null, 2));
  console.log("Transcript saved to file.");
}


// // Function to generate text using the Hugging Face pipeline
// async function generateText(prompt) {
//     if (!generator) {
//       throw new Error("Text generation model is not loaded yet.");
//     }
  
//     const result = await generator(prompt, { max_length: 50, num_return_sequences: 1 });
//     return result[0].generated_text;
//   }
  
// // Use a local text-generation pipeline
// const generateText = async (prompt) => {
//     const generator = pipeline("text-generation", { model: "gpt2" });
//     const result = await generator(prompt, { max_length: 50 });
//     return result[0].text;
//   };

// async function analyzeForSpam(transcript) {
//     const prompt = `Is the following text likely to be spam? Provide a likelihood rating of Low, Medium, or High.\n\n${transcript}`;
//     try {
//         const result = await generateText(prompt);
//         console.log(`Spam Analysis Result: ${result}`);
//         return result;
//     } catch (error) {
//         console.error("Error during spam analysis:", error);
//         return "Analysis Failed";
//     }
// }

// Function to analyze the transcript for spam detection using OpenAI
async function analyzeForSpam(transcript) {
    try {
      const prompt = `Is the following text likely to be part of a spam or fraudulent call? Please answer with a likelihood rating of Low, Medium, or High.\n\nTranscript: "${transcript}"`;
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

// Handle WebSocket Connection
wss.on("connection", function connection(ws) {
  console.log("New Connection Initiated");
  let recognizeStream = null;
  callStartTime = Date.now(); // Record the start time of the call
  callDetails = { callers: [] }; // Placeholder for caller information

  ws.on("message", function incoming(message) {
    const msg = JSON.parse(message);
    switch (msg.event) {
      case "connected":
        console.log(`A new call has connected.`);
        // Create Stream to the Google Speech to Text API
        recognizeStream = client
          .streamingRecognize(request)
          .on("error", console.error)
          .on("data", data => {
            // Get the latest line of transcription
            const latestTranscript = data.results[0].alternatives[0].transcript;
            console.log(`Latest Transcript: ${latestTranscript}`);

            // Accumulate the latest transcript for spam analysis
            accumulatedTranscript += " " + latestTranscript;

            // Update the complete transcript
            finalTranscript = latestTranscript;

            // Send only the latest line to all connected clients
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    event: "interim-transcription",
                    text: latestTranscript, // Send the latest line only
                  })
                );
              }
            });
          });
        break;
      case "start":
        console.log(`Starting Media Stream ${msg.streamSid}`);
        // Update caller information if available
        if (msg.callers) {
          callDetails.callers = msg.callers;
        }
        break;
      case "media":
        // Write Media Packets to the recognize stream
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
        saveTranscriptToFile(); // Save the transcript to a JSON file
        finalTranscript = ""; // Reset the transcript for the next call
        break;
    }
  });
});

// Handle HTTP Request
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "/index.html")));

app.post("/", (req, res) => {
  res.set("Content-Type", "text/xml");

  res.send(`
    <Response>
      <Start>
        <Stream url="wss://${req.headers.host}/"/>
      </Start>
      <Say>I will stream the next 60 seconds of audio through your websocket</Say>
      <Pause length="60" />
    </Response>
  `);
});

console.log("Listening at Port 8080");
server.listen(8080);


// const WebSocket = require("ws");
// const express = require("express");
// const app = express();
// const server = require("http").createServer(app);
// const wss = new WebSocket.Server({ server });
// const path = require("path");
// const fs = require("fs");

// // Include Google Speech to Text
// const speech = require("@google-cloud/speech");
// const client = new speech.SpeechClient();

// // Configure Transcription Request
// const request = {
//   config: {
//     encoding: "MULAW",
//     sampleRateHertz: 8000,
//     languageCode: "en-GB",
//     model: "telephony"
//   },
//   interimResults: true
// };

// // Global variable to store the final transcript
// let finalTranscript = "";
// let callStartTime = null;
// let callEndTime = null;
// let callDetails = {};

// // Function to save the transcript with additional call details to a JSON file
// function saveTranscriptToFile() {
//   const duration = (callEndTime - callStartTime) / 1000; // duration in seconds
//   const transcriptData = {
//     startTime: new Date(callStartTime).toISOString(),
//     endTime: new Date(callEndTime).toISOString(),
//     duration: `${duration.toFixed(2)} seconds`,
//     callers: callDetails.callers,
//     transcript: finalTranscript
//   };

//   fs.writeFileSync(`transcripts/transcript_${Date.now()}.json`, JSON.stringify(transcriptData, null, 2));
//   console.log("Transcript saved to file.");
// }

// // Handle WebSocket Connection
// wss.on("connection", function connection(ws) {
//   console.log("New Connection Initiated");
//   let recognizeStream = null;
//   callStartTime = Date.now(); // Record the start time of the call
//   callDetails = { callers: [] }; // Placeholder for caller information

//   ws.on("message", function incoming(message) {
//     const msg = JSON.parse(message);
//     switch (msg.event) {
//       case "connected":
//         console.log(`A new call has connected.`);
//         // Create Stream to the Google Speech to Text API
//         recognizeStream = client
//           .streamingRecognize(request)
//           .on("error", console.error)
//           .on("data", data => {
//             // Get the latest line of transcription
//             const latestTranscript = data.results[0].alternatives[0].transcript;
//             console.log(`Latest Transcript: ${latestTranscript}`);

//             // Update the complete transcript
//             finalTranscript = latestTranscript;

//             // Send only the latest line to all connected clients
//             wss.clients.forEach(client => {
//               if (client.readyState === WebSocket.OPEN) {
//                 client.send(
//                   JSON.stringify({
//                     event: "interim-transcription",
//                     text: latestTranscript // Send the latest line only
//                   })
//                 );
//               }
//             });
//           });
//         break;
//       case "start":
//         console.log(`Starting Media Stream ${msg.streamSid}`);
//         // Update caller information if available
//         if (msg.callers) {
//           callDetails.callers = msg.callers;
//         }
//         break;
//       case "media":
//         // Write Media Packets to the recognize stream
//         if (recognizeStream) {
//           recognizeStream.write(msg.media.payload);
//         }
//         break;
//       case "stop":
//         console.log(`Call Has Ended`);
//         if (recognizeStream) {
//           recognizeStream.destroy();
//         }
//         callEndTime = Date.now(); // Record the end time of the call
//         saveTranscriptToFile(); // Save the transcript to a JSON file
//         finalTranscript = ""; // Reset the transcript for the next call
//         break;
//     }
//   });
// });

// // Handle HTTP Request
// app.get("/", (req, res) => res.sendFile(path.join(__dirname, "/index.html")));

// app.post("/", (req, res) => {
//   res.set("Content-Type", "text/xml");

//   res.send(`
//     <Response>
//       <Start>
//         <Stream url="wss://${req.headers.host}/"/>
//       </Start>
//       <Say>I will stream the next 60 seconds of audio through your websocket</Say>
//       <Pause length="60" />
//     </Response>
//   `);
// });

// console.log("Listening at Port 8080");
// server.listen(8080);

const WebSocket = require("ws");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });
const path = require("path");
const fs = require("fs");

// Include Google Speech to Text
const speech = require("@google-cloud/speech");
const client = new speech.SpeechClient();

// Configure Transcription Request
const request = {
  config: {
    encoding: "MULAW",
    sampleRateHertz: 8000,
    languageCode: "en-GB",
    model: "telephony"
  },
  interimResults: true
};

// Global variable to store the final transcript
let finalTranscript = "";
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
    transcript: finalTranscript
  };

  fs.writeFileSync(`transcript_${Date.now()}.json`, JSON.stringify(transcriptData, null, 2));
  console.log("Transcript saved to file.");
}

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

            // Update the complete transcript
            finalTranscript = latestTranscript;

            // Send only the latest line to all connected clients
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    event: "interim-transcription",
                    text: latestTranscript // Send the latest line only
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
        console.log(`Call Has Ended`);
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

// //Include Google Speech to Text
// const speech = require("@google-cloud/speech");
// const client = new speech.SpeechClient();

// //Configure Transcription Request
// const request = {
//   config: {
//     encoding: "MULAW",
//     sampleRateHertz: 8000,
//     languageCode: "en-GB",
//     "model": "telephony"
//   },
//   interimResults: true
// };

// // Handle Web Socket Connection
// wss.on("connection", function connection(ws) {
// console.log("New Connection Initiated");

// let recognizeStream = null;

//    ws.on("message", function incoming(message) {
//     const msg = JSON.parse(message);
//     switch (msg.event) {
//       case "connected":
//         console.log(`A new call has connected.`);
//   //Create Stream to the Google Speech to Text API
//   recognizeStream = client
//     .streamingRecognize(request)
//     .on("error", console.error)
//     .on("data", data => {
//       console.log(data.results[0].alternatives[0].transcript);
//       wss.clients.forEach( client => {
//            if (client.readyState === WebSocket.OPEN) {
//              client.send(
//                JSON.stringify({
//                event: "interim-transcription",
//                text: data.results[0].alternatives[0].transcript
//              })
//            );
//          }
//        });

//     });

//         break;
//       case "start":
//         console.log(`Starting Media Stream ${msg.streamSid}`);
//         break;
//       case "media":
//         // Write Media Packets to the recognize stream
//         recognizeStream.write(msg.media.payload);
//         break;
//       case "stop":
//         console.log(`Call Has Ended`);
//         recognizeStream.destroy();
//         break;
//     }
//   });

// });

// //Handle HTTP Request
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
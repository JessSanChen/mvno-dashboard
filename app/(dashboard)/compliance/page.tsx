"use client";

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export default function CustomersPage() {
  const [transcript, setTranscript] = useState<string>("");
  const [spamAnalysis, setSpamAnalysis] = useState<string>("Awaiting Analysis...");

  useEffect(() => {
    const webSocket = new WebSocket('ws://localhost:8080');

    // Listen for incoming WebSocket messages
    webSocket.onmessage = function (msg) {
      const data = JSON.parse(msg.data);
      if (data.event === 'interim-transcription') {
        setTranscript(data.text);
      } else if (data.event === 'spam-analysis') {
        setSpamAnalysis(data.result);
      }
    };

    // Close WebSocket connection when the component is unmounted
    return () => {
      webSocket.close();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Transcription</CardTitle>
        <CardDescription>
          Call your Twilio number, start talking, and watch your words appear in real-time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{transcript}</p>
        <h3>Spam Analysis Result:</h3>
        <p>{spamAnalysis}</p>
      </CardContent>
    </Card>
  );
}


// "use client";

// import { useEffect, useState } from 'react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';

// export default function CustomersPage() {
//   const [transcript, setTranscript] = useState<string>("");

//   useEffect(() => {
//     const webSocket = new WebSocket('ws://localhost:8080');

//     // Listen for incoming WebSocket messages
//     webSocket.onmessage = function (msg) {
//       const data = JSON.parse(msg.data);
//       if (data.event === 'interim-transcription') {
//         // Update the state with the latest transcript, replacing the previous one
//         setTranscript(data.text);
//       }
//     };

//     // Close WebSocket connection when the component is unmounted
//     return () => {
//       webSocket.close();
//     };
//   }, []);

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Live Transcription</CardTitle>
//         <CardDescription>
//           Call your Twilio number, start talking, and watch your words appear in real-time.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         {/* Display the latest line of the transcript */}
//         <p>{transcript}</p>
//       </CardContent>
//     </Card>
//   );
// }


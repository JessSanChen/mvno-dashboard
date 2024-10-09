"use client"; // Add this directive at the top of the file

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export default function CustomersPage() {
  // State to store the real-time transcription data
  const [transcript, setTranscript] = useState<string>("");

  useEffect(() => {
    // Create a WebSocket connection to the Node.js server
    const webSocket = new WebSocket('ws://localhost:8080'); // Ensure this is the correct WebSocket server URL

    // Listen for incoming WebSocket messages
    webSocket.onmessage = function (msg) {
      const data = JSON.parse(msg.data);
      if (data.event === 'interim-transcription') {
        // Update the transcript in the state
        setTranscript((prevTranscript) => prevTranscript + ' ' + data.text);
      }
    };

    // Clean up WebSocket connection when the component unmounts
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
        {/* Display the real-time transcript */}
        <p>{transcript}</p>
      </CardContent>
    </Card>
  );
}




// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';

// export default function CustomersPage() {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Customers</CardTitle>
//         <CardDescription>View all customers and their orders.</CardDescription>
//       </CardHeader>
//       <CardContent></CardContent>
//     </Card>
//   );
// }

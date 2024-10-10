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

  // Determine the color based on spam analysis
  const getAnalysisColor = (analysis: string) => {
    switch (analysis.toLowerCase()) {
      case "high":
        return "bg-red-200 border-red-400";
      case "medium":
        return "bg-yellow-200 border-yellow-400";
      case "low":
        return "bg-gray-200 border-gray-400";
      default:
        return "bg-gray-200 border-gray-400";
    }
  };

  // Get the action text based on spam analysis
  const getActionText = (analysis: string) => {
    switch (analysis.toLowerCase()) {
      case "high":
        return "Fraudulent call likely. Sending text message to associate.";
      case "medium":
        return "Warning: Potential fraudulent call.";
      default:
        return "";
    }
  };

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
    <div className="flex space-x-4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Live Transcription</CardTitle>
          <CardDescription>
            Call your Twilio number, start talking, and watch your words appear in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white p-4">
          <p>{transcript}</p>
        </CardContent>
      </Card>
      <Card className={`flex-1 border ${getAnalysisColor(spamAnalysis.split(".")[0])}`}>
        <CardHeader>
          <CardTitle>Spam Analysis</CardTitle>
          <CardDescription>Risk level based on the conversation.</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold">Risk Level:</h3>
          <p>{spamAnalysis}</p>
          {getActionText(spamAnalysis.split(".")[0]) && (
            <div className="mt-4 p-2 border-t">
              <p className="text-sm font-medium">{getActionText(spamAnalysis.split(".")[0])}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

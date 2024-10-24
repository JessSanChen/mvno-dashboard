"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const countries = [
  { name: "United States", code: "+1", dataPlan: "10GB" },
  { name: "India", code: "+91", dataPlan: "5GB" },
  { name: "United Kingdom", code: "+44", dataPlan: "15GB" },
  { name: "Singapore", code: "+65", dataPlan: "8GB" },
];

interface CallLog {
  date: string;
  destination: string;
  duration: string;
  cost: string;
}

const initialCallLogs: CallLog[] = [
  { date: "2024-10-12", destination: "India", duration: "30 minutes", cost: "$15" },
  { date: "2024-10-11", destination: "United States", duration: "15 minutes", cost: "$5" },
  { date: "2024-10-10", destination: "United Kingdom", duration: "45 minutes", cost: "$20" },
];

export default function Dashboard() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [simNumber, setSimNumber] = useState<string | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>(initialCallLogs);

  const handleSim = () => {
    if (selectedCountry) {
      const countryData = countries.find((country) => country.name === selectedCountry);
      if (countryData) {
        setSimNumber(`${countryData.code} XXXX XXXX`);
      }
    }
  };

  const handleGenerateExpenseReport = () => {
    // Simulate report generation
    alert("Expense report has been generated and sent.");
  };

  return (
    <div className="space-y-8"> {/* Added container div for spacing */}
      <Card>
        <CardHeader>
          <CardTitle>Data Plan Optimization</CardTitle>
          <CardDescription>
            Automatically adjust data plans based on your travel destinations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <select
              className="border p-2 rounded"
              value={selectedCountry || ""}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="" disabled>
                Select a Country
              </option>
              {countries.map((country) => (
                <option key={country.name} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
            <button
              className="mt-4 rounded-md bg-[#c85103] px-3.5 py-2.5 text-sm font-semibold text-white"
              onClick={handleSim}
            >
              Get SIM and Data Plan
            </button>
            {simNumber && (
              <div className="mt-4">
                <p className="font-semibold">Generated SIM: {simNumber}</p>
                <p className="font-semibold">
                  Data Plan: {countries.find((country) => country.name === selectedCountry)?.dataPlan}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Travel Expense Management</CardTitle>
          <CardDescription>
            Automatically generate call logs and expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <table className="min-w-full bg-white border rounded">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Destination</th>
                  <th className="px-4 py-2 border">Duration</th>
                  <th className="px-4 py-2 border">Cost</th>
                </tr>
              </thead>
              <tbody>
                {callLogs.map((log, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border">{log.date}</td>
                    <td className="px-4 py-2 border">{log.destination}</td>
                    <td className="px-4 py-2 border">{log.duration}</td>
                    <td className="px-4 py-2 border">{log.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="mt-4 rounded-md bg-[#c85103] px-3.5 py-2.5 text-sm font-semibold text-white"
              onClick={handleGenerateExpenseReport}
            >
              Generate Expense Report
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

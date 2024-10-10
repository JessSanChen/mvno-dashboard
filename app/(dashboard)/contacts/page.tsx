"use client";

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';


const people = [
    {
      name: 'Pratyush Mallick',
      email: 'pratyush.mallick@mesanetworks.com',
      number: '+1 (469) 449-8399',
      role: 'Co-Founder',
      location: 'Cambridge, MA, U.S.',
      imageUrl:
        '/prat.png',
      lastSeen: '3h ago',
      lastSeenDateTime: '2023-01-23T13:23Z',
    },
    {
      name: 'Jessica Chen',
      email: 'jessica.chen@mesanetworks.com',
      number: '+1 (703) 899-1656',
      location: 'Cambridge, MA, U.S.',
      role: 'Co-Founder',
      imageUrl:
        '/jessica.jpeg',
        // '@/public/test.avif',
      lastSeen: '3h ago',
      lastSeenDateTime: '2023-01-23T13:23Z',
    },
    {
      name: 'Dries Vincent',
      email: 'dries.vincent@mesanetworks.com',
      number: '+1 (201) 433-7121',
      location: 'San Francisco, CA, U.S.',
      role: 'Business Relations',
      imageUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      lastSeen: null,
    },
    {
      name: 'Lindsay Walton',
      email: 'lindsay.walton@mesanetworks.com',
      number: '+886 921234567',
      location: 'Taipei, Taiwan',
      role: 'Front-end Developer',
      imageUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      lastSeen: '3h ago',
      lastSeenDateTime: '2023-01-23T13:23Z',
    },
    {
      name: 'Courtney Henry',
      email: 'courtney.henry@mesanetworks.com',
      number: '+44 808 157 0192',
      location: 'London, United Kingdom',
      role: 'Designer',
      imageUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      lastSeen: '3h ago',
      lastSeenDateTime: '2023-01-23T13:23Z',
    },
    {
      name: 'Tom Cook',
      email: 'tom.cook@mesanetworks.com',
      number: '+1 (630) 344-0185',
      location: 'San Juan, Puerto Rico, U.S.',
      role: 'Director of Product',
      imageUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      lastSeen: null,
    },
  ]
  
  export default function ContactsPage() {
    return (
        <Card>
        <CardHeader>
            <CardTitle>Organization Contacts</CardTitle>
            <CardDescription>
            Skip the VCF hassle and keep track of your colleagues, wherever they go.
            </CardDescription>
        </CardHeader>
        <CardContent>
        <ul role="list" className="divide-y divide-gray-100">
        {people.map((person) => (
          <li key={person.email} className="flex justify-between gap-x-6 py-5">
            <div className="flex min-w-0 gap-x-4 items-center">
              <img alt="" src={person.imageUrl} className="h-12 w-12 flex-none rounded-full bg-gray-50" />
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900">{person.name}</p>
                <p className="mt-1 truncate text-xs leading-5 text-gray-500">{person.email}</p>
                <p className="italic mt-1 truncate text-xs leading-5 text-gray-500">Active: {person.number}</p>
              </div>
            </div>
            <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
              <p className="text-sm leading-6 text-gray-900">{person.role}</p>
              <p className="mt-1 truncate text-xs leading-5 text-gray-500">{person.location}</p>
              {person.lastSeen ? (
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Last seen <time dateTime={person.lastSeenDateTime}>{person.lastSeen}</time>
                </p>
              ) : (
                <div className="mt-1 flex items-center gap-x-1.5">
                  <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xs leading-5 text-gray-500">Online</p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
        </CardContent>
        </Card>
    );
  }
  
// export default function CustomersPage() {
//   const [transcript, setTranscript] = useState<string>("");
//   const [spamAnalysis, setSpamAnalysis] = useState<string>("Awaiting Analysis...");

//   useEffect(() => {
//     const webSocket = new WebSocket('ws://localhost:8080');

//     // Listen for incoming WebSocket messages
//     webSocket.onmessage = function (msg) {
//       const data = JSON.parse(msg.data);
//       if (data.event === 'interim-transcription') {
//         setTranscript(data.text);
//       } else if (data.event === 'spam-analysis') {
//         setSpamAnalysis(data.result);
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
//         <p>{transcript}</p>
//         <h3>Spam Analysis Result:</h3>
//         <p>{spamAnalysis}</p>
//       </CardContent>
//     </Card>
//   );
// }


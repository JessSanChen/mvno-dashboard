

"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export default function ContactsPage() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to control dropdown visibility

  const countries = [
    { name: 'USA', code: 'us', flag: 'https://readymadeui.com/usa_flag.webp', number: '+1 (571) 800-9234' },
    { name: 'England', code: 'uk', flag: 'https://readymadeui.com/uk_flag.webp', number: '+44 20 7946 0958' },
    { name: 'India', code: 'in', flag: 'https://readymadeui.com/india_flag.webp', number: '+91 22 1234 5678' },
    { name: 'Singapore', code: 'sg', flag: 'https://readymadeui.com/singapore_flag.webp', number: '+65 1234 5678' },
  ];

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setPhoneNumber(''); // Reset phone number when a new country is selected
    setDropdownOpen(false); // Collapse the dropdown
  };

  const handleGetSim = () => {
    const country = countries.find((c) => c.name === selectedCountry);
    if (country) {
      setPhoneNumber(country.number);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a Sim</CardTitle>
        <CardDescription>
          No more stopping at the airport to buy a sim, or struggling to get your new e-sim to sync with your usual line. Simply choose a country and add a sim.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative font-[sans-serif] w-max mx-auto">
          <button
            type="button"
            onClick={toggleDropdown}
            className="px-5 py-2.5 rounded text-[#333] text-sm font-semibold border-2 border-blue-600 outline-none hover:bg-blue-50"
          >
            {selectedCountry || 'Country List Dropdown'}
          </button>
          {dropdownOpen && (
            <ul className="absolute block shadow-lg bg-white py-2 px-2 z-[1000] min-w-full w-max rounded max-h-96 overflow-auto">
              {countries.map((country) => (
                <li
                  key={country.code}
                  className="py-2.5 px-4 hover:bg-blue-50 rounded text-black text-sm cursor-pointer"
                  onClick={() => handleCountrySelect(country.name)}
                >
                  <div className="flex items-center">
                    <img src={country.flag} alt={country.name} className="w-6 mr-3" />
                    {country.name}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-6 flex items-center justify-center">
          <button
            onClick={handleGetSim}
            className="mt-4 rounded-md bg-[#c85103] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Get Sim
          </button>
        </div>
        {phoneNumber && (
          <div className="mt-6 text-center text-lg font-bold text-gray-900">
            {phoneNumber}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

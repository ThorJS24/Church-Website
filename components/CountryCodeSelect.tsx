'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const countryCodes = [
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+973', country: 'BH', flag: '🇧🇭' },
  { code: '+20', country: 'EG', flag: '🇪🇬' },
  { code: '+44', country: 'GB', flag: '🇬🇧' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+964', country: 'IQ', flag: '🇮🇶' },
  { code: '+98', country: 'IR', flag: '🇮🇷' },
  { code: '+972', country: 'IL', flag: '🇮🇱' },
  { code: '+962', country: 'JO', flag: '🇯🇴' },
  { code: '+965', country: 'KW', flag: '🇰🇼' },
  { code: '+961', country: 'LB', flag: '🇱🇧' },
  { code: '+94', country: 'LK', flag: '🇱🇰' },
  { code: '+968', country: 'OM', flag: '🇴🇲' },
  { code: '+970', country: 'PS', flag: '🇵🇸' },
  { code: '+974', country: 'QA', flag: '🇶🇦' },
  { code: '+966', country: 'SA', flag: '🇸🇦' },
  { code: '+963', country: 'SY', flag: '🇸🇾' },
  { code: '+90', country: 'TR', flag: '🇹🇷' },
  { code: '+971', country: 'AE', flag: '🇦🇪' },
  { code: '+1', country: 'US', flag: '🇺🇸' }
].sort((a, b) => a.country.localeCompare(b.country))

interface CountryCodeSelectProps {
  value: string
  onChange: (code: string) => void
}

export default function CountryCodeSelect({ value, onChange }: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selected = countryCodes.find(c => c.code === value) || countryCodes[0]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] text-gray-900 dark:text-white"
      >
        <span className="mr-1">{selected.flag}</span>
        <span className="text-sm">{selected.code}</span>
        <ChevronDown className="w-4 h-4 ml-1" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {countryCodes.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => {
                onChange(country.code)
                setIsOpen(false)
              }}
              className="w-full flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 text-gray-900 dark:text-white"
            >
              <span className="mr-2">{country.flag}</span>
              <span>{country.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
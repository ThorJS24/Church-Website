'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({ onSearch, placeholder = "Search...", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
    setIsExpanded(false)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className={`flex items-center transition-all duration-300 ${
        isExpanded ? 'w-full' : 'w-10'
      }`}>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`transition-all duration-300 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
            isExpanded ? 'w-full opacity-100 ml-2' : 'w-0 opacity-0'
          }`}
        />
        
        {query && isExpanded && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  )
}
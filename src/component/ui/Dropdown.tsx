'use client'

import { DownCaretIcon } from '@/icons/DownCaretIcon'
import { UpCaretIcon } from '@/icons/UpCaretIcon'
import { useState, useRef, useEffect } from 'react'

type DropdownOption = {
  label: string
  value: string
}

type DropdownProps = {
  label?: string
  options: DropdownOption[]
  defaultValue?: string
  onChange?: (value: string) => void
  align?: 'left' | 'right'
  width?: string
}

export default function Dropdown({
  label,
  options,
  defaultValue,
  onChange,
  align = 'right',
  width = 'w-48',
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(
    defaultValue ?? options[0]?.value
  )

  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selected = options.find(o => o.value === selectedValue)

  return (
    <div ref={ref} className="relative text-sm">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2 border px-4 py-2 rounded-md bg-white"
      >
        {label && <span className="text-gray-500">{label}</span>}
        <span className="font-medium">{selected?.label}</span>
        <span
          className={`ml-2 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        >
          <UpCaretIcon width={16} height={16} />
        </span>
      </button>

      {open && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'}
          mt-2 ${width} border bg-white rounded-md shadow-md z-20`}
        >
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setSelectedValue(option.value)
                onChange?.(option.value)
                setOpen(false)
              }}
              className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
                option.value === selectedValue
                  ? 'font-medium bg-gray-50'
                  : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

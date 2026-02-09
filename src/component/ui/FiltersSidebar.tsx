'use client'

import { DownCaretIcon } from '@/icons/DownCaretIcon'
import { UpCaretIcon } from '@/icons/UpCaretIcon'
import { useState } from 'react'

type FilterSectionProps = {
  title: string
  children: React.ReactNode
}

function FilterSection({ title, children }: FilterSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-medium uppercase tracking-wide"
      >
        {title}
        <span className="text-lg">{open ? <DownCaretIcon width={24} height={24} /> : <UpCaretIcon width={24} height={24} />}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-2 text-sm text-gray-700">
          {children}
        </div>
      )}
    </div>
  )
}

export default function FiltersSidebar() {
  return (
    <aside className="w-full max-w-[260px]">

      <div className='flex flex-row justify-between items-center p-2'>
        <h3 className="text-sm font-semibold mb-4">Filters</h3>
        <button className="text-sm mb-6 p-0 ">Clear All</button>
      </div>

      <FilterSection title="Gender">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Men
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Women
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Kids
        </label>
      </FilterSection>

      <FilterSection title="Product Category">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Crew Socks
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Ankle Socks
        </label>
      </FilterSection>

      <FilterSection title="Subcategory">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Winter Socks
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Sports Socks
        </label>
      </FilterSection>

      <FilterSection title="Discounts">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> 10% & above
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> 20% & above
        </label>
      </FilterSection>

      <FilterSection title="Shoe Size">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> 6–8
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> 9–11
        </label>
      </FilterSection>

      <FilterSection title="Length">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Ankle
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Crew
        </label>
      </FilterSection>

      <FilterSection title="Color">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Black
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Blue
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Green
        </label>
      </FilterSection>

      <FilterSection title="Pack Type">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Single
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Combo
        </label>
      </FilterSection>

    </aside>
  )
}

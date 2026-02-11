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
          <input type="checkbox" /> Socks
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Underwear
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Belts
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Scarves
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Towels
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Accessories
        </label>
      </FilterSection>

      <FilterSection title="Subcategory">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> New Arrivals
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> All Bamboo Socks
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Trainer Socks
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> No-Show Socks
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Athletic Socks
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Comfort Cuff Socks
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Large Sizes
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Boot Socks
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Gift Boxes & Bundles
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Sock Club
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Best Socks for Men
        </label>
      </FilterSection>

      <FilterSection title="Discounts">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> On Sale
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Clearance
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Percentage Off
        </label>
      </FilterSection>

      <FilterSection title="Shoe Size">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> UK 4–7 (US 5–7.5 / EU 37–40)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> UK 7–11 (US 8–12 / EU 40–47)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> UK 12–15 (US 13–15.5 / EU 47–50)
        </label>
      </FilterSection>

      <FilterSection title="Length">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Ankle
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Calf
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> No-Show
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
          <input type="checkbox" /> Grey
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Blue
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Multicolor
        </label>
      </FilterSection>

      <FilterSection title="Pack Type">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Single Pair
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Multi-Pack
        </label>
      </FilterSection>

    </aside>
  )
}

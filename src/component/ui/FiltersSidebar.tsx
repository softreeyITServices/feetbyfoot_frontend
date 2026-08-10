'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { DownCaretIcon } from '@/icons/DownCaretIcon'
import { UpCaretIcon } from '@/icons/UpCaretIcon'
import { productService } from '@/domain/application/services/product.service'
import { ProductFilterMeta } from '@/domain/shared/types/product.type'

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
        <span className="text-lg">
          {open ? (
            <DownCaretIcon width={24} height={24} />
          ) : (
            <UpCaretIcon width={24} height={24} />
          )}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-2 text-sm text-gray-700">
          {children}
        </div>
      )}
    </div>
  )
}

function isShopRoute(pathname: string | null): boolean {
  if (!pathname) return false
  return pathname === '/shop' || pathname.startsWith('/shop/')
}

const ROUTE_CATEGORY_MAP: Record<string, string> = {
  '/mens': '6a3b7fd8c82609c09f2b7290',
  '/womens': '6a3b7fd8c82609c09f2b7293',
  '/kids': '6a3b7fd8c82609c09f2b728f',
  '/towels': '6a3b7fd8c82609c09f2b7291',
}

export default function FiltersSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const showGenderFilter = isShopRoute(pathname)

  const [filters, setFilters] = useState<ProductFilterMeta | null>(null)

  useEffect(() => {
    const fetchFilters = async () => {
      const data = await productService.getProductFilters()
      setFilters(data)
    }
    fetchFilters()
  }, [])

  if (!filters) return null

  // Get all selected values for a given key as an array
  const getSelected = (key: string): string[] => searchParams.getAll(key)

  const selectedCategoryIds = getSelected('category')
  const routeCategoryId = pathname ? ROUTE_CATEGORY_MAP[pathname] : undefined
  const activeCategoryIds =
    selectedCategoryIds.length > 0
      ? selectedCategoryIds
      : routeCategoryId
        ? [routeCategoryId]
        : []

  const isSelected = (key: string, value: string): boolean =>
    getSelected(key).includes(value)

  // Toggle a value in the multi-select params
  const toggleQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.getAll(key)

    // Remove all existing entries for this key, then re-add minus/plus the toggled value
    params.delete(key)

    if (current.includes(value)) {
      // Deselect: re-add all except this one
      current.filter((v) => v !== value).forEach((v) => params.append(key, v))
    } else {
      // Select: re-add all plus this one
      ;[...current, value].forEach((v) => params.append(key, v))
    }

    params.delete('page') // reset pagination on filter change
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <aside className="w-full">
      <div className="flex flex-row justify-between items-center py-2 px-0">
        <h3 className="text-sm font-semibold mb-4">Filters</h3>
        <button
          className="text-sm mb-6 p-0"
          onClick={() => router.push('?')}
        >
          Clear All
        </button>
      </div>

      {showGenderFilter && (
        <FilterSection title="Gender">
          {filters.genders.map((gender) => (
            <label key={gender} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSelected("gender", gender)}
                onChange={() => toggleQuery("gender", gender)}
              />
              {gender}
            </label>
          ))}
        </FilterSection>
      )}

      <FilterSection title="Product Category">
        {filters.categories.map((category) => (
          <label key={category._id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected('category', category._id)}
              onChange={() => toggleQuery('category', category._id)}
            />
            {category.name}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Subcategory">
        {(activeCategoryIds.length > 0
          ? filters.subcategories.filter(
              (sub) => sub.categoryId && activeCategoryIds.includes(String(sub.categoryId))
            )
          : filters.subcategories
        ).map((sub) => (
          <label key={sub._id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected('subcategory', sub._id)}
              onChange={() => toggleQuery('subcategory', sub._id)}
            />
            {sub.name}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Size">
        {filters.sizes.map((size) => (
          <label key={size} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected('size', size)}
              onChange={() => toggleQuery('size', size)}
            />
            {size}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Color">
        {filters.colors.map((color) => (
          <label key={color} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected('color', color)}
              onChange={() => toggleQuery('color', color)}
            />
            {color}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Pack Type">
        {filters.packTypes.map((pack) => {
          const value = String(pack.value)

          const selectedValue = searchParams.get('isGiftPack')

          return (
            <label key={value} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedValue === value}
                onChange={() => {
                  const params = new URLSearchParams(searchParams.toString())

                  if (selectedValue === value) {
                    params.delete('isGiftPack')
                  } else {
                    params.set('isGiftPack', value)
                  }

                  params.delete('page')
                  router.push(`?${params.toString()}`)
                }}
              />
              {pack.label}
            </label>
          )
        })}
      </FilterSection>

    </aside>
  )
}
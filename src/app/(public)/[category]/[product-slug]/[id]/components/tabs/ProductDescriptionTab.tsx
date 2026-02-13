import { TickIcon } from '@/icons/TickIcon'
import React from 'react'

function ProductDescriptionTab({ description }: { description: string }) {
  return (
    <div className="flex flex-col gap-8">
      <p className='text-[16px]'>
        {description}
      </p>

      {/* <div className="grid md:grid-cols-2 gap-8 text-[16px]">
        <div>
          <h3 className="font-semibold text-green-600 mb-3">
            Key Features
          </h3>
          <ul className="list-inside space-y-2">
            <li className='flex gap-2'><TickIcon width={16} height={16} fill='#000' />Pack of 5 stylish designs</li>
            <li className='flex gap-2'><TickIcon width={16} height={16} fill='#000' />Soft breathable cotton</li>
            <li className='flex gap-2'><TickIcon width={16} height={16} fill='#000' />Skin friendly</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-green-600 mb-3">
            Wash Care Instructions
          </h3>
          <ul className="list-inside space-y-2">
            <li className='flex gap-2'><TickIcon width={16} height={16} fill='#000' />Machine wash cold</li>
            <li className='flex gap-2'><TickIcon width={16} height={16} fill='#000' />Do not bleach</li>
            <li className='flex gap-2'><TickIcon width={16} height={16} fill='#000' />Tumble dry low</li>
          </ul>
        </div>
      </div> */}
    </div>
  )
}

export default ProductDescriptionTab
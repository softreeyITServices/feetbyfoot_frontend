"use client";

import { useEffect, useState } from "react";
import { SectionBannerService } from "@/domain/application/services/admin/sectionBanner.service";

type Props = {
  sectionKey: string;
};

export default function SectionBanner({ sectionKey }: Props) {

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {

    SectionBannerService
      .getBySectionKey(sectionKey)
      .then(setData);

  }, [sectionKey]);

  if (!data.length) return null;

  return (

    <div className="w-full">

      {data.map(x => (

        <img
          key={x._id}
          src={x.image}
          className="w-full object-cover"
        />

      ))}

    </div>

  );

}
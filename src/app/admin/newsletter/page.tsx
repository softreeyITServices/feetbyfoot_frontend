"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { NewsletterAdminService } from "@/domain/application/services/newsletter.service";

type Subscriber = {
  _id: string;
  email: string;
  source?: string;
  createdAt: string;
};

export default function NewsletterPage() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await NewsletterAdminService.getAll();
        setRows(data);
      } catch {
        toast.error("Failed to load subscribers");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Newsletter Subscribers</h1>
      <p className="mb-4 text-sm text-gray-500">{rows.length} subscribers</p>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Email</th>
                <th className="p-3">Source</th>
                <th className="p-3">Subscribed On</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r._id} className="border-t">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.source ?? "-"}</td>
                  <td className="p-3">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    No subscribers yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

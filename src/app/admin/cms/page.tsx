"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CmsService } from "@/domain/application/services/admin/cms.service";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

type Cms = {
  _id: string;
  name: string;
  title: string;
  isActive: boolean;
  createdAt: string;
};

export default function CmsListPage() {
  const [cmsList, setCmsList] = useState<Cms[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  const fetchCms = async () => {
    try {
      setLoading(true);

      const res = await CmsService.getAll();

      // ✅ safe handling
      setCmsList(Array.isArray(res) ? res : []);
    } catch (error) {
      toast.error("Failed to fetch CMS pages");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    try {
      if (!confirm("Delete this page?")) return;

      await CmsService.delete(id);

      toast.success("Deleted successfully");
      fetchCms();
    } catch {
      toast.error("Failed to delete");
    }
  };

  useEffect(() => {
    fetchCms();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">CMS Pages</h1>
          <p className="text-gray-500 text-sm">
            Manage static pages (Privacy, Terms, FAQ, etc.)
          </p>
        </div>

        {/* ✅ CREATE LINK */}
        <Link
          href="/admin/cms/create"
          className="px-5 py-2.5 bg-black text-white rounded-xl shadow hover:opacity-90"
        >
          + New Page
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Created</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : cmsList.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  No pages found
                </td>
              </tr>
            ) : (
              cmsList.map((cms) => (
                <tr
                  key={cms._id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  {/* NAME */}
                  <td className="p-4 font-medium capitalize">
                    {cms.name.replaceAll("_", " ")}
                  </td>

                  {/* TITLE */}
                  <td className="p-4">{cms.title}</td>

                  {/* STATUS */}
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        cms.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {cms.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* CREATED */}
                  <td className="p-4 text-center">
                    {new Date(cms.createdAt).toLocaleDateString()}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                      {/* ✅ EDIT LINK (IMPORTANT FIX) */}
                      <Link
                        href={`/admin/cms/create?name=${encodeURIComponent(
                          cms.name
                        )}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </Link>

                      {/* DELETE */}
                      <button
                        onClick={() => handleDelete(cms._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
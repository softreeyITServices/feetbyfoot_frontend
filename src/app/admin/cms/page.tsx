"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CmsService } from "@/domain/application/services/admin/cms.service";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { isGetRequestError } from "@/lib/httpClientError";

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
      if (!isGetRequestError(error)) {
        toast.error("Failed to fetch CMS pages");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE ACTIVE/INACTIVE ================= */
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await CmsService.update(id, { isActive: newStatus });
      toast.success(`Status changed to ${newStatus ? "Active" : "Inactive"}`);
      setCmsList((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isActive: newStatus } : item
        )
      );
    } catch {
      toast.error("Failed to update status");
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

                  {/* STATUS TOGGLE */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(cms._id, cms.isActive)}
                      title={`Click to set ${cms.isActive ? "Inactive" : "Active"}`}
                      className={`px-3 py-1 text-xs rounded-full font-medium transition-colors duration-150 cursor-pointer flex items-center justify-center gap-1.5 mx-auto border ${
                        cms.isActive
                          ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          cms.isActive ? "bg-green-600" : "bg-gray-400"
                        }`}
                      />
                      {cms.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* CREATED */}
                  <td className="p-4 text-center">
                    {new Date(cms.createdAt).toLocaleDateString()}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {/* EDIT LINK */}
                      <Link
                        href={`/admin/cms/create?name=${encodeURIComponent(
                          cms.name
                        )}`}
                        className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Edit Page"
                      >
                        <Pencil size={18} />
                      </Link>

                      {/* ACTIVE / INACTIVE BUTTON */}
                      <button
                        onClick={() => handleToggleStatus(cms._id, cms.isActive)}
                        className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                          cms.isActive
                            ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                            : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        }`}
                      >
                        Set {cms.isActive ? "Inactive" : "Active"}
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

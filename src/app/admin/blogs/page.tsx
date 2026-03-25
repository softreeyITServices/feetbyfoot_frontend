"use client";

import { useEffect, useState } from "react";
import { BlogService } from "@/domain/application/services/admin/blog.service";
import Link from "next/link";

type Blog = {
  _id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
};

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await BlogService.getAll({ page: 1, limit: 20 });
      setBlogs(res.items || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog?")) return;
    await BlogService.delete(id);
    fetchBlogs();
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Blogs</h1>
          <p className="text-gray-500 text-sm">Manage your blog content</p>
        </div>

        <Link href="/admin/blogs/create" className="px-5 py-2.5 bg-black text-white rounded-xl shadow hover:opacity-90">
          + New Blog
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Created</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center">Loading...</td>
              </tr>
            ) : blogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center">No blogs found</td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog._id} className="border-t border-gray-300 hover:bg-gray-50">
                  <td className="p-4 font-medium">{blog.title}</td>

                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 text-xs rounded-full ${blog.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {blog.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-center space-x-4">
                    <Link href={`/admin/blogs/create?blogId=${blog._id}`} className="text-blue-600">Edit</Link>
                    <button onClick={() => handleDelete(blog._id)} className="text-red-600">Delete</button>
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
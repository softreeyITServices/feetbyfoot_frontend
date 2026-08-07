import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { X, UploadCloud, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { uploadService } from "@/domain/application/services/upload.service";
import { productService } from "@/domain/application/services/product.service";
import { CreateProductPayload, ProductSize } from "@/domain/shared/types/product.type";

interface ImportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportProductsModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportProductsModalProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  if (!isOpen) return null;

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const toSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            resolve(rows as any[]);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
      } else {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data as any[]),
          error: (error) => reject(error),
        });
      }
    });
  };

  const processImport = async () => {
    if (!csvFile) {
      toast.error("Please select a file first");
      return;
    }

    setLoading(true);
    setProgress("Parsing file...");

    try {
      const rows = await parseFile(csvFile);
      if (!rows || rows.length === 0) {
        throw new Error("File is empty or could not be parsed");
      }

      // Group rows by Handle or Name
      const groupedProducts: Record<string, any[]> = {};
      rows.forEach((row, index) => {
        const handle = row.Handle || row.Name;
        if (!handle) {
          throw new Error(`Row ${index + 1} is missing Handle or Name`);
        }
        if (!groupedProducts[handle]) {
          groupedProducts[handle] = [];
        }
        groupedProducts[handle].push(row);
      });

      setProgress("Uploading matching images...");
      const imageMap = new Map<string, string>(); // Original filename -> Cloud URL

      // Helper to upload or get from map
      const getOrUploadImage = async (filename: string): Promise<string> => {
        const trimmed = String(filename || "").trim();
        if (!trimmed) return "";
        if (trimmed.startsWith("http")) return trimmed; // Already a URL
        if (imageMap.has(trimmed)) return imageMap.get(trimmed)!;

        // Find file in uploaded images
        const file = imageFiles.find((f) => f.name === trimmed);
        if (!file) {
          console.warn(`Image file not found for filename: ${trimmed}`);
          return "";
        }

        try {
          const url = await uploadService.uploadFile(file);
          imageMap.set(trimmed, url);
          return url;
        } catch (err) {
          console.error(`Failed to upload ${trimmed}`, err);
          return "";
        }
      };

      const payloads: CreateProductPayload[] = [];
      const handles = Object.keys(groupedProducts);
      let processed = 0;

      for (const handle of handles) {
        const groupRows = groupedProducts[handle];
        const firstRow = groupRows[0];

        setProgress(`Processing product ${++processed} of ${handles.length}...`);

        // Parse Base Images
        const baseImageNames = firstRow.BaseImageUrls ? String(firstRow.BaseImageUrls).split(",").map((s: string) => s.trim()) : [];
        const baseImageUrls = await Promise.all(baseImageNames.map(getOrUploadImage));
        const validBaseImages = baseImageUrls.filter(url => url.length > 0);

        // Parse Sizes
        const sizes: ProductSize[] = await Promise.all(
          groupRows.map(async (row) => {
            const specificImageNames = row.SpecificImageUrls ? String(row.SpecificImageUrls).split(",").map((s: string) => s.trim()) : [];
            const specificImageUrls = await Promise.all(specificImageNames.map(getOrUploadImage));
            const validSpecificImages = specificImageUrls.filter(url => url.length > 0);

            return {
              size: String(row.Size || "").toUpperCase(),
              color: String(row.Color || ""),
              sku: String(row.VariantSKU || row.Variant_SKU || row.VariantSku || row.sku || "").trim(),
              quantity: Number(row.Quantity || 0),
              isActive: row.IsActive ? String(row.IsActive).toLowerCase() === "true" || String(row.IsActive) === "1" : true,
              title: String(row.SpecificTitle || ""),
              description: String(row.SpecificDescription || ""),
              imageUrls: validSpecificImages,
            };
          })
        );

        // Filter out empty sizes
        const validSizes = sizes.filter(s => s.size && s.color);
        const colors = [...new Set(validSizes.map(s => s.color as string))];

        const name = String(firstRow.Name || "").trim();
        const slug = String(firstRow.Handle || toSlug(name)).trim();
        const sku = String(firstRow.SKU || firstRow.Sku || firstRow.sku || "").trim();

        if (!name) continue; // Skip invalid

        const payload: CreateProductPayload = {
          name,
          slug,
          sku,
          description: String(firstRow.Description || ""),
          brand: String(firstRow.Brand || ""),
          price: Number(firstRow.Price || 0),
          salePrice: Number(firstRow.SalePrice || 0),
          currency: String(firstRow.Currency || "INR"),
          categoryId: String(firstRow.Category_ID || ""),
          categoryTypeId: String(firstRow.CategoryType_ID || ""),
          categoryTypeIds: firstRow.CategoryType_ID ? [String(firstRow.CategoryType_ID)] : [],
          color: colors[0] || "",
          colors,
          sizes: validSizes,
          imageUrls: validBaseImages,
          gender: firstRow.Gender ? String(firstRow.Gender).split(",").map((s: string) => s.trim()) : [],
          tags: firstRow.Tags ? String(firstRow.Tags).split(",").map((s: string) => s.trim()) : [],
          isActive: firstRow.IsActive ? String(firstRow.IsActive).toLowerCase() === "true" || String(firstRow.IsActive) === "1" : true,
          length: String(firstRow.Length || ""),
          isFeatured: false,
          isNewArrival: false,
          isBestseller: false,
          isGiftPack: false,
          gstRate: Number(firstRow.GSTRate || 18),
        };

        payloads.push(payload);
      }

      if (payloads.length === 0) {
        throw new Error("No valid products found to import");
      }

      setProgress(`Sending ${payloads.length} products to database...`);
      await productService.createBulk({ products: payloads });

      toast.success(`Successfully imported ${payloads.length} products!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.data?.message && Array.isArray(error.data.message)) {
        toast.error(
          <div className="max-w-md">
            <p className="font-bold mb-1">Validation Errors:</p>
            <ul className="list-disc pl-4 text-xs space-y-1">
              {error.data.message.map((msg: string, i: number) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>,
          { duration: 10000 }
        );
      } else {
        toast.error(error.data?.message || error.message || "Failed to process file");
      }
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-800">Bulk Import Products</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-700">
              1. Upload Data File (CSV or Excel)
            </label>
            <div className="relative border-2 border-dashed border-neutral-200 rounded-xl p-4 text-center hover:bg-neutral-50 transition-colors">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleCsvUpload}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="mx-auto text-neutral-400 mb-2" size={24} />
              {csvFile ? (
                <p className="text-sm text-green-600 font-medium">{csvFile.name}</p>
              ) : (
                <p className="text-sm text-neutral-500">Click or drag CSV or Excel (.xlsx) file here</p>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              Ensure it matches the expected template format (.csv, .xlsx, .xls).
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-700">
              2. Upload Matching Images
            </label>
            <div className="relative border-2 border-dashed border-neutral-200 rounded-xl p-4 text-center hover:bg-neutral-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesUpload}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="mx-auto text-neutral-400 mb-2" size={24} />
              {imageFiles.length > 0 ? (
                <p className="text-sm text-green-600 font-medium">
                  {imageFiles.length} images selected
                </p>
              ) : (
                <p className="text-sm text-neutral-500">Click or drag all image files here</p>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              Select all image files from your computer that are referenced in the CSV (e.g. red-sock.jpg).
            </p>
          </div>

          {progress && (
            <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              {progress}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-800 hover:bg-neutral-200 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={processImport}
            disabled={loading || !csvFile}
            className="px-6 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading ? "Importing..." : "Start Import"}
          </button>
        </div>
      </div>
    </div>
  );
}

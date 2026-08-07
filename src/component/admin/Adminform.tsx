"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Check,
  AlertCircle,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

export type FieldType =
  | "text"
  | "email"
  | "number"
  | "tel"
  | "url"
  | "password"
  | "textarea"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "date"
  | "color"
  | "file"
  | "image"
  | "sizes";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  accept?: string;
  multiple?: boolean;
  hint?: string;
  validate?: (value: unknown) => string | null;
  cols?: 1 | 2;
  allowCustom?: boolean;
}

export interface AdminFormProps {
  title?: string;
  description?: string;
  fields: FormField[];
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  onValuesChange?: (
    values: Record<string, unknown>,
    previousValues: Record<string, unknown>
  ) => Record<string, unknown> | void;
}

/* =========================================================
   FILE PREVIEW
========================================================= */


function getDisplayFileName(fileUrl: string) {
  const trimmed = fileUrl.trim();
  if (!trimmed) return "image";

  const decodeValue = (value: string) => {
    try {
      return decodeURIComponent(value.replace(/\+/g, " ")).trim();
    } catch {
      return value.trim();
    }
  };

  const cleanup = (value: string) =>
    value.replace(/[?#].*$/, "").replace(/&text=.*$/i, "").trim();

  try {
    const parsed = new URL(
      trimmed,
      typeof window !== "undefined" ? window.location.origin : "http://localhost"
    );

    const paramName =
      parsed.searchParams.get("filename") ||
      parsed.searchParams.get("fileName") ||
      parsed.searchParams.get("name") ||
      parsed.searchParams.get("text");

    if (paramName) {
      const cleanedParamName = cleanup(decodeValue(paramName));
      if (cleanedParamName) return cleanedParamName;
    }

    const pathTail = decodeValue(parsed.pathname.split("/").pop() ?? "");
    const embeddedText = /(?:\?|&)text=([^&#]+)/i.exec(pathTail)?.[1];
    if (embeddedText) {
      const cleanedEmbeddedText = cleanup(decodeValue(embeddedText));
      if (cleanedEmbeddedText) return cleanedEmbeddedText;
    }

    const cleanedPathTail = cleanup(pathTail);
    return cleanedPathTail || "image";
  } catch {
    const tail = decodeValue(trimmed.split("/").pop() ?? trimmed);
    const embeddedText = /(?:\?|&)text=([^&#]+)/i.exec(tail)?.[1];
    if (embeddedText) {
      const cleanedEmbeddedText = cleanup(decodeValue(embeddedText));
      if (cleanedEmbeddedText) return cleanedEmbeddedText;
    }

    const cleanedTail = cleanup(tail);
    return cleanedTail || "image";
  }
}

function FilePreview({
  file,
  onRemove,
  isBase = false,
  onSetBase,
}: {
  file: File | string;
  onRemove: () => void;
  isBase?: boolean;
  onSetBase?: () => void;
}) {
  const isString = typeof file === "string";
  const [imgError, setImgError] = useState(false);

  const isImage = isString
    ? true
    : file.type?.startsWith("image/");

  const url = isString
    ? file
    : isImage
      ? URL.createObjectURL(file)
      : null;

  const showImage = isImage && url && !imgError;

  return (
    <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 group">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={isString ? "image" : (file as globalThis.File).name}
          className="w-8 h-8 rounded-lg object-cover shrink-0"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
          <ImageIcon size={14} className="text-blue-400" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-neutral-700 truncate">
          {isString ? getDisplayFileName(file) : file.name}
        </p>

        {!isString && (
          <p className="text-[10px] text-neutral-400">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {onSetBase && (
          isBase ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
              Base
            </span>
          ) : (
            <button
              type="button"
              onClick={onSetBase}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 hover:bg-amber-100 hover:text-amber-700 transition-all"
            >
              Set base
            </button>
          )
        )}

        <button
          type="button"
          onClick={onRemove}
          className="w-5 h-5 rounded-full bg-neutral-200 hover:bg-red-100 hover:text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
        >
          <X size={10} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   DROP ZONE
========================================================= */

function DropZone({
  field,
  value,
  onChange,
  error,
}: {
  field: FormField;
  value: (File | string)[];
  onChange: (files: (File | string)[]) => void;
  error?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isImage = field.type === "image";

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (!field.multiple) {
        if (files[0]) onChange([files[0]]);
      } else {
        onChange([...value, ...files]);
      }
    },
    [value, field.multiple, onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!field.multiple) {
      if (files[0]) onChange([files[0]]);
    } else {
      onChange([...value, ...files]);
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
          ${dragging
            ? "border-amber-400 bg-amber-50/60"
            : "border-neutral-200 hover:border-amber-300 hover:bg-neutral-50"
          }
          ${error ? "border-red-300" : ""}`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${dragging ? "bg-amber-100" : "bg-neutral-100"
            }`}
        >
          <Upload
            size={18}
            className={dragging ? "text-amber-500" : "text-neutral-400"}
          />
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-neutral-700">
            Drop {isImage ? "images" : "files"} here, or{" "}
            <span className="text-amber-600 underline underline-offset-2">
              browse
            </span>
          </p>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            {field.accept
              ? `Accepted: ${field.accept}`
              : "All file types accepted"}
            {field.multiple ? " · Multiple allowed" : " · Single file only"}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={field.accept}
          multiple={field.multiple}
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {value.length > 0 && (
        <div className="mt-2 flex flex-col gap-1.5">
          {value.map((file, i) => (
            <FilePreview
              key={`${typeof file === "string" ? file : file.name}-${i}`}
              file={file}
              isBase={isImage && i === 0}
              onSetBase={
                isImage && i > 0
                  ? () => {
                    const next = [...value];
                    const [selected] = next.splice(i, 1);
                    next.unshift(selected);
                    onChange(next);
                  }
                  : undefined
              }
              onRemove={() =>
                onChange(value.filter((_, idx) => idx !== i))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MultiSelectInput({
  field,
  value,
  onChange,
  error,
}: {
  field: FormField;
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!wrapperRef.current || !target) return;
      if (!wrapperRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = field.options ?? [];
  const selectedValues = Array.isArray(value) ? value : [];

  // When options change (e.g. category switch filters subcategories), remove
  // any selected values that are no longer present in the new options list.
  useEffect(() => {
    if (selectedValues.length === 0 || options.length === 0) return;
    const valid = selectedValues.filter((v) =>
      options.some((opt) => opt.value === v)
    );
    if (valid.length !== selectedValues.length) {
      onChangeRef.current(valid);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = normalizedQuery
    ? options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(normalizedQuery) ||
        opt.value.toLowerCase().includes(normalizedQuery)
    )
    : options;

  const toggleValue = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter((v) => v !== optionValue));
      return;
    }
    onChange([...selectedValues, optionValue]);
  };

  const toTitleCase = (input: string) =>
    input
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .map((word) =>
        word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""
      )
      .join(" ");

  const addCustomValue = () => {
    const customValue = toTitleCase(query);
    if (!customValue) return;
    const alreadyExists = selectedValues.some(
      (value) => value.toLowerCase() === customValue.toLowerCase()
    );
    if (alreadyExists) {
      setQuery("");
      return;
    }
    onChange([...selectedValues, customValue]);
    setQuery("");
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full min-h-9 px-3 py-1.5 text-xs rounded-xl border transition-all text-left
          ${error
            ? "border-red-300 bg-red-50/30"
            : "border-neutral-200 bg-neutral-50 hover:border-amber-300"
          }`}
      >
        {selectedValues.length === 0 ? (
          <span className="text-neutral-400">
            {field.placeholder ?? "Select options"}
          </span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selectedValues.map((selected) => {
              const label =
                options.find((opt) => opt.value === selected)?.label ?? selected;
              return (
                <span
                  key={selected}
                  className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2.5 py-1 text-[11px] font-medium"
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}
      </button>

      <ChevronDown
        size={13}
        className="absolute right-3 top-4 -translate-y-1/2 text-neutral-400 pointer-events-none"
      />

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-52 overflow-auto rounded-xl border border-neutral-200 bg-white shadow-lg p-1">
          {field.allowCustom && (
            <div className="px-1 pb-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomValue();
                  }
                }}
                placeholder="Type and press Enter to add"
                className="w-full h-8 px-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="px-2 py-1.5 text-[11px] text-neutral-400">
              {field.allowCustom && query.trim()
                ? `Press Enter to add "${query.trim()}"`
                : "No options available"}
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const checked = selectedValues.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleValue(opt.value)}
                  className={`w-full px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors
                    ${checked
                      ? "bg-amber-50 text-amber-700"
                      : "hover:bg-neutral-50 text-neutral-700"
                    }`}
                >
                  <span
                    className={`h-3.5 w-3.5 rounded border flex items-center justify-center
                      ${checked
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-neutral-300"
                      }`}
                  >
                    {checked ? <Check size={10} /> : null}
                  </span>
                  {opt.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function ColorFieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const datalistId = `color-options-${field.key}`;
  const currentValue = (value ?? "").toString();
  const pickerValue = currentValue.startsWith("#") ? currentValue : "#000000";

  return (
    <div className="space-y-2">
      <div
        className={`w-full min-h-9 px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all
          ${error
            ? "border-red-300 bg-red-50/30"
            : "border-neutral-200 bg-neutral-50 focus-within:border-amber-400 focus-within:bg-white"
          }`}
      >
        <span
          className="h-4 w-4 rounded-full border border-neutral-300 shrink-0"
          style={{ backgroundColor: currentValue || "transparent" }}
        />

        <input
          type="text"
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "Search or type color name/hex"}
          list={datalistId}
          className="w-full bg-transparent text-xs focus:outline-none"
        />

        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-8 p-0 border-0 bg-transparent cursor-pointer"
          aria-label="Pick color"
        />
      </div>

      {field.options?.length ? (
        <datalist id={datalistId}>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </datalist>
      ) : null}
    </div>
  );
}

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "FREE"];

/* =========================================================
   SIZES INPUT
========================================================= */

type SizeRow = {
  size: string;
  sku?: string;
  quantity: number;
  isActive: boolean;
  color: string;
  title: string;
  description: string;
  imageUrls: (File | string)[];
};

function SizesFieldInput({
  value,
  onChange,
  error,
  colorOptions,
}: {
  value: unknown;
  onChange: (v: SizeRow[]) => void;
  error?: string;
  colorOptions?: FieldOption[];
}) {
  const rows: SizeRow[] = Array.isArray(value)
    ? value.map((item) => ({
        size: String(item.size ?? ""),
        sku: String(item.sku ?? ""),
        quantity: Number(item.quantity) || 0,
        isActive: item.isActive !== false,
        color: String(item.color ?? ""),
        title: String(item.title ?? ""),
        description: String(item.description ?? ""),
        imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [],
      }))
    : [];

  const emptyRow: SizeRow = { size: "", sku: "", quantity: 0, isActive: true, color: "", title: "", description: "", imageUrls: [] };
  const nextRows = rows.length > 0 ? rows : [emptyRow];

  const updateRow = (index: number, patch: Partial<SizeRow>) => {
    const updated = nextRows.map((row, idx) =>
      idx === index ? { ...row, ...patch } : row
    );
    onChange(updated);
  };

  const addRow = () => {
    onChange([...nextRows, { ...emptyRow }]);
  };

  const removeRow = (index: number) => {
    const updated = nextRows.filter((_, idx) => idx !== index);
    onChange(updated.length > 0 ? updated : [{ ...emptyRow }]);
  };

  return (
    <div
      className={`rounded-xl border p-3 space-y-3 ${
        error ? "border-red-300 bg-red-50/20" : "border-neutral-200 bg-neutral-50/70"
      }`}
    >
      {nextRows.map((row, index) => (
        <div
          key={`size-row-${index}`}
          className="bg-white border border-neutral-200 rounded-xl p-3 relative space-y-4"
        >
          <div className="flex flex-col md:flex-row gap-3 pr-8 items-start md:items-end">
            <div className="flex-1 min-w-[100px]">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Color
              </label>
              {colorOptions?.length ? (
                <div className="relative">
                  <select
                    value={row.color}
                    onChange={(e) => updateRow(index, { color: e.target.value })}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-none focus:border-amber-400 appearance-none pr-7 cursor-pointer"
                  >
                    <option value="" disabled>Select</option>
                    {colorOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              ) : (
                <input
                  type="text"
                  value={row.color}
                  onChange={(e) => updateRow(index, { color: e.target.value })}
                  placeholder="e.g. Red"
                  className="w-full h-9 px-3 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-none focus:border-amber-400"
                />
              )}
            </div>

            <div className="flex-1 min-w-[80px]">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Size
              </label>
              <div className="relative">
                <select
                  value={row.size}
                  onChange={(e) => updateRow(index, { size: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-none focus:border-amber-400 appearance-none pr-7 cursor-pointer"
                >
                  <option value="" disabled>Select</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="FREE">FREE</option>
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 min-w-[110px]">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Variant SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={row.sku || ""}
                onChange={(e) => updateRow(index, { sku: e.target.value })}
                placeholder="e.g. FBF-001-RED-M"
                className="w-full h-9 px-3 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="w-24 shrink-0 min-w-[80px]">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Qty
              </label>
              <input
                type="number"
                min="0"
                value={row.quantity}
                onChange={(e) => updateRow(index, { quantity: parseInt(e.target.value) || 0 })}
                className="w-full h-9 px-2.5 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="w-24 shrink-0 min-w-[80px]">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Active
              </label>
              <label className="flex items-center h-9 px-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                <input
                  type="checkbox"
                  checked={row.isActive}
                  onChange={(e) => updateRow(index, { isActive: e.target.checked })}
                  className="w-3.5 h-3.5 text-amber-500 rounded border-neutral-300 focus:ring-amber-500 cursor-pointer"
                />
                <span className="ml-2 text-xs font-medium text-neutral-700">
                  {row.isActive ? "Yes" : "No"}
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
            {/* Title */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Specific Title
              </label>
              <input
                type="text"
                value={row.title}
                onChange={(e) => updateRow(index, { title: e.target.value })}
                placeholder="Leave blank to use default name"
                className="w-full h-9 px-3 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
             {/* Description */}
             <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Specific Description
              </label>
              <textarea
                value={row.description}
                onChange={(e) => updateRow(index, { description: e.target.value })}
                placeholder="Leave blank to use default description"
                rows={3}
                className="w-full py-2.5 px-3 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
            
            {/* Images */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Specific Images
              </label>
              <DropZone
                field={{ key: "images", type: "image", label: "Images", multiple: true }}
                value={row.imageUrls}
                onChange={(files) => updateRow(index, { imageUrls: files })}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeRow(index)}
            className="absolute top-2 right-2 h-7 w-7 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-all flex items-center justify-center"
            aria-label={`Remove size row ${index + 1}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="h-8 px-3 rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-600 hover:border-amber-300 hover:text-amber-700 transition-all inline-flex items-center gap-1.5"
      >
        <Plus size={13} />
        Add size
      </button>
      {error && <p className="text-xs text-red-500 font-medium pl-1">{error}</p>}
    </div>
  );
}

/* =========================================================
   FIELD INPUT
========================================================= */

function FieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: FormField;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
}) {
  const base = `w-full h-9 px-3 text-xs rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/20
    ${error
      ? "border-red-300 bg-red-50/30"
      : "border-neutral-200 bg-neutral-50 focus:border-amber-400 focus:bg-white"
    }`;

  /* ================= FILE / IMAGE ================= */
  if (field.type === "file" || field.type === "image") {
    return (
      <DropZone
        field={field}
        value={((value as (File | string)[]) ?? []).filter((f) => typeof f !== "string" || f.trim() !== "")}
        onChange={onChange as (files: (File | string)[]) => void}
        error={error}
      />
    );
  }

  /* ================= TEXTAREA ================= */
  if (field.type === "textarea") {
    return (
      <textarea
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={4}
        className={`${base} h-auto py-2.5 resize-none`}
      />
    );
  }

  /* ================= SELECT ================= */
  if (field.type === "select") {
    return (
      <div className="relative">
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} appearance-none pr-8 cursor-pointer`}
        >
          <option value="" disabled>
            {field.placeholder ?? "Select an option"}
          </option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        />
      </div>
    );
  }

  /* ================= MULTISELECT ================= */
  if (field.type === "multiselect") {
    return (
      <MultiSelectInput
        field={field}
        value={(value as string[]) ?? []}
        onChange={(next) => onChange(next)}
        error={error}
      />
    );
  }

  /* ================= RADIO ================= */
  if (field.type === "radio") {
    return (
      <div className="flex flex-col gap-2">
        {field.options?.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer"
          >
            <input
              type="radio"
              name={field.key}
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 accent-amber-500 border-neutral-300"
            />
            {opt.label}
          </label>
        ))}
      </div>
    );
  }

  /* ================= CHECKBOX ================= */
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300 accent-amber-500"
        />
        {field.placeholder || field.label}
      </label>
    );
  }

  /* ================= NUMBER ================= */
  if (field.type === "number") {
    return (
      <input
        type="number"
        value={(value as number | string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={base}
      />
    );
  }

  /* ================= COLOR ================= */
  if (field.type === "color") {
    return (
      <ColorFieldInput
        field={field}
        value={(value as string) ?? ""}
        onChange={(next) => onChange(next)}
        error={error}
      />
    );
  }

  /* ================= SIZES ================= */
  if (field.type === "sizes") {
    return (
      <SizesFieldInput
        value={value}
        onChange={onChange as (v: SizeRow[]) => void}
        error={error}
        colorOptions={field.options}
      />
    );
  }

  /* ================= DEFAULT INPUT ================= */
  return (
    <input
      type={field.type}
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className={base}
    />
  );
}

/* =========================================================
   MAIN FORM
========================================================= */

export function AdminForm({
  title = "",
  description,
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = "Save",
  onValuesChange,
}: AdminFormProps) {
  const [values, setValues] =
    useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] =
    useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: string, value: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      const transformed = onValuesChange?.(next, prev);
      return transformed ?? next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };


  console.log("fields", fields);

console.log("values",values)

  const validate = () => {
    const errs: Record<string, string> = {};
    for (const field of fields) {
      const v = values[field.key];

      if (field.required) {
        if (
          v === undefined ||
          v === null ||
          v === "" ||
          (Array.isArray(v) && v.length === 0)
        ) {
          errs[field.key] = `${field.label} is required`;
          continue;
        }
      }

      if (field.validate) {
        const msg = field.validate(v);
        if (msg) errs[field.key] = msg;
      }
    }
    return errs;
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setErrors({
        _form: "Submission failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border-neutral-100 overflow-hidden">
      {title || description ?
        <div className='px-6 py-4 border-b border-neutral-100'>
          {
            title && <h2 className="text-sm font-semibold text-neutral-800">
              {title}
            </h2>
          }

          {description && (
            <p className="text-xs text-neutral-400 mt-0.5">
              {description}
            </p>
          )}
        </div> : null}

      <form onSubmit={handleSubmit} noValidate>
        <div className="px-6 py-5 grid grid-cols-2 gap-x-5 gap-y-4">
          {fields.map((field) => (
            <div
              key={field.key}
              className={
                field.cols === 1 || !field.cols
                  ? "col-span-2 sm:col-span-1"
                  : "col-span-2"
              }
            >
              {field.type !== "checkbox" && (
                <label className="block text-[11px] font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-0.5">
                      *
                    </span>
                  )}
                </label>
              )}

              <FieldInput
                field={field}
                value={values[field.key]}
                onChange={(v) => set(field.key, v)}
                error={errors[field.key]}
              />

              {errors[field.key] && (
                <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={10} />
                  {errors[field.key]}
                </p>
              )}
            </div>
          ))}
        </div>

        {errors._form && (
          <div className="mx-6 mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
            <AlertCircle size={13} />
            {errors._form}
          </div>
        )}

        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between gap-3">
          <div>
            {submitted && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <Check
                  size={13}
                  className="bg-emerald-500 text-white rounded-full p-0.5"
                />
                Saved successfully!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="h-8 px-4 text-xs font-medium text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-all"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="h-8 px-5 text-xs font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {submitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
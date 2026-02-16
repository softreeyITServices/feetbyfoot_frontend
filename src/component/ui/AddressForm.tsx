"use client";

import { useState } from "react";
import { AddressType } from "@/domain/shared/types/address.types";
import { AddressService } from "@/domain/application/services/address.service";

type Props = {
  type: AddressType;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function AddressForm({
  type,
  onSuccess,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saveAsShippingAlso, setSaveAsShippingAlso] = useState(false);


  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
    latitude: 0,
    longitude: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.fullName) newErrors.fullName = "Full name required";
    if (!/^[0-9]{10}$/.test(form.phone))
      newErrors.phone = "Valid 10 digit phone required";
    if (!form.addressLine1) newErrors.addressLine1 = "Address required";
    if (!form.city) newErrors.city = "City required";
    if (!form.state) newErrors.state = "State required";
    if (!/^[0-9]{6}$/.test(form.pincode))
      newErrors.pincode = "Valid 6 digit pincode required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type: inputType, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      await AddressService.create({
        ...form,
        type,
        country: "India",
      });

      if (type === "Billing" && saveAsShippingAlso) {
        await AddressService.create({
          ...form,
          type: "Shipping",
          country: "India",
        });
      }

      onSuccess();
    } catch (err) {
      console.error("Address create failed", err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400";

  return (
    <div className="space-y-4">

      <div>
        <input
          name="fullName"
          placeholder="Full Name"
          onChange={handleChange}
          className={inputClass}
        />
        {errors.fullName && (
          <p className="text-xs text-red-500 mt-1">
            {errors.fullName}
          </p>
        )}
      </div>

      <div>
        <input
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
          className={inputClass}
        />
        {errors.phone && (
          <p className="text-xs text-red-500 mt-1">
            {errors.phone}
          </p>
        )}
      </div>

      <div>
        <input
          name="addressLine1"
          placeholder="Address Line 1"
          onChange={handleChange}
          className={inputClass}
        />
        {errors.addressLine1 && (
          <p className="text-xs text-red-500 mt-1">
            {errors.addressLine1}
          </p>
        )}
      </div>

      <input
        name="addressLine2"
        placeholder="Address Line 2 (Optional)"
        onChange={handleChange}
        className={inputClass}
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          name="city"
          placeholder="City"
          onChange={handleChange}
          className={inputClass}
        />
        <input
          name="state"
          placeholder="State"
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <input
          name="pincode"
          placeholder="Pincode"
          onChange={handleChange}
          className={inputClass}
        />
        {errors.pincode && (
          <p className="text-xs text-red-500 mt-1">
            {errors.pincode}
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isDefault"
          onChange={handleChange}
        />
        Set as default
      </label>

      {type === "Billing" && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={saveAsShippingAlso}
            onChange={(e) => setSaveAsShippingAlso(e.target.checked)}
          />
          Save this as Shipping address also
        </label>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg text-sm font-medium disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Address"}
        </button>
      </div>
    </div>
  );
}

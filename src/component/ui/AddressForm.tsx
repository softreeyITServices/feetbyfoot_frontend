"use client";

import { useState, useEffect } from "react";
import { AddressType } from "@/domain/shared/types/address.types";
import { AddressService } from "@/domain/application/services/address.service";
import { DeliveryService } from "@/domain/application/services/delivery.service";

type Props = {
  type: AddressType;
  addressId?: string;
  initialData?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  };
  onSuccess: () => void;
  onCancel: () => void;
};

export default function AddressForm({
  type,
  addressId,
  initialData,
  onSuccess,
  onCancel,
}: Props) {
  const isEditing = !!addressId;
  const [loading, setLoading] = useState(false);
  const [saveAsShippingAlso, setSaveAsShippingAlso] = useState(false);
  const [serviceable, setServiceable] = useState<boolean | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: initialData?.fullName ?? "",
    phone: initialData?.phone ?? "",
    addressLine1: initialData?.addressLine1 ?? "",
    addressLine2: initialData?.addressLine2 ?? "",
    city: initialData?.city ?? "",
    state: initialData?.state ?? "",
    pincode: initialData?.pincode ?? "",
    isDefault: initialData?.isDefault ?? false,
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    const checkPin = async () => {
      if (/^[0-9]{6}$/.test(form.pincode)) {
        try {
          setCheckingPincode(true);
          setServiceError(null);
          const res = await DeliveryService.checkServiceability(form.pincode);
          const isServiceable = !!(res.delivery_codes && res.delivery_codes.length > 0);
          setServiceable(isServiceable);
          if (!isServiceable) {
            setErrors(prev => ({ ...prev, pincode: "Sorry, delivery is not available at this pincode" }));
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.pincode;
              return newErrors;
            });
          }
        } catch (err) {
          console.error("Pincode check failed", err);
          setServiceable(null);
          setServiceError("We're having trouble verifying your pincode. You can try saving, or try again later.");
        } finally {
          setCheckingPincode(false);
        }
      } else {
        setServiceable(null);
      }
    };

    checkPin();
  }, [form.pincode]);

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
    else if (serviceable === false)
      newErrors.pincode = "Sorry, delivery is not available at this pincode";
      
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

      if (isEditing) {
        await AddressService.update(addressId, {
          ...form,
          type,
          country: "India",
        });
      } else {
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
      }

      onSuccess();
    } catch (err: any) {
      console.error("Address save failed", err);
      
      // Check if it's a serviceability error from the backend
      const backendMessage = err.response?.data?.message;
      let errorMsg = "Something went wrong while saving. Please check your details.";
      
      if (backendMessage && backendMessage.includes("not serviceable")) {
        errorMsg = "Sorry, we cannot deliver to this pincode. Please try another one.";
      } else if (err.response?.status === 401 || err.response?.status === 500) {
        errorMsg = "We're experiencing a technical issue with our delivery partner. Please try again in a few minutes.";
      }

      setErrors(prev => ({ ...prev, global: errorMsg }));
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
          value={form.fullName}
          onChange={handleChange}
          className={inputClass}
        />
        {errors.fullName && (
          <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
        )}
      </div>

      <div>
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className={inputClass}
        />
        {errors.phone && (
          <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
        )}
      </div>

      <div>
        <input
          name="addressLine1"
          placeholder="Address Line 1"
          value={form.addressLine1}
          onChange={handleChange}
          className={inputClass}
        />
        {errors.addressLine1 && (
          <p className="text-xs text-red-500 mt-1">{errors.addressLine1}</p>
        )}
      </div>

      <input
        name="addressLine2"
        placeholder="Address Line 2 (Optional)"
        value={form.addressLine2}
        onChange={handleChange}
        className={inputClass}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className={inputClass}
          />
          {errors.city && (
            <p className="text-xs text-red-500 mt-1">{errors.city}</p>
          )}
        </div>
        <div>
          <input
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            className={inputClass}
          />
          {errors.state && (
            <p className="text-xs text-red-500 mt-1">{errors.state}</p>
          )}
        </div>
      </div>

      <div>
        <input
          name="pincode"
          placeholder="Pincode"
          value={form.pincode}
          onChange={handleChange}
          maxLength={6}
          className={`${inputClass} ${
            serviceable === true ? "border-green-500 focus:ring-green-400" : 
            serviceable === false || serviceError ? "border-red-500 focus:ring-red-400" : ""
          }`}
        />
        {checkingPincode && <p className="text-[10px] text-gray-500 mt-1 animate-pulse">Checking availability...</p>}
        {serviceable === true && <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">✅ Delivery Available</p>}
        {serviceError && <p className="text-[10px] text-red-500 mt-1">⚠️ {serviceError}</p>}
        {errors.pincode && !serviceError && (
          <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>
        )}
      </div>

      {errors.global && (
        <div className="bg-red-50 border border-red-200 p-2 rounded-lg">
          <p className="text-xs text-red-600 font-medium">{errors.global}</p>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isDefault"
          checked={form.isDefault}
          onChange={handleChange}
        />
        Set as default
      </label>

      {type === "Billing" && !isEditing && (
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
          disabled={loading || checkingPincode || serviceable === false}
          className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : isEditing ? "Update Address" : "Save Address"}
        </button>
      </div>
    </div>
  );
}

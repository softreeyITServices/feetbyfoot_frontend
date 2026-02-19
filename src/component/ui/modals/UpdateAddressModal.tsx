"use client";

import { useEffect, useState } from "react";
import Modal from "../Modal";
import { Address } from "@/domain/shared/types/address.types";
import { AddressService } from "@/domain/application/services/address.service";
import { ordersService } from "@/domain/application/services/order.service";

interface UpdateAddressModalProps {
  open: boolean;
  orderId: string;
  currentAddressId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateAddressModal({
  open,
  orderId,
  currentAddressId,
  onClose,
  onSuccess,
}: UpdateAddressModalProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch addresses when modal opens
  useEffect(() => {
    if (!open) return;

    const fetchAddresses = async () => {
      try {
        setFetching(true);
        const data = await AddressService.getAll();
        setAddresses(data);

        if (currentAddressId) {
          setSelectedAddressId(currentAddressId);
        }
      } catch (err) {
        setError("Failed to load addresses.");
      } finally {
        setFetching(false);
      }
    };

    fetchAddresses();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId) {
      setError("Please select an address");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await ordersService.updateOrderAddress(
        orderId,
        selectedAddressId
      );

      onSuccess();
    } catch (err) {
      setError("Failed to update address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedAddressId("");
      setError(null);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Update Delivery Address">
      {fetching ? (
        <div className="py-6 text-center">Loading addresses...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {addresses.map((address) => (
              <label
                key={address._id}
                className={`block border p-4 rounded-lg cursor-pointer transition-all ${selectedAddressId === address._id
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <input
                  type="radio"
                  value={address._id}
                  checked={selectedAddressId === address._id}
                  onChange={(e) =>
                    setSelectedAddressId(e.target.value)
                  }
                  className="mr-2"
                  disabled={loading}
                />
                <div className="text-sm">
                  <p className="font-medium">
                    {address.fullName}
                  </p>
                  <p>
                    {address.addressLine1}, {address.city}
                  </p>
                  <p>
                    {address.state} - {address.pincode}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !selectedAddressId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              {loading ? "Updating..." : "Update Address"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

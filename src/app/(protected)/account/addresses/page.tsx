"use client";

import { useEffect, useState } from "react";
import { RefundsIcon } from "@/icons/RefundsIcon";
import { ReturnShippingIcon } from "@/icons/ReturnShippingIcon";
import { TipsIcon } from "@/icons/TipsIcon";
import { AddressService } from "@/domain/application/services/address.service";
import { Address, AddressType } from "@/domain/shared/types/address.types";
import { AddressCard, EmptyCard } from "@/component/ui/AddressCard";
import AddressModal from "@/component/ui/AddressModal";
import { useLayout } from "@/domain/application/context/LayoutContext";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<AddressType | null>(null);

  const { setTitle, setSubtitle } = useLayout();

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    setTitle('My Address');
    setSubtitle('View and manage your address.');
  }, []);

  const openModal = (type: AddressType) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await AddressService.getAll();
      setAddresses(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to load addresses", error);
      setAddresses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await AddressService.update(id, { isDefault: true });
      await fetchAddresses();
    } catch (error) {
      console.error("Failed to set default", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await AddressService.delete(id);
      await fetchAddresses();
    } catch (error) {
      console.error("Failed to set default", error);
    }
  };

  const billingAddresses = addresses.filter(
    (addr) => addr.type === "Billing"
  );

  const shippingAddresses = addresses.filter(
    (addr) => addr.type === "Shipping"
  );

  return (
    <div className="pt-4 pb-8 sm:py-8">
      <div className="max-w-6xl mx-auto px-0 sm:px-4">

        {loading ? (
          <p>Loading addresses...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* BILLING COLUMN */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <RefundsIcon />
                <h2 className="font-semibold text-gray-800">
                  Billing Addresses
                </h2>
              </div>

              {/* Add Button Row */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">
                  {billingAddresses ? billingAddresses.length : 0} saved
                </span>

                <button
                  onClick={() => openModal('Billing')}
                  className="text-sm bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-md font-medium"
                >
                  + Add Billing Address
                </button>
              </div>
              {billingAddresses && billingAddresses.length === 0 ? (
                <EmptyCard
                  type="Billing"
                />
              ) : (
                billingAddresses && billingAddresses.map((address) => (
                  <AddressCard
                    key={address._id}
                    address={address}
                    onSetDefault={handleSetDefault}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>

            {/* SHIPPING COLUMN */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <ReturnShippingIcon />
                <h2 className="font-semibold text-gray-800">
                  Shipping Addresses
                </h2>
              </div>

              {/* Add Button Row */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">
                  {shippingAddresses ? shippingAddresses.length : 0} saved
                </span>

                <button
                  onClick={() => openModal('Shipping')}
                  className="text-sm bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-md font-medium"
                >
                  + Add Shipping Address
                </button>
              </div>

              {shippingAddresses && shippingAddresses.length === 0 ? (
                <EmptyCard
                  type="Shipping"
                />
              ) : (
                shippingAddresses && shippingAddresses.map((address) => (
                  <AddressCard
                    key={address._id}
                    address={address}
                    onSetDefault={handleSetDefault}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>

          </div>
        )}

        {/* Address Tips */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <TipsIcon className="mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Address Tips
              </h3>

              <ul className="text-md text-gray-700 space-y-2 list-disc pl-5">
                <li>Make sure your billing address matches your payment method</li>
                <li>Shipping address should be where you want your orders delivered</li>
                <li>You can set different billing and shipping addresses</li>
                <li>These addresses will be used as defaults during checkout</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
      <AddressModal
        open={isModalOpen}
        type={selectedType}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAddresses}
      />
    </div>
  );
}

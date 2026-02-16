import { Address } from "@/domain/shared/types/address.types";

type AddressCardProps = {
  address: Address;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void; // 👈 add this
};

type EmptyCardProps = {
  type: string;
};

export function AddressCard({ address, onSetDefault, onDelete }: AddressCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-800">
          {address.fullName}
        </h3>

        {address.isDefault && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Default
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm">
        {address.addressLine1}
        {address.addressLine2 && `, ${address.addressLine2}`}
      </p>
      <p className="text-gray-600 text-sm">
        {address.city}, {address.state} - {address.pincode}
      </p>
      <p className="text-gray-600 text-sm mb-4">
        Phone: {address.phone}
      </p>
      <div className="flex gap-4 justify-between">
        {!address.isDefault && (
          <button
            onClick={() => onSetDefault(address._id)}
            className="text-sm bg-green-600 text-white px-4 py-2 rounded-md font-medium"
          >
            Set as Default
          </button>
        )}

        <button
          onClick={() => onDelete(address._id)}
          className="text-sm bg-red-500 text-white py-2 px-4 rounded-md font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export function EmptyCard({ type }: EmptyCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
      <p className="text-gray-500 mb-4">
        No {type} address found.
      </p>
    </div>
  );
}

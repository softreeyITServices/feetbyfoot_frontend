"use client";

import AddressForm from "./AddressForm";
import { AddressType } from "@/domain/shared/types/address.types";
import Modal from "./Modal";

type Props = {
  open: boolean;
  type: AddressType | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddressModal({
  open,
  type,
  onClose,
  onSuccess,
}: Props) {
  if (!type) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Add ${type} Address`}
    >
      <AddressForm
        type={type}
        onSuccess={() => {
          onSuccess();
          onClose();
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}

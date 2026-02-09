interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
}

export default function Input({ label, required, ...props }: Props) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
      />
    </div>
  );
}

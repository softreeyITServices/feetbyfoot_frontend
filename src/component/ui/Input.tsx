interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
}

export default function Input({
  label,
  required,
  error,
  ...props
}: Props) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        {...props}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.name}-error` : undefined}
        className={`w-full px-3 py-2 text-sm focus:outline-none 
          border ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-black"
          }`}
      />

      {error && (
        <p
          id={`${props.name}-error`}
          className="text-xs text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}

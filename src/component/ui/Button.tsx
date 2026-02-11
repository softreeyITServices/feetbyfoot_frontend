interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, disabled, ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        bg-black text-white px-6 py-2 text-sm
        hover:opacity-90
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {children}
    </button>
  );
}

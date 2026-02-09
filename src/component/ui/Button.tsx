interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, ...props }: Props) {
  return (
    <button
      {...props}
      className="bg-black text-white px-6 py-2 text-sm hover:opacity-90"
    >
      {children}
    </button>
  );
}

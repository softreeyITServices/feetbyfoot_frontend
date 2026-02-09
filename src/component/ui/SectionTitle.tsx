interface Props {
  title: string;
}

export default function SectionTitle({ title }: Props) {
  return (
    <div className="text-center my-10">
      <span className="inline-block bg-yellow-400 px-8 py-2 text-xl font-bold">
        {title}
      </span>
    </div>
  );
}

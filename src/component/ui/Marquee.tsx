export const SimpleMarquee = ({ text }: { text: string }) => (
  <div className="marquee-container bg-yellow-400 p-4 text-xl">
    <div className="marquee-content">
      {/* Content repeated twice for a seamless loop */}
      <span>{text}</span>
      <span>{text}</span>
      <span>{text}</span>
      <span>{text}</span>
      <span>{text}</span>
      <span>{text}</span>
    </div>
  </div>
);
interface ScreenshotProps {
  src: string;
  alt: string;
  title: string;
  type: "before" | "after";
}

export function Screenshot({ src, alt, title, type }: ScreenshotProps) {
  const bgColor = type === "before" ? "bg-warning/10" : "bg-success/10";
  const borderColor =
    type === "before" ? "border-warning/20" : "border-success/20";

  return (
    <div className={`${bgColor} p-6 rounded-xl border ${borderColor}`}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-3 h-3 ${
            type === "before" ? "bg-warning" : "bg-success"
          } rounded-full`}
        ></div>
        <h4 className="font-bold text-sm text-base-content">{title}</h4>
      </div>

      <div className="avatar w-auto h-auto">
        <div className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <img src={src} alt={alt} className="w-full h-32 object-cover" />
        </div>
      </div>
    </div>
  );
}

interface TechDetailsProps {
  selector: string;
  coordinates: {
    x: number;
    y: number;
  };
}

export function TechDetails({ selector, coordinates }: TechDetailsProps) {
  return (
    <div className="mockup-code w-full bg-primary/10 text-primary-content text-sm">
      <pre data-prefix="🧷" className="text-info">
        <code>selector: {selector}</code>
      </pre>
      <pre data-prefix="🎯" className="text-success">
        <code>
          position: ({coordinates.x}, {coordinates.y})
        </code>
      </pre>
    </div>
  );
}

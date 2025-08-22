interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  accent?: boolean;
}

export default function FeatureCard({ 
  icon, 
  title, 
  description, 
  accent = false 
}: FeatureCardProps) {
  return (
    <div className="glass p-6 hover:transform hover:scale-105 transition-all duration-200">
      <div className="flex flex-col items-center text-center space-y-4">
        <span className={`material-symbols-outlined icon-xl ${
          accent ? 'text-orange-500' : 'text-gray-400'
        }`}>
          {icon}
        </span>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm opacity-90 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
import Image from 'next/image';

interface PersonaCardProps {
  name: string;
  title: string;
  image: string;
  challenge?: string;
  solution?: string;
  result: string;
  quote: string;
  number?: number;
  compact?: boolean;
}

export default function PersonaCard({ 
  name, 
  title, 
  image, 
  challenge, 
  solution, 
  result, 
  quote,
  number,
  compact = false
}: PersonaCardProps) {
  if (compact) {
    return (
      <div className="glass p-8 text-center">
        {/* Number Badge */}
        {number && (
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 text-white rounded-full font-bold text-lg mb-6">
            {number}
          </div>
        )}
        
        {/* Large Image */}
        <div className="mb-6">
          <Image
            src={image}
            alt={name}
            width={120}
            height={120}
            className="rounded-full border-4 border-orange-500 mx-auto shadow-lg"
          />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">{name}</h3>
            <p className="text-orange-500 font-semibold text-lg">{title}</p>
          </div>

          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="material-symbols-outlined text-green-400 icon-md">
                  trending_up
                </span>
                <span className="font-semibold text-green-400 text-lg">Achievement</span>
              </div>
              <p className="font-medium text-base">{result}</p>
            </div>

            <blockquote className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="italic text-base leading-relaxed">"{quote}"</p>
            </blockquote>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Image
          src={image}
          alt={name}
          width={64}
          height={64}
          className="rounded-full border-2 border-orange-500"
        />
        <div>
          <h3 className="text-xl font-semibold">{name}</h3>
          <p className="text-orange-500 font-medium">{title}</p>
        </div>
      </div>

      {/* Journey */}
      <div className="space-y-4">
        {challenge && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="material-symbols-outlined text-red-400 icon-sm">
                problem
              </span>
              <span className="font-medium text-red-400">Challenge</span>
            </div>
            <p className="text-sm opacity-90">{challenge}</p>
          </div>
        )}

        {solution && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="material-symbols-outlined text-blue-400 icon-sm">
                lightbulb
              </span>
              <span className="font-medium text-blue-400">Solution</span>
            </div>
            <p className="text-sm opacity-90">{solution}</p>
          </div>
        )}

        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="material-symbols-outlined text-green-400 icon-sm">
              trending_up
            </span>
            <span className="font-medium text-green-400">Result</span>
          </div>
          <p className="text-sm opacity-90">{result}</p>
        </div>
      </div>

      {/* Quote */}
      <blockquote className="mt-6 pt-4 border-t border-white/10">
        <p className="italic text-sm opacity-90">"{quote}"</p>
      </blockquote>
    </div>
  );
}
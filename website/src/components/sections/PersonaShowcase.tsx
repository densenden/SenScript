'use client';

import PersonaCard from '../ui/PersonaCard';

const personas = [
  {
    name: 'Sarah Chen',
    title: 'Software Engineer',
    image: '/images/sarah.png',
    challenge: 'Stuck at senior level for 2+ years, struggling with system design interviews and lacking senior-level communication patterns',
    solution: 'Used SenScript during architecture reviews to capture senior-level communication patterns and strategic decision-making processes',
    result: '127 Strategic Cards → Senior Promotion in 6 months, significant salary increase',
    quote: 'I captured patterns in how senior engineers explain trade-offs during architecture reviews. SenScript turned complex technical discussions into interview-winning knowledge cards.',
    number: 1
  },
  {
    name: 'Marcus Rodriguez',
    title: 'Senior PM at Notion',
    image: '/images/marcus.png',
    challenge: 'Startup PM wanting to move to big tech, struggled with articulating strategic thinking at executive level',
    solution: 'Used SenScript during executive meetings, customer calls, and competitor analysis sessions to capture strategic insights',
    result: '203 Strategy Cards → Landed Senior PM role at Notion, led $2M product launch',
    quote: 'SenScript captured executive-level insights that became my interview advantage. Every customer call became strategic ammunition for my next interview.',
    number: 2
  },
  {
    name: 'Lisa Weber',
    title: 'Research Scientist at DeepMind',
    image: '/images/lisa.png',
    challenge: 'PhD candidate struggling to synthesize 4 years of research into coherent defense narrative',
    solution: 'SenScript transformed advisor meetings and research discussions into structured knowledge cards with clear academic narratives',
    result: '156 Research Cards → Successfully defended PhD → DeepMind Research Scientist',
    quote: 'Advisor meetings became structured study materials that turned scattered insights into a coherent academic story. SenScript made the impossible possible.',
    number: 3
  }
];

export default function PersonaShowcase() {
  return (
    <section className="content-max-width-large">
      <div className="glass p-8 rounded-3xl">
        <div className="content-center space-large">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="material-symbols-outlined icon-xl text-orange-500">
              rocket_launch
            </span>
            <h2 className="text-3xl font-bold">Career Transformation Stories</h2>
          </div>
          <p className="text-xl opacity-80 max-w-3xl mx-auto">
            Real professionals who used SenScript's CheatCard technology to unlock career-changing opportunities.
            From stuck to promoted, from interviews to offers.
          </p>
        </div>

        {/* Success Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-4xl font-bold text-green-400 mb-2">486</div>
            <div className="text-sm opacity-70">Total CheatCards Generated</div>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-4xl font-bold text-blue-400 mb-2">3/3</div>
            <div className="text-sm opacity-70">Interview Success Rate</div>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-4xl font-bold text-orange-500 mb-2">$45k+</div>
            <div className="text-sm opacity-70">Average Salary Increase</div>
          </div>
        </div>

        {/* Persona Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {personas.map((persona, index) => (
            <div key={index} className="persona-card">
              <PersonaCard {...persona} compact={true} />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="content-center">
          <div className="bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-2xl p-8 border border-orange-500/20">
            <h3 className="text-2xl font-bold mb-4">Ready to Be Next?</h3>
            <p className="text-lg opacity-80 mb-6 max-w-2xl mx-auto">
              Join Sarah, Marcus, and Lisa in transforming every conversation into career advancement opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/demo" className="btn btn-primary inline-flex items-center gap-2">
                <span className="material-symbols-outlined icon-sm">
                  play_arrow
                </span>
                Try CheatCard Mode Free
              </a>
              <a href="/use-cases" className="btn inline-flex items-center gap-2">
                <span className="material-symbols-outlined icon-sm">
                  info
                </span>
                Read Their Full Stories
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
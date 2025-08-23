import Link from 'next/link';

const privacyFeatures = [
  {
    icon: "security",
    title: "SOC 2 Compliant",
    description: "Enterprise-grade security standards for data protection and privacy"
  },
  {
    icon: "local_activity",
    title: "Local Processing",
    description: "Audio processing happens on your device when possible - no server uploads"
  },
  {
    icon: "no_photography",
    title: "No Permanent Storage",
    description: "Audio files are never stored permanently - deleted after processing"
  },
  {
    icon: "encrypted",
    title: "End-to-End Encryption",
    description: "All data transmissions are encrypted using industry standards"
  }
];

const dataTypes = [
  {
    type: "Audio Data",
    description: "Temporary audio for transcription only",
    retention: "Deleted immediately after processing",
    purpose: "Generate transcriptions for CheatCard creation"
  },
  {
    type: "Transcribed Text", 
    description: "Text extracted from your conversations",
    retention: "Stored locally or encrypted in cloud",
    purpose: "Create flashcards and study materials"
  },
  {
    type: "Generated Cards",
    description: "AI-created flashcards and CheatCards",
    retention: "Until you delete them",
    purpose: "Your personal study and learning materials"
  },
  {
    type: "Account Information",
    description: "Email, name, subscription details",
    retention: "Until account deletion",
    purpose: "Service delivery and billing"
  }
];

const yourRights = [
  "Access your personal data and download all your cards",
  "Correct or update any inaccurate information",
  "Delete your account and all associated data",
  "Export your data in standard formats (JSON, CSV, Anki)",
  "Restrict processing of your data",
  "Object to automated decision-making",
  "Withdraw consent at any time"
];

export default function GDPR() {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Privacy & <span className="text-orange-500">GDPR</span>
          </h1>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Your privacy is fundamental to how we built SenScript. We process only what's necessary 
            to create your CheatCards, and you maintain full control of your data.
          </p>
        </div>
      </section>

      {/* Privacy Features */}
      <section className="section-grid mb-8">
        {privacyFeatures.map((feature, index) => (
          <div key={index} className="glass p-6 text-center">
            <span className={`material-symbols-outlined icon-xl mb-4 block ${
              index === 0 ? 'text-green-400' :
              index === 1 ? 'text-blue-400' :
              index === 2 ? 'text-orange-500' :
              'text-purple-400'
            }`}>
              {feature.icon}
            </span>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm opacity-90">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Data We Collect */}
      <section className="glass p-8 mb-8">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">What Data We Process</h2>
          <p className="text-lg opacity-90">
            SenScript follows data minimization - we only process what's essential for CheatCard generation
          </p>
        </div>
        
        <div className="space-y-6 max-w-4xl mx-auto">
          {dataTypes.map((data, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <h3 className="font-semibold text-orange-500 mb-1">{data.type}</h3>
                  <p className="text-sm opacity-90">{data.description}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Retention</h4>
                  <p className="text-sm opacity-80">{data.retention}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-medium mb-1">Purpose</h4>
                  <p className="text-sm opacity-80">{data.purpose}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transcription-Only Policy */}
      <section className="glass p-8 mb-8">
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-6">Transcription-Only Audio Policy</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-xl font-semibold mb-2">No Audio Storage</h3>
              <p className="opacity-90 leading-relaxed">
                SenScript never stores your audio files permanently. Audio is processed in real-time 
                for transcription purposes only and immediately deleted after text extraction.
              </p>
            </div>

            <div className="border-l-4 border-blue-400 pl-6">
              <h3 className="text-xl font-semibold mb-2">Local-First Processing</h3>
              <p className="opacity-90 leading-relaxed">
                When possible, audio transcription happens locally on your device using Web Speech API. 
                This means your conversations never leave your computer.
              </p>
            </div>

            <div className="border-l-4 border-green-400 pl-6">
              <h3 className="text-xl font-semibold mb-2">Encrypted Transmission</h3>
              <p className="opacity-90 leading-relaxed">
                When cloud processing is used (for accuracy or language support), audio is transmitted 
                using TLS 1.3 encryption and processed by GDPR-compliant AI providers.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-400">Your Consent Controls</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-green-400 mt-1">check</span>
                  <span className="text-sm">Choose local or cloud processing</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-green-400 mt-1">check</span>
                  <span className="text-sm">Use your own API keys for maximum privacy</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-green-400 mt-1">check</span>
                  <span className="text-sm">Granular permission controls</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-green-400 mt-1">check</span>
                  <span className="text-sm">Withdraw consent anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="glass p-8 mb-8">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Your GDPR Rights</h2>
          <p className="text-lg opacity-90">
            You have full control over your personal data and how it's processed
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {yourRights.map((right, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="material-symbols-outlined icon-sm text-orange-500 mt-1">
                  verified_user
                </span>
                <span className="text-sm opacity-90">{right}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/contact" className="btn btn-primary mr-4">
              Exercise Your Rights
            </Link>
            <Link href="/contact" className="btn">
              Data Protection Officer
            </Link>
          </div>
        </div>
      </section>

      {/* Legal Bases */}
      <section className="glass p-8 mb-8">
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-6">Legal Bases for Processing</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-semibold text-blue-400 mb-3">Consent (Article 6(1)(a))</h3>
              <p className="text-sm opacity-90 mb-2">
                <strong>For:</strong> Audio processing, AI analysis, cloud storage
              </p>
              <p className="text-sm opacity-80">
                You explicitly consent to audio processing for CheatCard generation. 
                You can withdraw consent at any time in your settings.
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-semibold text-green-400 mb-3">Contract Performance (Article 6(1)(b))</h3>
              <p className="text-sm opacity-90 mb-2">
                <strong>For:</strong> Account management, billing, service delivery
              </p>
              <p className="text-sm opacity-80">
                Processing necessary to provide SenScript services as described in our terms of service.
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-semibold text-purple-400 mb-3">Legitimate Interests (Article 6(1)(f))</h3>
              <p className="text-sm opacity-90 mb-2">
                <strong>For:</strong> Security monitoring, fraud prevention, service improvement
              </p>
              <p className="text-sm opacity-80">
                We have legitimate interests in protecting our service and improving user experience, 
                balanced against your privacy rights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Transfers */}
      <section className="glass p-8 mb-8">
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-6">International Data Transfers</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-xl font-semibold mb-2">EU Data Processing</h3>
              <p className="opacity-90 leading-relaxed">
                SenScript servers are located in the EU. When using our fallback API keys, 
                processing happens within GDPR jurisdiction.
              </p>
            </div>

            <div className="border-l-4 border-blue-400 pl-6">
              <h3 className="text-xl font-semibold mb-2">Your API Keys</h3>
              <p className="opacity-90 leading-relaxed">
                When you use your own API keys (OpenAI, Anthropic, DeepSeek), data transfers 
                are governed by your direct relationship with those providers.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-400">Safeguards for Non-EU Processing</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• Standard Contractual Clauses (SCCs) with all third-party processors</li>
                <li>• Privacy Shield certified providers where applicable</li>
                <li>• Encryption in transit and at rest</li>
                <li>• Regular adequacy assessments</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Updates */}
      <section className="glass p-8">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Questions About Privacy?</h2>
          <p className="text-lg opacity-90">
            Our Data Protection Officer is here to help with any privacy concerns
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Data Protection Officer</h3>
            <p className="text-sm opacity-90 mb-4">
              For all privacy and GDPR-related questions, contact our dedicated DPO team.
            </p>
            <Link href="/contact" className="btn btn-primary">
              Contact DPO
            </Link>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Policy Updates</h3>
            <p className="text-sm opacity-90 mb-4">
              We'll notify you of any material changes to our privacy practices.
            </p>
            <Link href="/changelog" className="btn">
              View Updates
            </Link>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm opacity-70">
            Last updated: August 23, 2025 • 
            <Link href="/contact" className="text-orange-500 hover:text-orange-400 ml-1">
              Report Privacy Issue
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
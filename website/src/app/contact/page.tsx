'use client';

import { useState } from 'react';

const supportTopics = [
  {
    icon: "help_outline",
    title: "General Support", 
    description: "Questions about using SenScript or troubleshooting issues"
  },
  {
    icon: "lightbulb",
    title: "Feature Request",
    description: "Ideas for new features or improvements to existing ones"
  },
  {
    icon: "bug_report", 
    title: "Bug Report",
    description: "Report technical issues or unexpected behavior"
  },
  {
    icon: "business",
    title: "Enterprise",
    description: "Team accounts, enterprise features, and custom solutions"
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Support',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Get in <span className="text-orange-500">Touch</span>
          </h1>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Need help with SenScript? Have an idea for a new feature? We're here to help you get the most out of CheatCard technology.
          </p>
        </div>
      </section>

      {/* Support Topics */}
      <section className="section-grid mb-8">
        {supportTopics.map((topic, index) => (
          <div key={index} className="glass p-6 text-center">
            <span className={`material-symbols-outlined icon-xl mb-4 block ${
              index === 0 ? 'text-orange-500' :
              index === 1 ? 'text-blue-400' :
              index === 2 ? 'text-red-400' :
              'text-green-400'
            }`}>
              {topic.icon}
            </span>
            <h3 className="text-lg font-semibold mb-2">{topic.title}</h3>
            <p className="text-sm opacity-90">{topic.description}</p>
          </div>
        ))}
      </section>

      {/* Contact Form */}
      <section className="space-section">
        <div className="max-w-2xl mx-auto">
          {!isSubmitted ? (
            <div className="glass p-8">
              <div className="content-center space-large mb-8">
                <h2 className="text-3xl font-bold">Send us a Message</h2>
                <p className="text-lg opacity-90">We typically respond within 24 hours</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  >
                    <option value="General Support">General Support</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Enterprise">Enterprise Inquiry</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-orange-500 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin mr-2" style={{fontSize: '20px'}}>
                        refresh
                      </span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined mr-2" style={{fontSize: '20px'}}>
                        send
                      </span>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass p-8 text-center">
              <span className="material-symbols-outlined icon-xl text-green-400 mb-6 block">
                check_circle
              </span>
              <h2 className="text-3xl font-bold mb-4">Message Sent!</h2>
              <p className="text-lg opacity-90 mb-8">
                Thanks for reaching out. We've received your message and will get back to you within 24 hours.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    subject: 'General Support',
                    message: ''
                  });
                }}
                className="btn"
              >
                Send Another Message
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="glass p-8">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Common Questions</h2>
          <p className="text-lg opacity-90">Quick answers to frequently asked questions</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="font-semibold mb-2">How does the free tier work?</h3>
            <p className="text-sm opacity-90 mb-3">
              You get 90 minutes of processing time to try SenScript with all features included.
            </p>
            <a href="/pricing" className="text-orange-500 hover:text-orange-400 text-sm font-medium">
              View pricing details →
            </a>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="font-semibold mb-2">What platforms are supported?</h3>
            <p className="text-sm opacity-90 mb-3">
              SenScript works with any web browser and supports Teams, Zoom, Meet, and all audio sources.
            </p>
            <a href="/more-information" className="text-orange-500 hover:text-orange-400 text-sm font-medium">
              Learn more →
            </a>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Can I use my own API keys?</h3>
            <p className="text-sm opacity-90 mb-3">
              Yes! Use your own OpenAI, Anthropic, or DeepSeek keys for maximum privacy and control.
            </p>
            <a href="/more-information" className="text-orange-500 hover:text-orange-400 text-sm font-medium">
              See AI providers →
            </a>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Is my data secure?</h3>
            <p className="text-sm opacity-90 mb-3">
              Absolutely. SOC 2 compliant with local processing options and no permanent audio storage.
            </p>
            <a href="/gdpr" className="text-orange-500 hover:text-orange-400 text-sm font-medium">
              Privacy policy →
            </a>
          </div>
        </div>
      </section>

      {/* Alternative Contact Methods */}
      <section className="glass p-8">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Other Ways to Reach Us</h2>
          <p className="text-lg opacity-90">Choose the method that works best for you</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-blue-400 mb-4 block">
              forum
            </span>
            <h3 className="text-lg font-semibold mb-2">Community Forum</h3>
            <p className="text-sm opacity-90 mb-4">
              Join discussions with other SenScript users
            </p>
            <a href="#" className="btn">
              Visit Forum
            </a>
          </div>
          
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-green-400 mb-4 block">
              chat
            </span>
            <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
            <p className="text-sm opacity-90 mb-4">
              Get instant help during business hours
            </p>
            <button className="btn btn-primary">
              Start Chat
            </button>
          </div>
          
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-purple-400 mb-4 block">
              schedule
            </span>
            <h3 className="text-lg font-semibold mb-2">Schedule Call</h3>
            <p className="text-sm opacity-90 mb-4">
              Book a 15-minute call for complex questions
            </p>
            <button className="btn">
              Book Call
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
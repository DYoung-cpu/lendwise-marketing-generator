export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Free In-Home Assessment',
      description: 'We start with a complimentary, no-obligation consultation in your home. During this visit, we take the time to understand your loved one\'s unique needs, preferences, lifestyle, and care requirements.',
      details: [
        'Meet with our care coordinator',
        'Discuss daily routines and preferences',
        'Assess home environment and safety',
        'Answer all your questions',
        'Provide care recommendations',
      ],
    },
    {
      number: '2',
      title: 'Personalized Care Plan',
      description: 'Based on our assessment, we develop a customized care plan tailored specifically to your loved one\'s needs. This plan outlines the services, schedule, and approach that will work best for your family.',
      details: [
        'Detailed care activities and schedule',
        'Specific caregiver qualifications needed',
        'Special dietary or medical considerations',
        'Communication and reporting protocols',
        'Transparent pricing and options',
      ],
    },
    {
      number: '3',
      title: 'Caregiver Matching',
      description: 'We carefully match your loved one with a caregiver whose personality, skills, and experience align with their needs and preferences. We consider interests, language, and compatibility.',
      details: [
        'Review caregiver profiles',
        'Meet potential caregivers',
        'Ensure personality compatibility',
        'Verify all qualifications',
        'Make the final selection together',
      ],
    },
    {
      number: '4',
      title: 'Care Begins',
      description: 'Once matched, your caregiver begins providing compassionate, professional care according to the agreed-upon plan. We ensure a smooth transition with proper introductions and orientation.',
      details: [
        'Caregiver orientation to home and routines',
        'Establish communication channels',
        'Begin care services as scheduled',
        'Provide family with contact information',
        'Regular check-ins and updates',
      ],
    },
    {
      number: '5',
      title: 'Ongoing Monitoring & Support',
      description: 'We don\'t just place caregivers and walk away. Our team provides continuous oversight, regular quality checks, and adjustments to the care plan as needs evolve.',
      details: [
        'Regular supervisor visits and calls',
        'Quality assurance monitoring',
        'Care plan reviews and updates',
        'Family feedback sessions',
        '24/7 support line availability',
      ],
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-purple/10 via-white to-brand-blue/10 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="section-title">How It Works</h1>
          <p className="section-subtitle max-w-3xl mx-auto">
            Getting started with 90210 Love Care is simple, stress-free, and personalized to your family's needs
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute left-10 top-24 w-1 h-full bg-brand-purple/20"></div>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-brand-purple to-brand-blue text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
                      {step.number}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-grow bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      {step.title}
                    </h2>
                    <p className="text-gray-700 text-lg mb-6">
                      {step.description}
                    </p>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-semibold text-lg mb-3 text-brand-purple">What's Included:</h3>
                      <ul className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-brand-purple to-brand-blue text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Schedule your free in-home assessment today - no obligations, just helpful information
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="bg-white text-brand-purple px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-xl">
              Schedule Free Assessment
            </a>
            <a href="tel:3104220990" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-brand-purple transition-all duration-300">
              Call (310) 422-0990
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

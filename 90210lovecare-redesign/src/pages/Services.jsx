export default function Services() {
  const services = [
    {
      category: 'Companion Care',
      icon: '👥',
      description: 'Friendly companionship and assistance with daily activities',
      items: [
        'Socialization and meaningful conversation',
        'Light housekeeping and laundry',
        'Meal planning and preparation',
        'Medication reminders',
        'Errands and shopping assistance',
        'Transportation to appointments',
        'Pet care assistance',
        'Activity planning and engagement',
      ],
    },
    {
      category: 'Personal Care',
      icon: '❤️',
      description: 'Assistance with personal hygiene and mobility',
      items: [
        'Bathing and showering assistance',
        'Grooming and oral care',
        'Dressing assistance',
        'Toileting and incontinence care',
        'Mobility and transfer assistance',
        'Exercise and physical activity support',
        'Fall prevention and safety',
        'Nighttime care and monitoring',
      ],
    },
    {
      category: 'Specialized Care',
      icon: '🛡️',
      description: 'Expert care for specific health conditions',
      items: [
        "Alzheimer's and dementia care",
        "Parkinson's disease support",
        'Post-surgery recovery care',
        'Stroke rehabilitation support',
        'Diabetes management assistance',
        'End-of-life and hospice support',
        'Respite care for family caregivers',
        'Chronic condition management',
      ],
    },
    {
      category: 'Care Options',
      icon: '⏰',
      description: 'Flexible scheduling to meet your needs',
      items: [
        'Hourly care (minimum hours apply)',
        'Daily care visits',
        'Overnight care',
        '24-hour live-in care',
        'Around-the-clock care (multiple caregivers)',
        'Weekend and holiday care',
        'Emergency and temporary care',
        'Long-term care arrangements',
      ],
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-purple/10 via-white to-brand-blue/10 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="section-title">Our Care Services</h1>
          <p className="section-subtitle max-w-3xl mx-auto">
            Comprehensive, compassionate care services designed to help your loved ones live comfortably and safely at home
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">{service.icon}</span>
                  <h2 className="font-serif text-3xl font-bold text-gray-900">{service.category}</h2>
                </div>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-3">
                  {service.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center mb-12">Why Choose 90210 Love Care?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Licensed & Insured</h3>
              <p className="text-gray-600">Fully licensed, bonded, and insured for your complete peace of mind</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Screened Caregivers</h3>
              <p className="text-gray-600">Thoroughly background-checked, trained, and compassionate professionals</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Family Focused</h3>
              <p className="text-gray-600">Personalized care plans that treat your loved ones like family</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

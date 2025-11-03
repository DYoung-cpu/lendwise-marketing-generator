export default function Caregivers() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="bg-gradient-to-br from-brand-purple/10 via-white to-brand-gold/10 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="section-title">Our Caregivers</h1>
          <p className="section-subtitle max-w-3xl mx-auto">
            Compassionate professionals dedicated to providing exceptional care with dignity and respect
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="font-serif text-3xl font-bold text-gray-900 mb-6">Experienced & Thoroughly Screened</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Every caregiver at 90210 Love Care undergoes a rigorous selection process to ensure they meet our high standards of professionalism, compassion, and expertise.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                We carefully match caregivers with clients based on personality, interests, and care needs to create meaningful, lasting relationships.
              </p>
            </div>
            <div className="bg-brand-purple/5 rounded-xl p-8">
              <h3 className="font-serif text-2xl font-bold mb-6">Our Screening Process</h3>
              <ul className="space-y-4">
                {[
                  'Comprehensive background checks',
                  'Reference verification',
                  'Skills and experience assessment',
                  'Personal interviews',
                  'TB testing and health screening',
                  'CPR & First Aid certification',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-6 h-6 text-brand-purple mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Professional Training',
                description: 'All caregivers receive ongoing training in best practices, safety protocols, and specialized care techniques.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
              },
              {
                title: 'Compassionate Care',
                description: 'We select caregivers who genuinely care and treat every client with kindness, patience, and respect.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
              },
              {
                title: 'Ongoing Support',
                description: 'Our caregivers receive continuous supervision and support to ensure consistent, high-quality care.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-gold">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-br from-brand-purple to-brand-blue text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl font-bold mb-6">Join Our Team</h2>
          <p className="text-xl mb-8 text-white/90">
            Are you a compassionate caregiver looking to make a difference? We're always seeking dedicated professionals to join our team.
          </p>
          <button className="bg-white text-brand-purple px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
            View Career Opportunities
          </button>
        </div>
      </section>
    </div>
  );
}

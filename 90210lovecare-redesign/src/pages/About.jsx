export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-purple/10 via-white to-brand-blue/10 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="section-title">About 90210 Love Care</h1>
          <p className="section-subtitle max-w-3xl mx-auto">
            A family-owned business dedicated to providing compassionate, professional care throughout Los Angeles County
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              90210 Love Care was founded on the belief that everyone deserves to age with dignity, comfort, and companionship in the place they call home. As a family-owned business, we understand the challenges families face when caring for elderly loved ones, and we're committed to being a trusted partner in that journey.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Our name reflects our Beverly Hills roots and our commitment to providing premium, personalized care to families throughout Los Angeles County. We take pride in treating every client like family, matching them with caregivers who share their values and interests.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Compassion',
                description: 'We approach every interaction with empathy, kindness, and genuine care for the wellbeing of our clients and their families.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
              },
              {
                title: 'Dignity & Respect',
                description: 'Every person deserves to be treated with respect and to maintain their independence and dignity as they age.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
              },
              {
                title: 'Safety & Security',
                description: 'We maintain the highest standards of safety, with fully screened, trained, and supervised caregivers.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
              {
                title: 'Reliability',
                description: 'Families can count on us to provide consistent, dependable care when they need it most.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: 'Excellence',
                description: 'We strive for excellence in every aspect of our service, from caregiver selection to ongoing care quality.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                ),
              },
              {
                title: 'Family-Centered',
                description: 'We partner with families, involving them in care decisions and keeping communication open and transparent.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
              },
            ].map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="w-16 h-16 bg-brand-purple/10 rounded-full flex items-center justify-center mb-4 text-brand-purple">
                  {value.icon}
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center mb-12">Our Caregiver Selection Process</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {[
                {
                  title: 'Rigorous Background Checks',
                  description: 'Every caregiver undergoes comprehensive background screening, including criminal history, reference verification, and employment history.',
                },
                {
                  title: 'Skills Assessment',
                  description: 'We evaluate each caregiver\'s experience, skills, and qualifications to ensure they meet our high standards of care.',
                },
                {
                  title: 'Personal Interviews',
                  description: 'Our team conducts in-depth interviews to assess personality, compassion, and commitment to quality care.',
                },
                {
                  title: 'Ongoing Training',
                  description: 'Caregivers receive continuous education on best practices, safety protocols, and specialized care techniques.',
                },
                {
                  title: 'Quality Supervision',
                  description: 'We provide ongoing supervision and support to ensure caregivers consistently deliver exceptional service.',
                },
                {
                  title: 'Client Matching',
                  description: 'We carefully match caregivers with clients based on personality, interests, care needs, and preferences.',
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start bg-white rounded-xl p-6 shadow-md">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-purple text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications & Trust Badges */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-title mb-8">Licensed, Bonded & Insured</h2>
          <p className="text-xl text-gray-600 mb-8">
            We maintain all required licenses and insurance to protect our clients and provide peace of mind to families.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-brand-purple text-white px-6 py-3 rounded-full font-semibold">Licensed</span>
            <span className="bg-brand-blue text-white px-6 py-3 rounded-full font-semibold">Bonded</span>
            <span className="bg-brand-gold text-white px-6 py-3 rounded-full font-semibold">Insured</span>
          </div>
        </div>
      </section>
    </div>
  );
}

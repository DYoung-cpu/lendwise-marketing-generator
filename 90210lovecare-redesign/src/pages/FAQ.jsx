import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Services & Care',
      questions: [
        {
          q: 'What is the difference between companion care and personal care?',
          a: 'Companion care focuses on socialization, light housekeeping, meal preparation, and assistance with daily activities. Personal care includes hands-on assistance with bathing, dressing, grooming, mobility, and toileting. We can provide both types of care as needed.',
        },
        {
          q: 'Do you provide medical care or nursing services?',
          a: 'We specialize in non-medical companion and personal care. While our caregivers can assist with medication reminders and basic health monitoring, we do not provide licensed nursing or medical services. We can coordinate with your healthcare providers as needed.',
        },
        {
          q: 'What areas do you serve?',
          a: 'We proudly serve all of Los Angeles County, including Beverly Hills, Santa Monica, West Hollywood, Culver City, and surrounding communities.',
        },
        {
          q: 'Can you provide care for someone with Alzheimer\'s or dementia?',
          a: 'Yes! We have caregivers specially trained in Alzheimer\'s and dementia care. They understand the unique challenges and use proven techniques to provide compassionate, effective care.',
        },
      ],
    },
    {
      category: 'Caregivers',
      questions: [
        {
          q: 'How do you screen and select caregivers?',
          a: 'All caregivers undergo comprehensive background checks, reference verification, skills assessments, and personal interviews. We only hire compassionate professionals who meet our high standards of care.',
        },
        {
          q: 'Can we meet the caregiver before care begins?',
          a: 'Absolutely! We believe it\'s essential for you to meet and feel comfortable with your caregiver. We facilitate introductions and will find a different match if needed.',
        },
        {
          q: 'What if we don\'t connect with our caregiver?',
          a: 'Your satisfaction is our priority. If the match isn\'t right, just let us know and we\'ll find a different caregiver who better fits your needs and personality.',
        },
        {
          q: 'Are caregivers supervised?',
          a: 'Yes, we provide ongoing supervision, quality checks, and support to all our caregivers to ensure consistent, high-quality care.',
        },
      ],
    },
    {
      category: 'Scheduling & Flexibility',
      questions: [
        {
          q: 'What are your minimum hours for care?',
          a: 'Our minimum is typically 4 hours per visit for hourly care. However, we can discuss your specific needs during your free assessment.',
        },
        {
          q: 'Can I change the care schedule if needed?',
          a: 'Yes, we understand that needs can change. We work with you to adjust schedules as needed, with as much advance notice as possible.',
        },
        {
          q: 'Do you provide care on weekends and holidays?',
          a: 'Yes, we offer care seven days a week, including weekends and holidays. We understand that care needs don\'t follow a 9-to-5 schedule.',
        },
        {
          q: 'What is live-in care and how does it work?',
          a: 'Live-in care means a caregiver stays in your home 24/7, typically with breaks for sleep and personal time. It\'s ideal for those who need around-the-clock assistance and supervision.',
        },
      ],
    },
    {
      category: 'Costs & Insurance',
      questions: [
        {
          q: 'How much does in-home care cost?',
          a: 'Costs vary based on the type and amount of care needed. We provide transparent pricing during your free assessment and can work with your budget to create an affordable care plan.',
        },
        {
          q: 'Do you accept insurance?',
          a: 'We can work with long-term care insurance providers and can provide documentation for reimbursement. We also accept private pay. During your assessment, we can discuss payment options.',
        },
        {
          q: 'Is there a contract or commitment required?',
          a: 'We don\'t lock you into long-term contracts. We want you to stay with us because you\'re happy with our service, not because you have to.',
        },
        {
          q: 'What forms of payment do you accept?',
          a: 'We accept various payment methods including checks, credit cards, and bank transfers. We\'ll discuss payment details during your consultation.',
        },
      ],
    },
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How quickly can care begin?',
          a: 'In many cases, we can arrange care within a few days of your assessment. For urgent situations, we can often accommodate same-day or next-day care starts.',
        },
        {
          q: 'What happens during the free assessment?',
          a: 'During the assessment, we visit your home, discuss your loved one\'s needs, answer your questions, and provide care recommendations. There\'s no obligation or pressure - it\'s simply an opportunity to learn about our services.',
        },
        {
          q: 'Do I need to be present during care visits?',
          a: 'Not necessarily. Many families choose to be present initially and then give the caregiver a key or access code. Whatever makes you most comfortable.',
        },
        {
          q: 'How do you communicate with family members?',
          a: 'We maintain open communication through regular updates, care logs, phone calls, and progress reports. You can contact us anytime with questions or concerns.',
        },
      ],
    },
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-purple/10 via-white to-brand-blue/10 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="section-title">Frequently Asked Questions</h1>
          <p className="section-subtitle max-w-3xl mx-auto">
            Find answers to common questions about our services, caregivers, and how we can help your family
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h2 className="font-serif text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-brand-purple">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const index = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openIndex === index;

                  return (
                    <div
                      key={questionIndex}
                      className="bg-white rounded-lg shadow-md border-2 border-gray-200 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-lg text-gray-900 pr-8">{faq.q}</span>
                        <svg
                          className={`w-6 h-6 text-brand-purple flex-shrink-0 transform transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-200">
                          <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold mb-6">Still Have Questions?</h2>
          <p className="text-xl text-gray-600 mb-8">
            We're here to help! Contact us today to speak with a care coordinator.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="btn-primary">
              Schedule Free Assessment
            </a>
            <a href="tel:3104220990" className="btn-secondary">
              Call (310) 422-0990
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

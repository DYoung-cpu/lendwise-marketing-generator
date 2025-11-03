import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectPath = path.join(__dirname, '90210lovecare-redesign');

const pages = {
  'src/pages/Home.jsx': `import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import heroImg from '../assets/images/hero-companionship.jpg';
import conversationImg from '../assets/images/conversation.jpg';
import activitiesImg from '../assets/images/activities.jpg';

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const services = [
    { icon: '💬', title: 'Companionship', description: 'Meaningful conversation and emotional support' },
    { icon: '🍳', title: 'Meal Preparation', description: 'Nutritious, delicious meals prepared with care' },
    { icon: '🚗', title: 'Transportation', description: 'Safe rides to appointments and errands' },
    { icon: '🏠', title: 'Light Housekeeping', description: 'Maintaining a clean, comfortable home' },
    { icon: '💊', title: 'Medication Reminders', description: 'Timely medication management support' },
    { icon: '🎨', title: 'Activities & Hobbies', description: 'Engagement in enjoyable activities' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Companion care" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>

        <div className="relative z-10 container-custom px-6 text-white">
          <motion.div {...fadeInUp}>
            <h1 className="heading-1 text-white mb-6">
              Compassionate Care<br />
              <span className="text-accent">Luxury Service</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl text-gray-100">
              Premium private non-medical companion care services for your loved ones in Beverly Hills and surrounding areas
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact" className="btn-primary">Get Started</Link>
              <a href="tel:+13105559999" className="btn-gold">Call (310) 555-9999</a>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Services Overview */}
      <section className="section bg-white">
        <div className="container-custom">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="heading-2">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional companion care tailored to your needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="card text-center hover:scale-105 transition-transform"
              >
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services" className="btn-secondary">View All Services</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img src={conversationImg} alt="Quality care" className="rounded-xl shadow-elegant" />
            </div>
            <motion.div {...fadeInUp}>
              <h2 className="heading-2">Why Choose 90210 Love Care?</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">✓</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Licensed & Insured</h3>
                    <p className="text-gray-600">Fully licensed, bonded, and insured for your peace of mind</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">✓</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Experienced Caregivers</h3>
                    <p className="text-gray-600">Thoroughly screened, trained professionals who truly care</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">✓</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Personalized Care Plans</h3>
                    <p className="text-gray-600">Customized services to meet your unique needs</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">✓</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">24/7 Availability</h3>
                    <p className="text-gray-600">Round-the-clock support when you need it most</p>
                  </div>
                </div>
              </div>
              <Link to="/about" className="btn-primary mt-8 inline-block">Learn More</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-brand-purple via-brand-blue to-brand-purple text-white">
        <div className="container-custom text-center">
          <motion.div {...fadeInUp}>
            <h2 className="heading-2 text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Contact us today for a free consultation and learn how we can help your loved ones live comfortably and happily
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact" className="btn-gold">Schedule Consultation</Link>
              <a href="tel:+13105559999" className="px-8 py-4 bg-white text-brand-purple font-semibold rounded-lg hover:bg-gray-100 transition-all">
                Call (310) 555-9999
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}`,

  'src/pages/Services.jsx': `import { motion } from 'framer-motion';
import servicesImg from '../assets/images/reading-together.jpg';

export default function Services() {
  const services = [
    {
      title: 'Companionship',
      description: 'Our caregivers provide meaningful conversation, emotional support, and genuine friendship to combat loneliness and isolation.',
      features: ['Engaging conversation', 'Emotional support', 'Social activities', 'Game playing']
    },
    {
      title: 'Personal Care Assistance',
      description: 'Respectful help with daily living activities while maintaining dignity and independence.',
      features: ['Grooming assistance', 'Dressing support', 'Bathing help', 'Mobility assistance']
    },
    {
      title: 'Meal Preparation',
      description: 'Nutritious, delicious meals prepared according to dietary requirements and preferences.',
      features: ['Menu planning', 'Grocery shopping', 'Meal cooking', 'Special diets']
    },
    {
      title: 'Transportation Services',
      description: 'Safe, reliable transportation to appointments, errands, and social engagements.',
      features: ['Medical appointments', 'Shopping trips', 'Social outings', 'Religious services']
    },
    {
      title: 'Light Housekeeping',
      description: 'Maintaining a clean, safe, and comfortable living environment.',
      features: ['Tidying up', 'Laundry', 'Dishes', 'Organizing']
    },
    {
      title: 'Medication Reminders',
      description: 'Gentle reminders to ensure medications are taken on schedule.',
      features: ['Timely reminders', 'Schedule tracking', 'Doctor communication', 'Refill coordination']
    },
    {
      title: 'Errands & Shopping',
      description: 'Assistance with grocery shopping and running essential errands.',
      features: ['Grocery shopping', 'Prescription pickup', 'Post office', 'Banking']
    },
    {
      title: 'Respite Care',
      description: 'Temporary relief for family caregivers to rest and recharge.',
      features: ['Flexible scheduling', 'Trusted care', 'Family peace of mind', 'Regular updates']
    }
  ];

  return (
    <div>
      <section className="relative h-96 flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={servicesImg} alt="Our Services" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="heading-1 text-white mb-4">Our Services</h1>
          <p className="text-xl">Comprehensive companion care tailored to your needs</p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                <h3 className="heading-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-2 text-brand-purple flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}`,

  'src/pages/Caregivers.jsx': `import { motion } from 'framer-motion';
import caregiversImg from '../assets/images/garden-walk.jpg';

export default function Caregivers() {
  return (
    <div>
      <section className="relative h-96 flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={caregiversImg} alt="Our Caregivers" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="heading-1 text-white mb-4">Our Caregivers</h1>
          <p className="text-xl">Compassionate professionals dedicated to exceptional care</p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="heading-2 text-center mb-12">The 90210 Love Care Difference</h2>

            <div className="space-y-8">
              <div className="card">
                <h3 className="text-2xl font-semibold mb-4 text-brand-purple">Rigorous Screening Process</h3>
                <p className="text-gray-700 mb-4">
                  Every caregiver undergoes comprehensive background checks, reference verification, and in-person interviews to ensure they meet our high standards.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start"><span className="mr-2">•</span>Criminal background checks</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Professional reference verification</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Skills assessment and testing</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Personal interviews</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-2xl font-semibold mb-4 text-brand-purple">Ongoing Training & Development</h3>
                <p className="text-gray-700 mb-4">
                  Our caregivers receive continuous education in best practices, safety protocols, and compassionate care techniques.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start"><span className="mr-2">•</span>First aid and CPR certification</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Dementia and Alzheimer's care training</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Safety and emergency protocols</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Communication and interpersonal skills</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-2xl font-semibold mb-4 text-brand-purple">Compassionate & Professional</h3>
                <p className="text-gray-700 mb-4">
                  We select caregivers who genuinely love what they do and treat each client with the dignity and respect they deserve.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start"><span className="mr-2">•</span>Patient and empathetic approach</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Respectful of privacy and independence</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Excellent communication skills</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Dedication to client wellbeing</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}`,

  'src/pages/About.jsx': `import { motion } from 'framer-motion';
import aboutImg from '../assets/images/meal-prep.jpg';

export default function About() {
  return (
    <div>
      <section className="relative h-96 flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={aboutImg} alt="About Us" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="heading-1 text-white mb-4">About Us</h1>
          <p className="text-xl">Dedicated to excellence in companion care</p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="heading-2 mb-6">Our Story</h2>
              <p className="text-lg text-gray-700 mb-6">
                90210 Love Care was founded with a simple mission: to provide the highest quality private non-medical companion care services to seniors in Beverly Hills and surrounding communities.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                We understand that maintaining independence and dignity while receiving care is paramount. That's why we carefully match each client with caregivers who not only possess the necessary skills but also share common interests and compatible personalities.
              </p>
              <p className="text-lg text-gray-700 mb-12">
                Our commitment to excellence, compassion, and professionalism has made us a trusted partner for families seeking premium companion care services.
              </p>

              <h2 className="heading-2 mb-6">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3 text-brand-purple">Compassion</h3>
                  <p className="text-gray-700">We treat every client with genuine warmth, empathy, and respect.</p>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3 text-brand-purple">Excellence</h3>
                  <p className="text-gray-700">We maintain the highest standards in caregiver selection and training.</p>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3 text-brand-purple">Integrity</h3>
                  <p className="text-gray-700">We operate with honesty, transparency, and ethical practices.</p>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3 text-brand-purple">Personalization</h3>
                  <p className="text-gray-700">We customize our services to meet each client's unique needs.</p>
                </div>
              </div>

              <h2 className="heading-2 mb-6">Serving Beverly Hills & Beyond</h2>
              <p className="text-lg text-gray-700 mb-6">
                We proudly serve Beverly Hills (90210) and surrounding communities including West Hollywood, Bel Air, Brentwood, and Santa Monica. Our local presence means we understand the unique needs of our community.
              </p>
              <p className="text-lg text-gray-700">
                Contact us today to learn how we can help your loved ones live comfortably and happily with professional companion care.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}`,

  'src/pages/Contact.jsx': `import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will contact you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <section className="section bg-gradient-to-br from-brand-purple via-brand-blue to-brand-purple text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="heading-1 text-white mb-4">Contact Us</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Get in touch to schedule a free consultation and learn how we can help
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="heading-3 mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition"
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary w-full">Send Message</button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="heading-3 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-purple rounded-lg flex items-center justify-center text-white mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Phone</h3>
                    <a href="tel:+13105559999" className="text-brand-purple hover:underline">(310) 555-9999</a>
                    <p className="text-gray-600 text-sm mt-1">Available 24/7</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-purple rounded-lg flex items-center justify-center text-white mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Email</h3>
                    <a href="mailto:care@90210lovecare.com" className="text-brand-purple hover:underline">care@90210lovecare.com</a>
                    <p className="text-gray-600 text-sm mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-purple rounded-lg flex items-center justify-center text-white mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Service Area</h3>
                    <p className="text-gray-700">Beverly Hills, CA 90210</p>
                    <p className="text-gray-600 text-sm mt-1">Serving Beverly Hills & surrounding areas</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 card bg-gradient-to-br from-brand-purple-light to-brand-blue-light text-white">
                <h3 className="text-2xl font-semibold mb-3">24/7 Emergency Care</h3>
                <p className="mb-4">Need immediate assistance? We're here for you around the clock.</p>
                <a href="tel:+13105559999" className="btn-gold inline-block">Call Now</a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}`
};

Object.entries(pages).forEach(([filePath, content]) => {
  const fullPath = path.join(projectPath, filePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content);
  console.log(`✅ Created: ${filePath}`);
});

console.log('\n🎉 All page files created successfully!');

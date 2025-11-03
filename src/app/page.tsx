'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Linkedin, Download, Send } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

type PortfolioData = {
  personalInfo: any;
  workExperience: any[];
  education: any[];
  skills: Record<string, any[]>;
  projects: any[];
  currentlyLearning: string | null;
};

export default function HomePage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch('/api/portfolio');
      const portfolioData = await response.json();
      setData(portfolioData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setContactStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      const result = await response.json();

      if (response.ok) {
        setContactStatus({ type: 'success', message: 'Message sent successfully!' });
        setContactForm({ name: '', email: '', message: '' });
      } else {
        setContactStatus({ type: 'error', message: result.error || 'Failed to send message' });
      }
    } catch (error) {
      setContactStatus({ type: 'error', message: 'An error occurred. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-xl text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-xl text-gray-900 dark:text-white">Failed to load portfolio</div>
      </div>
    );
  }

  const { personalInfo } = data;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 border-b border-gray-200 dark:border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {personalInfo?.name || 'Portfolio'}
          </div>
          <div className="flex items-center gap-6">
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
            <a href="#experience" className="hover:text-blue-600 transition-colors">Experience</a>
            <a href="#skills" className="hover:text-blue-600 transition-colors">Skills</a>
            <a href="#projects" className="hover:text-blue-600 transition-colors">Projects</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {personalInfo?.name || 'Your Name'}
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-400 mb-8">
              {personalInfo?.title || 'Your Title'}
            </p>
            <div className="flex justify-center gap-4 mb-8">
              {personalInfo?.email && (
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Get in Touch
                </a>
              )}
              <a
                href="/resume.pdf"
                download
                className="flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Resume
              </a>
            </div>
            <div className="flex justify-center gap-4">
              {personalInfo?.email && (
                <a href={`mailto:${personalInfo.email}`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <Mail className="w-6 h-6" />
                </a>
              )}
              {personalInfo?.phone && (
                <a href={`tel:${personalInfo.phone}`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <Phone className="w-6 h-6" />
                </a>
              )}
              {personalInfo?.linkedin && (
                <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-8 text-center">About Me</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {personalInfo?.bio || 'Your bio will appear here'}
            </p>
            {personalInfo?.location && (
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Based in {personalInfo.location}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Work Experience Section */}
      <section id="experience" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Work Experience</h2>
          <div className="space-y-8">
            {data.workExperience.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{job.role}</h3>
                    <p className="text-xl text-gray-700 dark:text-gray-300">{job.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 dark:text-gray-400">{job.location}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {job.startDate} - {job.endDate || 'Present'}
                    </p>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  {job.achievements.map((achievement: string, i: number) => (
                    <li key={i}>{achievement}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Education</h2>
          {data.education.map((edu) => (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
            >
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">{edu.degree}</h3>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">{edu.institution}</p>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{edu.location}</span>
                <span>{edu.graduationDate}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Skills</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {Object.entries(data.skills).map(([category, skillList]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
              >
                <h3 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skillList.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Projects</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {data.projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-blue-600 dark:text-blue-400">{project.title}</h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">{project.role}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {project.startDate} - {project.endDate || 'Present'}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{project.description}</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 mb-4">
                    {project.achievements.map((achievement: string, i: number) => (
                      <li key={i} className="text-sm">{achievement}</li>
                    ))}
                  </ul>
                  {project.techStack && (
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Currently Learning Section */}
      {data.currentlyLearning && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white"
            >
              <h2 className="text-3xl font-bold mb-4">Currently Learning</h2>
              <p className="text-lg">{data.currentlyLearning}</p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Get in Touch</h2>
          <form onSubmit={handleContactSubmit} className="space-y-6">
            {contactStatus && (
              <div
                className={`p-4 rounded-lg ${
                  contactStatus.type === 'success'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                {contactStatus.message}
              </div>
            )}
            <input
              type="text"
              placeholder="Your Name"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-600 outline-none"
            />
            <input
              type="email"
              placeholder="Your Email"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-600 outline-none"
            />
            <textarea
              placeholder="Your Message"
              rows={6}
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-600 outline-none"
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} {personalInfo?.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

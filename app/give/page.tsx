'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Building, Users, Globe, BookOpen, Mail, Landmark } from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/content';

const givingFunds = [
  {
    id: 'tithe',
    title: 'Tithe & Offerings',
    description: 'Regular giving to support our church ministries and operations'
  },
  {
    id: 'missions',
    title: 'Missions Fund',
    description: 'Support our global mission work and local outreach programs'
  },
  {
    id: 'building',
    title: 'Building Fund',
    description: 'Help us maintain and improve our church facilities'
  },
  {
    id: 'special',
    title: 'Special Projects',
    description: 'Support specific ministry projects and community initiatives'
  }
];

const impactAreas = [
  {
    icon: Users,
    title: 'Community Outreach',
    description: 'Supporting families in need through food drives, counseling, and assistance programs.',
    amount: '₹2,50,000'
  },
  {
    icon: Globe,
    title: 'Global Missions',
    description: 'Spreading the Gospel worldwide through missionary support and evangelism.',
    amount: '₹5,00,000'
  },
  {
    icon: BookOpen,
    title: 'Education Ministry',
    description: 'Providing quality Christian education and scholarship programs.',
    amount: '₹3,00,000'
  },
  {
    icon: Heart,
    title: 'Youth Programs',
    description: 'Investing in the next generation through camps, mentorship, and activities.',
    amount: '₹1,50,000'
  }
];

export default function GivePage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [impactData, setImpactData] = useState(impactAreas);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getSiteSettings();
      if (data) {
        setSiteSettings(data);
        if (data.givingImpact) {
          setImpactData([
            {
              icon: Users,
              title: 'Community Outreach',
              description: 'Supporting families in need through food drives, counseling, and assistance programs.',
              amount: data.givingImpact.communityOutreach || '∞'
            },
            {
              icon: Globe,
              title: 'Global Missions',
              description: 'Spreading the Gospel worldwide through missionary support and evangelism.',
              amount: data.givingImpact.globalMissions || '∞'
            },
            {
              icon: BookOpen,
              title: 'Education Ministry',
              description: 'Providing quality Christian education and scholarship programs.',
              amount: data.givingImpact.educationMinistry || '∞'
            },
            {
              icon: Heart,
              title: 'Youth Programs',
              description: 'Investing in the next generation through camps, mentorship, and activities.',
              amount: data.givingImpact.youthPrograms || '∞'
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            className="text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Give with Joy
          </motion.h1>
          <motion.p
            className="text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your generosity helps us serve our community and spread God&apos;s love
          </motion.p>
        </div>
      </section>

      {/* Ways to Give */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Ways to Give</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Online giving isn&apos;t available on the website yet. Here&apos;s how to give today:
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <motion.div
                className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Landmark className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Bank Transfer</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {/* TODO (church staff): replace this with the church's real bank account
                      details (account name, number, IFSC/routing, bank branch) once provided.
                      Do not publish placeholder account numbers in the meantime. */}
                  Account details are available directly from the church office — please{' '}
                  {siteSettings?.phoneNumber ? (
                    <>call <a href={`tel:${siteSettings.phoneNumber}`} className="text-blue-600 underline">{siteSettings.phoneNumber}</a> or </>
                  ) : null}
                  <Link href="/contact" className="text-blue-600 underline">contact us</Link> and we&apos;ll share transfer instructions.
                </p>
              </motion.div>

              <motion.div
                className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Building className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">In Person</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Give during any of our worship services — see our current service times for when to join us.
                </p>
                <Link href="/services" className="text-blue-600 font-semibold hover:underline text-sm">
                  View Service Times →
                </Link>
              </motion.div>

              <motion.div
                className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Mail className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Questions?</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Reach out about recurring gifts, planned/legacy giving, or designating a gift to a specific fund below.
                </p>
                <Link href="/contact" className="text-blue-600 font-semibold hover:underline text-sm">
                  Contact Us →
                </Link>
              </motion.div>
            </div>

            {/* Fund Designation Info */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-center text-gray-900 dark:text-white">You Can Designate Your Gift To</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {givingFunds.map((fund) => (
                  <div
                    key={fund.id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <h4 className="font-bold text-gray-900 dark:text-white">{fund.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{fund.description}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
                Just let us know which fund you&apos;d like to support when you give in person or transfer a gift.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Your Impact</h2>
            <p className="text-gray-600 dark:text-gray-300">See how your generosity is making a difference in our community</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactData.map((area, index) => (
              <motion.div
                key={area.title}
                className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <area.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{area.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{area.description}</p>
                <div className="text-2xl font-bold text-blue-600">{area.amount}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{typeof area.amount === 'string' && area.amount !== '∞' ? 'raised this year' : 'God\'s provision'}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Give Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Why We Give</h2>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="p-6">
                  <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Worship Through Giving</h3>
                  <p className="text-gray-600 dark:text-gray-300">Giving is an act of worship that acknowledges God as the source of all blessings.</p>
                </div>

                <div className="p-6">
                  <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Support Our Mission</h3>
                  <p className="text-gray-600 dark:text-gray-300">Your gifts enable us to serve our community and spread the Gospel effectively.</p>
                </div>

                <div className="p-6">
                  <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Make a Difference</h3>
                  <p className="text-gray-600 dark:text-gray-300">Together, we can transform lives and communities through God&apos;s love and grace.</p>
                </div>
              </div>

              <blockquote className="text-xl italic text-gray-700 dark:text-gray-300 mb-4">
                &quot;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&quot;
              </blockquote>
              <cite className="text-blue-600 dark:text-blue-400 font-semibold">2 Corinthians 9:7</cite>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">Questions About Giving?</h2>
            <p className="text-xl mb-8">We&apos;re here to help you with your generosity journey</p>
            <Link
              href="/contact"
              className="inline-block bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border dark:border-gray-600"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

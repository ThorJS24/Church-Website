'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Heart, Cross, Target, Eye, CheckCircle } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';
import DivineEffects from '@/components/DivineEffects';
import SacredText from '@/components/SacredText';
import HeavenlyCard from '@/components/HeavenlyCard';
import ScriptureReference from '@/components/ScriptureReference';

interface AboutPage {
  title: string;
  subtitle: string;
  mission: string;
  vision: string;
  beliefs: Array<{
    title: string;
    description: string;
    scriptureReferences?: Array<{
      reference: string;
      verse: string;
      version: string;
    }>;
  }>;
  beliefsSectionTitle: string;
  values: Array<{
    title: string;
    description: string;
    scriptureReferences?: Array<{
      reference: string;
      verse: string;
      version: string;
    }>;
  }>;
  valuesSectionTitle: string;
  guidingScripture?: {
    verse: string;
    reference: string;
  };
}

export default function BeliefsPage() {
  const [aboutPage, setAboutPage] = useState<AboutPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const aboutData = await sanityFetch(`*[_type == "aboutPage"][0]`);
      if (aboutData) setAboutPage(aboutData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-indigo-50/30 dark:from-purple-950/30 dark:via-blue-950/20 dark:to-indigo-950/30 relative">
      <DivineEffects />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <SacredText size="xl" className="text-5xl font-bold mb-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {aboutPage?.title || "Our Beliefs & About Us"}
            </motion.h1>
          </SacredText>
          <motion.p
            className="text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {aboutPage?.subtitle || "Learn about our church family and what we believe"}
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <HeavenlyCard glowIntensity="medium">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Target className="w-16 h-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-6" />
                <SacredText className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                  <h2>Our Mission</h2>
                </SacredText>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {aboutPage?.mission || "To proclaim the Gospel of Jesus Christ, nurture believers through sound teaching, and build a community grounded in grace, faith, and love."}
                </p>
              </motion.div>
            </HeavenlyCard>
            <HeavenlyCard glowIntensity="medium" delay={0.2}>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Eye className="w-16 h-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-6" />
                <SacredText className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                  <h2>Our Vision</h2>
                </SacredText>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {aboutPage?.vision || "To be a Christ-centered church that transforms lives and communities through faith, love, and service — equipping every believer to live with purpose."}
                </p>
              </motion.div>
            </HeavenlyCard>
          </div>
        </div>
      </section>

      {/* Core Values */}
      {aboutPage?.values && (
        <section className="py-16 bg-gray-100 dark:bg-gray-700">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <SacredText size="xl" className="text-6xl font-bold mb-4 text-gray-900 dark:text-white">
                <h2>{aboutPage.valuesSectionTitle || "Core Values"}</h2>
              </SacredText>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {aboutPage.values.map((value, index) => (
                <HeavenlyCard key={value.title} glowIntensity="medium" delay={index * 0.1}>
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Heart className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
                    <SacredText className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                      <h3>{value.title}</h3>
                    </SacredText>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">{value.description}</p>
                    {value.scriptureReferences && value.scriptureReferences.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {value.scriptureReferences.map((scripture, scriptureIndex) => (
                          <ScriptureReference
                            key={scriptureIndex}
                            reference={scripture.reference}
                            verse={scripture.verse}
                            version={scripture.version}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </HeavenlyCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What We Believe from About Page */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Book className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <SacredText size="xl" className="text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              <h2>{aboutPage?.beliefsSectionTitle || "What We Believe"}</h2>
            </SacredText>
          </div>
          
          {aboutPage?.beliefs && (
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {aboutPage.beliefs.map((belief, index) => (
                <motion.div
                  key={belief.title}
                  className="flex items-start p-6 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{belief.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">{belief.description}</p>
                    {belief.scriptureReferences && belief.scriptureReferences.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {belief.scriptureReferences.map((scripture, scriptureIndex) => (
                          <ScriptureReference
                            key={scriptureIndex}
                            reference={scripture.reference}
                            verse={scripture.verse}
                            version={scripture.version}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Guiding Scripture */}
          {aboutPage?.guidingScripture && (
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="bg-blue-50 dark:bg-gray-700 p-8 rounded-lg max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Guiding Scripture</h3>
                <p className="text-blue-800 dark:text-blue-300 italic text-xl mb-4">
                  "{aboutPage.guidingScripture.verse}"
                </p>
                <p className="text-blue-600 dark:text-blue-400 font-semibold">
                  — {aboutPage.guidingScripture.reference}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

    </div>
  );
}
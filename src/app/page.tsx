'use client';

import { motion } from 'framer-motion';
import {
  Flame,
  Heart,
  Brain,
  TrendingUp,
  Trophy,
  Zap,
  Users,
  Share2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-6xl w-full mx-auto">
          <motion.div
            className="text-center space-y-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Animated Couch Emoji */}
            <motion.div
              variants={fadeIn}
              className="inline-block text-8xl sm:text-9xl mb-4"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🛋️
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeIn}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
            >
              <span className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Prove you left
              </span>
              <br />
              <span className="text-white">the couch.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeIn}
              className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
            >
              Free alternative to Strava Premium with{' '}
              <span className="text-purple-400 font-semibold">AI-powered roasts</span>,{' '}
              <span className="text-cyan-400 font-semibold">personality analysis</span>, and{' '}
              <span className="text-pink-400 font-semibold">epic gamification</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Link
                href="/signup"
                className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 rounded-full text-lg font-semibold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/connect-strava"
                className="group w-full sm:w-auto px-8 py-4 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/50 rounded-full text-lg font-semibold backdrop-blur-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
                </svg>
                Connect Strava
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              variants={fadeIn}
              className="flex flex-wrap items-center justify-center gap-6 pt-8 text-slate-400"
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span className="text-sm">10K+ Athletes</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-sm">100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-pink-400" />
                <span className="text-sm">AI-Powered</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Your workouts,{' '}
              <span className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                supercharged
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Everything Strava Premium has, plus AI insights that actually make you want to train harder.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Feature 1: AI Roasts & Hype */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="group bg-slate-900/50 border border-slate-700/50 hover:border-pink-500/30 rounded-2xl p-8 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-colors">
                  <Flame className="w-8 h-8 text-pink-400" />
                </div>
                <div className="p-3 bg-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-colors">
                  <Heart className="w-8 h-8 text-pink-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">AI Roasts & Hype</h3>
              <p className="text-slate-300 leading-relaxed">
                Get brutally honest (or sickeningly sweet) AI-generated commentary on your workouts.
                Choose your vibe: savage roasts, wholesome hype, or somewhere in between.
              </p>
            </motion.div>

            {/* Feature 2: Personality Profiles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="group bg-slate-900/50 border border-slate-700/50 hover:border-purple-500/30 rounded-2xl p-8 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                  <Brain className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Personality Profiles</h3>
              <p className="text-slate-300 leading-relaxed">
                Discover your fitness persona based on your workout patterns. Are you a Weekend Warrior?
                Consistency King? Serial Starter? AI analyzes your habits and creates your unique profile.
              </p>
            </motion.div>

            {/* Feature 3: Beautiful Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="group bg-slate-900/50 border border-slate-700/50 hover:border-cyan-500/30 rounded-2xl p-8 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-cyan-500/10 rounded-xl group-hover:bg-cyan-500/20 transition-colors">
                  <TrendingUp className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Beautiful Stats</h3>
              <p className="text-slate-300 leading-relaxed">
                Visualize your progress with stunning charts and insights. Track PR trends, consistency
                streaks, and improvement patterns with graphs that look as good as your PRs feel.
              </p>
            </motion.div>

            {/* Feature 4: Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="group bg-slate-900/50 border border-slate-700/50 hover:border-yellow-500/30 rounded-2xl p-8 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-yellow-500/10 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Epic Achievements</h3>
              <p className="text-slate-300 leading-relaxed">
                Unlock badges, climb leaderboards, and celebrate milestones. From "First 5K" to
                "100 Day Streak," every victory gets the recognition it deserves.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-black/60">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Get started in{' '}
              <span className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                3 simple steps
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-2xl font-bold mb-6 shadow-lg shadow-cyan-500/30">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3">Connect Strava</h3>
              <p className="text-slate-300">
                Link your Strava account or upload GPX files. We sync your workouts automatically.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-2xl font-bold mb-6 shadow-lg shadow-purple-500/30">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3">Get Your Profile</h3>
              <p className="text-slate-300">
                Our AI analyzes your workout history and creates your unique fitness personality profile.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-2xl font-bold mb-6 shadow-lg shadow-pink-500/30">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3">Share Your Roasts</h3>
              <p className="text-slate-300">
                Get AI-generated roasts and hype for every workout. Share the savage ones on social.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-12 backdrop-blur-xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent mb-2">
                  10K+
                </div>
                <div className="text-slate-400">Active Athletes</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent mb-2">
                  500K+
                </div>
                <div className="text-slate-400">Workouts Roasted</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent mb-2">
                  50+
                </div>
                <div className="text-slate-400">Personality Types</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-2">
                  100%
                </div>
                <div className="text-slate-400">Free Forever</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-12 backdrop-blur-xl"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to prove it?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of athletes who've ditched the couch (and Strava Premium) for something better.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-full text-xl font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
            >
              Start Free Today
              <Sparkles className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/features" className="hover:text-cyan-400 transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
                <li><Link href="/roadmap" className="hover:text-cyan-400 transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-cyan-400 transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/help" className="hover:text-cyan-400 transition-colors">Help Center</Link></li>
                <li><Link href="/api" className="hover:text-cyan-400 transition-colors">API Docs</Link></li>
                <li><Link href="/community" className="hover:text-cyan-400 transition-colors">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms</Link></li>
                <li><Link href="/cookies" className="hover:text-cyan-400 transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛋️</span>
              <span className="font-bold text-lg">Couchproof</span>
            </div>
            <p className="text-slate-400 text-sm">
              &copy; 2025 Couchproof. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="https://twitter.com/couchproof" className="text-slate-400 hover:text-cyan-400 transition-colors">
                <Share2 className="w-5 h-5" />
              </Link>
              <Link href="https://instagram.com/couchproof" className="text-slate-400 hover:text-pink-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

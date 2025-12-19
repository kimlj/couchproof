'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import OAuthButton from '@/components/auth/OAuthButton';
import { signInWithGoogle, signInWithStrava } from '@/lib/supabase/auth';

export default function SignupPage() {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'strava' | null>(null);

  const handleGoogleSignUp = async () => {
    try {
      setLoadingProvider('google');
      await signInWithGoogle();
      // Redirect will be handled by Supabase
    } catch (error) {
      console.error('Error signing up with Google:', error);
      alert('Failed to sign up with Google. Please try again.');
      setLoadingProvider(null);
    }
  };

  const handleStravaSignUp = async () => {
    try {
      setLoadingProvider('strava');
      await signInWithStrava();
      // Redirect will be handled by Supabase
    } catch (error) {
      console.error('Error signing up with Strava:', error);
      alert('Failed to sign up with Strava. Please try again.');
      setLoadingProvider(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Get started</h2>
          <p className="text-slate-400">Create your account and prove you left the couch</p>
        </div>

        <div className="space-y-3">
          {/* Strava Button - Primary CTA */}
          <OAuthButton
            provider="strava"
            onClick={handleStravaSignUp}
            loading={loadingProvider === 'strava'}
            variant="signup"
          />

          {/* Google Button */}
          <OAuthButton
            provider="google"
            onClick={handleGoogleSignUp}
            loading={loadingProvider === 'google'}
            variant="signup"
          />
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800/50 text-slate-400">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Sign in link */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

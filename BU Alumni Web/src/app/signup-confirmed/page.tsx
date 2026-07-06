'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── Floating Orb ─── */
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

export default function SignupConfirmedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background p-4 py-10">
      {/* Background orbs */}
      <FloatingOrb className="w-[500px] h-[500px] bg-primary/30 -top-20 -left-20" delay={0} />
      <FloatingOrb className="w-[400px] h-[400px] bg-meadow/25 bottom-0 right-0" delay={2} />
      <FloatingOrb className="w-[300px] h-[300px] bg-emerald/20 top-1/3 right-1/4" delay={4} />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-20 w-20 mx-auto mb-4 rounded-2xl bg-white dark:bg-card border border-border flex items-center justify-center p-2 shadow-xl shadow-primary/10"
          >
            <img src="/logos/bu.png" alt="Baliuag University" className="h-full w-full object-contain" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-3xl font-display font-bold text-foreground"
          >
            BU Alumni
          </motion.h1>
        </div>

        {/* Success card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl bg-card border border-border shadow-xl shadow-primary/5 p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.4 }}
            className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </motion.div>

          <h2 className="text-2xl font-display font-bold text-foreground mb-3">
            Sign Up Confirmed!
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Your email has been verified and your BU Alumni account is now active. You can sign in using the email and password you registered.
          </p>

          <Button
            asChild
            className="w-full bg-primary hover:bg-emerald text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] h-11"
          >
            <Link href="/login" className="inline-flex items-center justify-center gap-2">
              Go to Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          Need help?{' '}
          <Link href="/login" className="text-primary font-semibold hover:text-emerald transition-colors">
            Contact support
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}

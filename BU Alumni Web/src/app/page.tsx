'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  FileText,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Users,
  ChevronRight,
  Quote,
  MapPin,
  Briefcase,
  TrendingUp,
  Award,
  Heart,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;
          const increment = target / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Floating Orb ─── */
function FloatingOrb({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
}

/* ─── Feature Card ─── */
function FeatureCard({
  icon: Icon,
  title,
  desc,
  accent,
  index,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  accent: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative rounded-2xl border border-mist/40 bg-white p-7 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-500"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}55)` }}
      />
      {/* Background glow on hover */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
        style={{ background: accent }}
      />

      <div
        className="relative h-14 w-14 rounded-xl flex items-center justify-center mb-5 shadow-inner ring-1 ring-black/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
        style={{ background: `${accent}15`, color: accent }}
      >
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="relative font-display font-bold text-xl text-forest group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="relative mt-3 text-sm text-slate leading-relaxed">{desc}</p>
      <div className="relative mt-4 flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0" style={{ color: accent }}>
        Learn more <ChevronRight className="h-4 w-4 ml-1" />
      </div>
    </motion.div>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  icon: Icon,
  value,
  suffix,
  label,
  index,
}: {
  icon: React.ElementType;
  value: number;
  suffix?: string;
  label: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative rounded-2xl bg-white border border-mist/30 p-6 text-center shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-2xl sm:text-3xl font-display font-bold text-forest">
        <AnimatedCounter target={value} suffix={suffix} />
      </div>
      <div className="mt-1 text-sm text-slate">{label}</div>
    </motion.div>
  );
}

/* ─── Testimonial Card ─── */
function TestimonialCard({
  quote,
  name,
  role,
  index,
}: {
  quote: string;
  name: string;
  role: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="relative rounded-2xl bg-white border border-mist/30 p-6 shadow-sm"
    >
      <Quote className="h-8 w-8 text-primary/20 mb-3" />
      <p className="text-charcoal text-sm leading-relaxed italic">{quote}</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-meadow flex items-center justify-center text-white text-sm font-bold">
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-forest">{name}</p>
          <p className="text-xs text-slate">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">
      {/* ─── Navigation ─── */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-mist/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-white border border-mist/40 flex items-center justify-center p-0.5 shadow-sm group-hover:shadow-md transition-shadow duration-300">
              <img src="/logos/bu.png" alt="BU" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-forest leading-tight">BU Alumni</span>
              <span className="hidden sm:inline text-[10px] text-primary/80 uppercase tracking-widest font-semibold ml-2">Tracer Study</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle className="text-forest hover:bg-primary/10" />
            <Link href="/login">
              <Button variant="ghost" className="text-forest hover:text-primary hover:bg-primary/5">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-emerald text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative min-h-svh flex items-center justify-center overflow-hidden">
        {/* Animated background orbs */}
        <FloatingOrb className="w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-primary/30 -top-20 -left-20 sm:-top-40 sm:-left-40" delay={0} />
        <FloatingOrb className="w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-meadow/25 top-1/3 -right-10 sm:-right-20" delay={2} />
        <FloatingOrb className="w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-emerald/20 bottom-20 left-1/4" delay={4} />
        <FloatingOrb className="w-[150px] h-[150px] sm:w-[300px] sm:h-[300px] bg-sage/30 top-20 right-1/3" delay={1} />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-mist/40 shadow-sm mb-8"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-sm font-medium text-charcoal">Official Graduate Tracer Study Platform</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.15] sm:leading-[1.1] tracking-tight"
          >
            <span className="text-forest">Track.</span>{' '}
            <span className="text-forest">Connect.</span>{' '}
            <span className="text-gradient">Thrive.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate leading-relaxed max-w-2xl mx-auto"
          >
            Baliuag University&apos;s official platform for alumni to share their journey,
            reconnect with fellow graduates, and help shape the future of BU.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="gap-2 bg-primary hover:bg-emerald text-white shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105 text-base px-8"
              >
                Join the Community <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-mist text-forest hover:bg-white hover:border-primary/30 hover:text-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 text-base px-8"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
          >
            {[
              { value: '10K+', label: 'Alumni Members' },
              { value: '50+', label: 'Programs' },
              { value: '100', label: 'Years of Excellence' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-display font-bold text-forest">{stat.value}</div>
                <div className="text-xs sm:text-sm text-slate mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-mist/50 flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* ─── Features ─── */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-semibold text-primary uppercase tracking-widest mb-3">Platform Features</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-forest">Built for Alumni Success</h2>
            <p className="mt-4 text-slate max-w-2xl mx-auto">
              Everything you need to stay connected with Baliuag University and your fellow graduates.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FileText,
                title: 'Tracer Study',
                desc: 'Complete the official CHED-aligned Graduate Tracer Survey and contribute to institutional research.',
                accent: '#4C992D',
              },
              {
                icon: MessageSquare,
                title: 'Alumni Forum',
                desc: 'Discuss careers, share opportunities, and reconnect with your batchmates in real-time.',
                accent: '#2D7A9A',
              },
              {
                icon: Users,
                title: 'Directory',
                desc: 'Find and connect with fellow BU graduates across industries and locations worldwide.',
                accent: '#7A4C99',
              },
              {
                icon: BarChart3,
                title: 'Insights',
                desc: 'Explore employment trends, salary benchmarks, and outcomes by cohort and program.',
                accent: '#D97706',
              },
            ].map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Banner ─── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-forest via-emerald to-primary" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={GraduationCap} value={12450} suffix="+" label="Alumni Registered" index={0} />
            <StatCard icon={MapPin} value={42} suffix="+" label="Countries Reached" index={1} />
            <StatCard icon={Briefcase} value={89} suffix="%" label="Employment Rate" index={2} />
            <StatCard icon={Heart} value={3500} suffix="+" label="Forum Discussions" index={3} />
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-semibold text-primary uppercase tracking-widest mb-3">Voices</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-forest">What Alumni Say</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "The BU Alumni Tracer helped me reconnect with my batchmates after 10 years. The forum is incredibly active and supportive.",
                name: "Maria Santos",
                role: "BSN '15 · Registered Nurse",
              },
              {
                quote: "I found my current job through a connection I made on the alumni directory. This platform truly bridges graduates to opportunities.",
                name: "Juan Dela Cruz",
                role: "BSBA '18 · Marketing Manager",
              },
              {
                quote: "Completing the tracer study was quick and meaningful. I love seeing how our batch data contributes to improving BU programs.",
                name: "Ana Reyes",
                role: "BSED '20 · Licensed Teacher",
              },
            ].map((t, i) => (
              <TestimonialCard key={t.name} {...t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-mint/60 via-paper to-mint/30" />
        <FloatingOrb className="w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-primary/15 -top-10 -right-10 sm:top-0 sm:right-0" delay={1} />
        <FloatingOrb className="w-[150px] h-[150px] sm:w-[300px] sm:h-[300px] bg-meadow/15 -bottom-10 -left-10 sm:bottom-0 sm:left-0" delay={3} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <div className="rounded-3xl bg-white border border-mist/40 p-10 sm:p-14 shadow-xl shadow-primary/5">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-meadow flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-forest">
              Ready to Reconnect?
            </h2>
            <p className="mt-4 text-slate max-w-xl mx-auto">
              Join thousands of Baliuag University alumni who are already tracking their success,
              sharing opportunities, and giving back to the BU community.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="gap-2 bg-primary hover:bg-emerald text-white shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105 text-base px-6 sm:px-8"
                >
                  Create Your Account <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-mist text-forest hover:bg-white hover:border-primary/30 hover:text-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 text-base px-6 sm:px-8"
                >
                  Already a Member?
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative bg-forest text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center p-1">
                  <img src="/logos/bu.png" alt="BU" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl">BU Alumni</h3>
                  <p className="text-xs text-white/60 uppercase tracking-widest">Tracer Study</p>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed max-w-sm">
                Baliuag University&apos;s official Graduate Tracer Study platform. 
                Empowering alumni to stay connected, share their journey, and shape the future of BU.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-white/80 mb-4">Platform</h4>
              <ul className="space-y-2.5">
                {['Dashboard', 'Tracer Study', 'Forum', 'Directory', 'Settings'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-white/60 hover:text-white text-sm transition-colors duration-200">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-white/80 mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="https://baliuagu.edu.ph/posts/baliuag-university-data-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white text-sm transition-colors duration-200">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <Link href="#" className="text-white/60 hover:text-white text-sm transition-colors duration-200">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-white/60 hover:text-white text-sm transition-colors duration-200">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">
              &copy; {new Date().getFullYear()} Baliuag University. All rights reserved.
            </p>
            <p className="text-white/40 text-xs">
              Made with care for the BU Community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

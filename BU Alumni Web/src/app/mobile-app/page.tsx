'use client';

import { AppLayout } from '@/components/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Smartphone,
  MessageSquare,
  Bell,
  BarChart3,
  Shield,
  Zap,
  Download,
  QrCode,
  ExternalLink,
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Community Forum',
    description: 'Browse threads, post discussions, and reply to fellow alumni — all from your pocket.',
  },
  {
    icon: BarChart3,
    title: 'Tracer Study',
    description: 'Complete your CHED Graduate Tracer Study survey with an easy step-by-step flow.',
  },
  {
    icon: Bell,
    title: 'Realtime Notifications',
    description: 'Get instant push notifications for replies, mentions, and forum activity.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade authentication with Supabase Auth and encrypted connections.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built with Flutter for native performance and buttery-smooth animations.',
  },
  {
    icon: Smartphone,
    title: 'Native Experience',
    description: 'Optimized for Android with Material 3 design and adaptive theming.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function MobileAppPage() {
  const apkUrl = 'https://drive.google.com/file/d/1mezf1st4huU0uwVjQKPu2p7B9OTKnzeg/view?usp=sharing';
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(apkUrl)}`;

  return (
    <AppLayout>
      <div className="relative max-w-5xl mx-auto pt-6 pb-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--jungle))]/8 text-[hsl(var(--jungle))] text-[10px] font-bold uppercase tracking-[0.15em] mb-4">
            <Smartphone className="h-3 w-3" />
            Mobile
          </div>
          <h1 className="text-5xl sm:text-6xl font-serif text-[hsl(var(--ink))] leading-[1.05]">
            BU Alumni <span className="text-gradient">Mobile</span>
          </h1>
          <p className="text-[hsl(var(--slate))] mt-4 max-w-2xl leading-relaxed text-lg">
            Take the Baliuag University Alumni community with you everywhere. Access the forum,
            tracer study, and directory — all in one native Android app.
          </p>
        </motion.div>

        {/* Download Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-14"
        >
          <Card className="rounded-2xl border-[hsl(var(--fog))] shadow-warm-lg overflow-hidden bg-[hsl(var(--card))]">
            <div className="h-1 w-full bg-gradient-to-r from-[hsl(var(--jungle))] via-[hsl(var(--bamboo))] to-[hsl(var(--terracotta))]" />
            <CardContent className="p-8 sm:p-10">
              <div className="flex flex-col lg:flex-row items-center gap-10">
                {/* QR Code */}
                <div className="shrink-0">
                  <div className="rounded-2xl bg-[hsl(var(--parchment))] p-4 shadow-inner ring-1 ring-[hsl(var(--fog))]">
                    <img
                      src={qrApiUrl}
                      alt="Download QR Code"
                      className="h-48 w-48 rounded-xl"
                    />
                  </div>
                  <p className="text-center text-xs text-[hsl(var(--slate))] mt-3 flex items-center justify-center gap-1">
                    <QrCode className="h-3 w-3" />
                    Scan to download
                  </p>
                </div>

                {/* Info */}
                <div className="flex-1 text-center lg:text-left">
                  <Badge
                    variant="secondary"
                    className="bg-[hsl(var(--jungle))]/10 text-[hsl(var(--jungle))] border-0 font-medium mb-4"
                  >
                    Android APK — v1.1.0
                  </Badge>
                  <h2 className="text-2xl font-serif text-[hsl(var(--ink))] mb-3">
                    Download the App
                  </h2>
                  <p className="text-[hsl(var(--slate))] leading-relaxed mb-6 max-w-md">
                    Install directly on your Android device. Enable <em>Install from Unknown Sources</em>{' '}
                    in your security settings if prompted.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                    <Button
                      className="bg-[hsl(var(--forest))] hover:bg-[hsl(var(--jungle))] text-[hsl(var(--paper))] shadow-warm-lg transition-all duration-300 hover:scale-[1.02] rounded-xl px-6 h-11"
                      asChild
                    >
                      <a href={apkUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Get APK
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl px-6 h-11 border-[hsl(var(--fog))] text-[hsl(var(--charcoal))] hover:border-[hsl(var(--jungle))] hover:text-[hsl(var(--jungle))]"
                      asChild
                    >
                      <a
                        href="https://github.com/fleurdelyxs-projects/bu-alumni-mobile/releases"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        All Releases
                      </a>
                    </Button>
                  </div>
                  <p className="text-xs text-[hsl(var(--slate))] mt-4">
                    File size: ~54 MB · Requires Android 8.0+
                  </p>
                  <p className="text-[11px] text-[hsl(var(--mist))] mt-2 max-w-sm">
                    Hosted on Google Drive. Tap the button to open the download page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={cardItem}>
                <Card className="h-full rounded-2xl border-[hsl(var(--fog))] shadow-warm hover:shadow-warm-lg transition-all duration-500 hover:-translate-y-1 bg-[hsl(var(--card))]">
                  <CardContent className="p-6">
                    <div className="h-10 w-10 rounded-xl bg-[hsl(var(--jungle))]/8 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-[hsl(var(--jungle))]" />
                    </div>
                    <h3 className="font-serif text-lg text-[hsl(var(--ink))] mb-1">{feature.title}</h3>
                    <p className="text-sm text-[hsl(var(--slate))] leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-14 text-center"
        >
          <p className="text-sm text-[hsl(var(--slate))]">
            iOS version coming soon. Questions? Visit the{' '}
            <a href="/forum" className="text-[hsl(var(--jungle))] hover:underline font-medium">
              Forum
            </a>{' '}
            or contact support.
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}

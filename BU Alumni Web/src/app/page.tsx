import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, FileText, MessageSquare, BarChart3, ArrowRight, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      {/* Hero */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg">BU</span>
            </div>
            <span className="font-display font-bold text-xl text-forest">Alumni Tracer</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-mint/40 via-paper to-white" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-display font-bold text-forest leading-tight">
              Track. Connect. <span className="text-primary">Thrive.</span>
            </h1>
            <p className="mt-6 text-lg text-charcoal leading-relaxed max-w-2xl">
              Baliuag University's official Graduate Tracer Study platform. Share your journey,
              connect with fellow alumni, and help shape the future of BU.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Join the Community <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-forest">Built for Alumni</h2>
            <p className="mt-4 text-slate max-w-2xl mx-auto">
              Everything you need to stay connected with Baliuag University and your fellow graduates.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FileText,
                title: 'Tracer Study',
                desc: 'Complete the official CHED-aligned Graduate Tracer Survey.',
                color: 'bg-primary/10 text-primary',
              },
              {
                icon: MessageSquare,
                title: 'Alumni Forum',
                desc: 'Discuss careers, share opportunities, and reconnect.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: Users,
                title: 'Directory',
                desc: 'Find and connect with fellow BU graduates.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: BarChart3,
                title: 'Insights',
                desc: 'Explore employment trends and outcomes by cohort.',
                color: 'bg-amber-50 text-amber-600',
              },
            ].map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl border bg-paper hover:shadow-md transition-shadow">
                <div className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-forest">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate">
            &copy; {new Date().getFullYear()} Baliuag University. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

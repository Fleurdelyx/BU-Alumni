'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ExternalLink, Loader2, Globe, Shield, FileText, Lock, Eye, Clock, Users, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface GlancePreviewProps {
  url: string;
  title?: string;
  children: React.ReactNode;
  onScrollComplete?: () => void;
}

// Hardcoded Baliuag University Privacy Policy — beautifully formatted
function PrivacyPolicyContent() {
  const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
    <section className="mb-8 last:mb-0">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      <div className="pl-[42px]">
        {children}
      </div>
    </section>
  );

  const BulletList = ({ items }: { items: string[] }) => (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm text-foreground/80 leading-relaxed">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-border/60">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
          Data Privacy Statement
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Baliuag University ("School" or "We") is bound by the Data Privacy Act of 2012.
          We are committed to maintaining the accuracy, confidentiality and security of your personal information.
        </p>
      </div>

      <Section icon={FileText} title="What personal information is collected?">
        <p className="text-sm text-foreground/80 leading-relaxed mb-3">
          To conduct business, comply with applicable laws and regulations, and continually develop and improve policies and programs, we collect and process the following personal data:
        </p>
        <BulletList items={[
          "Name, age, date of birth, place of birth, citizenship, gender, marital status, religion, ethnicity, health and disability data, interests, memberships, languages, educational background, and family-related data",
          "Contact information: residential address, office address, phone numbers, email address, mailing addresses, banking and financial data, government ID numbers (SSS, TIN, PhilHealth, PAG-IBIG, UMID, professional licenses, driver's license)",
          "Work-related information: work experience, trainings and seminars, names and addresses of former employers",
          "Such other information as we may deem reasonably necessary to accomplish the abovementioned purposes",
        ]} />
        <p className="text-sm text-foreground/80 leading-relaxed mt-3">
          We may also collect personal data from other sources (e.g., medical professionals, references) and include these in the personal data we collect and process.
        </p>
      </Section>

      <Section icon={Eye} title="How does the School collect personal information?">
        <BulletList items={[
          "Forms filled out by you, face-to-face meetings and interviews, emails and telephone calls",
          "Photographic and video images, digital material or biometric records",
          "Recordings from closed-circuit television cameras installed in the School premises for security purposes",
          "Online services and platforms — servers automatically record information your browser sends (server address, domain, date/time, pages accessed, browser type, cookies)",
          "Chat sessions, email exchanges, online platforms or bulletin board discussions you participate in",
        ]} />
        <p className="text-sm text-foreground/80 leading-relaxed mt-3">
          The School recognizes inherent risks associated with transmission of information over the internet. You may use other methods of communication such as post, fax or telephone if preferred.
        </p>
      </Section>

      <Section icon={Users} title="Who uses your information?">
        <p className="text-sm text-foreground/80 leading-relaxed">
          Your personal information is accessed and used by School personnel who have a legitimate interest in it for the purpose of carrying out their contractual duties.
        </p>
      </Section>

      <Section icon={Shield} title="How will the School use your personal information?">
        <p className="text-sm text-foreground/80 leading-relaxed mb-3">
          The School will use personal information for the primary purpose of collection, and for related secondary purposes to which you have consented:
        </p>
        <BulletList items={[
          "To identify you personally",
          "To comply with human resource requirements and develop/update employee policies and programs",
          "To provide employee benefits",
          "To ensure compliance with applicable policies, laws and regulations",
          "To facilitate legitimate business transactions and interests of the School",
          "To establish, manage or terminate your employment relationship",
          "To communicate with you or your family members as needed",
        ]} />
      </Section>

      <Section icon={Lock} title="Who might the School disclose personal information to?">
        <BulletList items={[
          "Third-party service providers, vendors, suppliers, customers, directors, officers, employees, shareholders, agents, consultants, advisers, banks, contracting parties",
          "Government and law enforcement agencies and regulatory bodies",
          "To comply with court orders, government agencies, stock exchanges and applicable laws",
          "To protect the rights and properties of the School and ensure safety",
          "To conduct investigations of policy/law breaches and enforce sanctions",
          "During emergency situations or where necessary to protect safety",
          "With your consent where required by law",
          "Overseas recipients (e.g., school exchange programs); cloud storage may mean data resides on servers outside the Philippines",
        ]} />
      </Section>

      <Section icon={Clock} title="How long will the School retain your information?">
        <p className="text-sm text-foreground/80 leading-relaxed">
          The School will retain your personal information indefinitely for historical and statistical purposes. Where a retention period is provided by law, all records after such period will be securely disposed of.
        </p>
      </Section>

      <Section icon={Shield} title="How does the School manage and secure personal information?">
        <BulletList items={[
          "Staff are required to respect the confidentiality of personal information and privacy of individuals",
          "Locked storage of paper records",
          "Password access rights to computerized records",
          "Steps to protect against misuse, interference, loss, unauthorized access, modification or disclosure",
        ]} />
      </Section>

      <Section icon={AlertTriangle} title="How will the School handle data breaches?">
        <p className="text-sm text-foreground/80 leading-relaxed">
          Any data security incident or breach will be recorded and reported as required by law. The School will take all necessary and reasonable steps to address the incident and mitigate any negative effects. If there is strong suspicion that an incident affects your personal information, the School will notify you in an appropriate manner.
        </p>
      </Section>

      <Section icon={FileText} title="Your rights under the Data Privacy Act">
        <p className="text-sm text-foreground/80 leading-relaxed mb-3">
          Under the Data Privacy Act of 2012, you have the following rights:
        </p>
        <BulletList items={[
          "Object to the processing of your personal data",
          "Obtain access to any personal information the School holds about you",
          "Advise the School of any perceived inaccuracy",
          "Have your personal data corrected, erased, or blocked on reasonable grounds",
          "Such other rights under applicable data privacy laws and regulations",
        ]} />
        <p className="text-sm text-foreground/80 leading-relaxed mt-3">
          In updating your personal data, you confirm that any information you provide is true, correct and up-to-date.
        </p>
      </Section>

      {/* Footer note */}
      <div className="mt-8 pt-6 border-t border-border/60 text-xs text-muted-foreground leading-relaxed space-y-2">
        <p>
          By using the platform, you consent to our collection and processing of your personal data for such period of time as may be provided in our applicable documents or records retention policies.
        </p>
        <p>
          The School may, from time to time and at its sole discretion, review and update this Statement to take account of new laws and technology. Any modification shall be effective immediately upon posting.
        </p>
      </div>
    </div>
  );
}

// Sub-component that handles scroll detection for the article content
function ScrollableContent({
  onScrollComplete,
  isPrivacyPolicy,
  articleText,
}: {
  onScrollComplete?: () => void;
  isPrivacyPolicy: boolean;
  articleText: string | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasFired = useRef(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!onScrollComplete) return;
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const progress = scrollHeight <= clientHeight ? 100 : Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
      setScrollProgress(progress);
      
      if (hasFired.current) return;
      // Trigger when within 80px of the bottom
      if (scrollTop + clientHeight >= scrollHeight - 80) {
        hasFired.current = true;
        setIsComplete(true);
        onScrollComplete();
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    // Check immediately in case content is short
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, [onScrollComplete]);

  return (
    <div className="relative h-full">
      {/* Scroll progress bar */}
      {isPrivacyPolicy && onScrollComplete && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {isComplete ? (
                <span className="inline-flex items-center gap-1 text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  You can now agree to the Privacy Policy
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
                  Scroll to the bottom to enable agreement
                </span>
              )}
            </span>
            <span className={cn("text-xs font-bold", isComplete ? "text-primary" : "text-muted-foreground")}>
              {scrollProgress}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", isComplete ? "bg-primary" : "bg-primary/60")}
              initial={{ width: 0 }}
              animate={{ width: `${scrollProgress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      )}
      <div
        ref={scrollRef}
        className={cn(
          "h-full overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
          isPrivacyPolicy && onScrollComplete && "pt-16"
        )}
      >
        {isPrivacyPolicy ? (
          <PrivacyPolicyContent />
        ) : articleText ? (
          <div className="p-6 sm:p-8 max-w-2xl mx-auto">
            <article className="prose prose-sm dark:prose-invert max-w-none">
              {articleText.split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={i} className="h-4" />;
                if (trimmed.startsWith('# ')) {
                  return <h1 key={i} className="text-2xl font-display font-bold text-foreground mb-4">{trimmed.replace('# ', '')}</h1>;
                }
                if (trimmed.startsWith('## ')) {
                  return <h2 key={i} className="text-xl font-display font-bold text-foreground mt-6 mb-3">{trimmed.replace('## ', '')}</h2>;
                }
                if (trimmed.startsWith('### ')) {
                  return <h3 key={i} className="text-lg font-semibold text-foreground mt-4 mb-2">{trimmed.replace('### ', '')}</h3>;
                }
                return <p key={i} className="text-sm text-foreground/80 leading-relaxed mb-3">{trimmed}</p>;
              })}
            </article>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function GlancePreview({ url, title = 'Preview', children, onScrollComplete }: GlancePreviewProps) {
  const [open, setOpen] = useState(false);
  const [articleText, setArticleText] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'article' | 'fallback'>('loading');

  const isPrivacyPolicy = url.includes('baliuag') && url.includes('privacy');

  const handleOpen = useCallback(() => {
    setOpen(true);

    if (isPrivacyPolicy) {
      // Hardcoded: show immediately, no fetch needed
      setStatus('article');
      return;
    }

    setStatus('loading');
    setArticleText(null);

    // Try to fetch a readable text version
    const jinaUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;
    fetch(jinaUrl, { method: 'GET', mode: 'cors' })
      .then((res) => (res.ok ? res.text() : Promise.reject()))
      .then((text) => {
        if (text && text.length > 100 && !text.startsWith('<!')) {
          setArticleText(text);
          setStatus('article');
        } else {
          setStatus('fallback');
        }
      })
      .catch(() => {
        setStatus('fallback');
      });

    // Hard timeout: always show something within 2s
    const t = setTimeout(() => {
      setStatus((s) => (s === 'loading' ? 'fallback' : s));
    }, 2000);

    return () => clearTimeout(t);
  }, [url, isPrivacyPolicy]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setStatus('loading');
    setArticleText(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="text-primary hover:text-emerald font-medium transition-colors inline-flex items-center gap-1"
      >
        {children}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel */}
            <motion.div
              className="relative w-full max-w-3xl h-[80vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col"
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/95 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{title}</p>
                    <p className="text-xs text-muted-foreground truncate">{url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="relative flex-1 overflow-hidden bg-background">
                {/* Loading */}
                <AnimatePresence>
                  {status === 'loading' && (
                    <motion.div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background z-20"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Loading preview…</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Article text */}
                {status === 'article' && (
                  <ScrollableContent onScrollComplete={onScrollComplete} isPrivacyPolicy={isPrivacyPolicy} articleText={articleText} />
                )}

                {/* Fallback card */}
                {status === 'fallback' && (
                  <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Globe className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground mt-1 break-all max-w-md">{url}</p>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      This external page can't be previewed inline. Open it in a new tab to view the full content.
                    </p>
                    <Button
                      className="gap-1.5 mt-2 rounded-xl px-6 h-11"
                      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in New Tab
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

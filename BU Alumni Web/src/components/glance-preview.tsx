'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ExternalLink, Loader2, Globe, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocumentPreviewProps {
  url: string;
  title: string;
  documentType: 'privacy' | 'terms';
  triggerLabel: React.ReactNode;
  onScrollComplete?: () => void;
  className?: string;
}

// ==================== SHARED UI SHELL ====================

function DocumentPreviewShell({
  url,
  title,
  documentType,
  triggerLabel,
  onScrollComplete,
  className,
}: DocumentPreviewProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'loading' | 'article' | 'fallback'>('loading');
  const [articleText, setArticleText] = useState<string | null>(null);

  const isHardcoded = documentType === 'privacy' || documentType === 'terms';

  const handleOpen = useCallback(() => {
    setOpen(true);

    if (isHardcoded) {
      setStatus('article');
      return;
    }

    setStatus('loading');
    setArticleText(null);

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

    const t = setTimeout(() => {
      setStatus((s) => (s === 'loading' ? 'fallback' : s));
    }, 2000);

    return () => clearTimeout(t);
  }, [url, isHardcoded]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setStatus('loading');
    setArticleText(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, handleClose]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={cn("font-medium transition-colors inline-flex items-center gap-1", className || "text-primary hover:text-emerald")}
      >
        {triggerLabel}
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
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Open</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleClose}
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="relative flex-1 overflow-hidden bg-background">
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

                {status === 'article' && (
                  <ScrollableContent documentType={documentType} onScrollComplete={onScrollComplete}>
                    {documentType === 'privacy' ? <PrivacyPolicyContent /> : <TermsOfServiceContent />}
                  </ScrollableContent>
                )}

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

function ScrollableContent({
  children,
  onScrollComplete,
  documentType,
}: {
  children: React.ReactNode;
  onScrollComplete?: () => void;
  documentType: 'privacy' | 'terms';
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasFired = useRef(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const docLabel = documentType === 'privacy' ? 'Privacy Policy' : 'Terms of Service';

  useEffect(() => {
    if (!onScrollComplete) return;
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const progress =
        scrollHeight <= clientHeight ? 100 : Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
      setScrollProgress(progress);

      if (hasFired.current) return;
      if (scrollTop + clientHeight >= scrollHeight - 80) {
        hasFired.current = true;
        setIsComplete(true);
        onScrollComplete();
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, [onScrollComplete]);

  return (
    <div className="relative h-full">
      {onScrollComplete && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {isComplete ? (
                <span className="inline-flex items-center gap-1 text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  You can now agree to the {docLabel}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
                  Scroll to the bottom to enable agreement
                </span>
              )}
            </span>
            <span className={cn('text-xs font-bold', isComplete ? 'text-primary' : 'text-muted-foreground')}>
              {scrollProgress}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', isComplete ? 'bg-primary' : 'bg-primary/60')}
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
          'h-full overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent',
          onScrollComplete && 'pt-16'
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ==================== PRIVACY POLICY CONTENT ====================

function PrivacyPolicyContent() {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-8 last:mb-0">
      <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
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
      <div className="mb-8 pb-6 border-b border-border/60">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
          Baliuag University Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Baliuag University ("BU" or the "University") recognizes and upholds the fundamental right of every individual to privacy and is committed to protecting personal information in compliance with the Data Privacy Act of 2012, its Implementing Rules and Regulations, and other applicable issuances of the National Privacy Commission.
        </p>
      </div>

      <Section title="Data Subjects">
        <p className="text-sm text-foreground/80 leading-relaxed">
          As part of its commitment to responsible and transparent data processing, the University adopts this Privacy Policy to guide the collection, use, storage, disclosure, retention, and protection of personal information of its various data subjects, including:
        </p>
        <BulletList items={[
          "Students and applicants for admission",
          "Employees and applicants for employment, including faculty members, staff, contractual, and project-based personnel",
          "Alumni",
          "Visitors and guests",
          "Other individuals or entities with juridical, contractual, academic, research, extension, or official relations with the University",
        ]} />
        <p className="text-sm text-foreground/80 leading-relaxed">
          By submitting personal information to the University, accomplishing forms, accessing University systems, participating in university activities, or signing any applicable consent or data privacy forms, the data subject acknowledges that they have read, understood, and agreed to the terms of this Privacy Policy. The University reserves the right to review, amend, update, or modify this Privacy Policy from time to time; any revisions shall take effect immediately upon publication through the University's official website, portals, or other authorized communication channels.
        </p>
      </Section>

      <Section title="1. What Personal Information Does the University Collect?">
        <p className="text-sm text-foreground/80 leading-relaxed">
          The University collects, processes, stores, and maintains personal information necessary for the performance of its academic, administrative, research, employment, contractual, security, and other legitimate institutional functions. The personal information collected may include, but is not limited to:
        </p>
        <BulletList items={[
          "Full name, age, date of birth, sex, civil status, nationality, and photograph",
          "Residential and mailing address; email address, telephone number, and other contact details",
          "Family background and emergency contact information",
          "Educational background, academic records, scholastic performance, certifications, licensure information, and disciplinary records",
          "Employment records, professional qualifications, work experience, payroll and benefits information, and performance evaluations",
          "Medical, health, wellness, and other sensitive personal information necessary for lawful and legitimate purposes",
          "Information related to curricular, co-curricular, and extra-curricular activities, including student organization membership, leadership positions, competitions, outreach programs, internships, exchange programs, research activities, and seminars",
          "Information generated through the use of university facilities, systems, platforms, websites, learning management systems, libraries, and security systems, including CCTV recordings and access logs",
          "Other information necessary for the fulfillment of the University's legal obligations, contractual commitments, institutional functions, and legitimate interests",
        ]} />
        <p className="text-sm text-foreground/80 leading-relaxed">
          In certain circumstances, the University may also obtain personal information from third parties such as parents or guardians, previous schools, employers, government agencies, medical professionals, references, partner institutions, or other lawful sources. Such information shall be afforded the same level of protection as personal information directly provided to the University.
        </p>
      </Section>

      <Section title="2. How Does the University Collect Personal Information?">
        <p className="text-sm text-foreground/80 leading-relaxed">
          The University generally collects personal information through lawful, fair, and transparent means, including but not limited to:
        </p>
        <BulletList items={[
          "Accomplished application forms, registration forms, contracts, surveys, and other official documents",
          "Face-to-face meetings, interviews, consultations, seminars, and University activities",
          "Telephone calls, emails, written correspondence, and other communication channels",
          "Online portals, websites, learning management systems, online educational platforms, mobile applications, Google forms, online registration systems, multimedia submissions, and official social media engagement channels managed or authorized by the University",
          "Submission of documentary requirements, photographs, video recordings, audio recordings, digital files, and biometric information where permitted by law",
          "Security and monitoring systems, including CCTV cameras, visitor management systems, and access control mechanisms",
          "Information obtained from third parties such as parents or guardians, previous schools, employers, government agencies, partner institutions, references, and lawful public sources",
        ]} />
        <p className="text-sm text-foreground/80 leading-relaxed">
          The University recognizes that the transmission and processing of information through the internet and electronic platforms involve certain inherent risks. Data subjects are encouraged to exercise caution and responsibility when providing or sharing personal information through email, websites, online services, educational platforms, social media platforms, chat systems, discussion boards, or similar digital environments. When individuals access University websites or digital services, the University and its authorized third-party service providers may automatically collect technical and usage information such as IP addresses, browser type, device information, access logs, cookies, session information, and usage activity for security, analytics, system administration, and service improvement purposes.
        </p>
      </Section>

      <Section title="3. Who May Access and Use Personal Information?">
        <p className="text-sm text-foreground/80 leading-relaxed">
          Personal information collected by the University may be accessed, processed, and used only by authorized University personnel, offices, departments, and duly authorized third parties who have a legitimate and lawful purpose in relation to the performance of their official, contractual, academic, administrative, operational, research, security, or legal functions. Access is limited to individuals who require such information in the fulfillment of their duties and responsibilities and who are bound by obligations of confidentiality, data privacy, and information security.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Depending on the nature of the relationship with the University, personal information may be accessed and used by authorized personnel involved in admission, enrollment, academic instruction, assessment, student services, human resource management, recruitment, payroll administration, employee relations, research, extension, community engagement, alumni relations, career services, finance, accounting, procurement, legal, compliance, audit, information technology, system administration, records management, and security operations. The University may likewise share or disclose personal information to government agencies, accrediting bodies, partner institutions, service providers, contractors, or other third parties when such disclosure is authorized by law, necessary for the performance of contractual or institutional obligations, required for public authority functions, or made with the consent of the data subject, where applicable.
        </p>
      </Section>

      <Section title="4. How Does the University Use Personal Information?">
        <p className="text-sm text-foreground/80 leading-relaxed">
          The University processes and uses personal information to effectively carry out its academic, administrative, operational, research, employment, security, and other legitimate institutional functions consistent with the Data Privacy Act of 2012. Personal information may be processed for purposes that include, but are not limited to:
        </p>
        <BulletList items={[
          "Evaluating and processing applications for admission, employment, scholarships, grants, research participation, and other University programs or services",
          "Facilitating enrollment, registration, hiring, accreditation, appointments, and other institutional transactions",
          "Establishing, maintaining, updating, and securing academic, employment, alumni, financial, health, administrative, and other official records",
          "Managing and evaluating academic performance, class participation, attendance, research outputs, co-curricular and extra-curricular involvement, employee performance, and institutional activities",
          "Administering learning management systems, information technology resources, online educational platforms, and other digital services",
          "Providing student support, employee support, health, counseling, library, sports, transportation, campus mobility, safety, security, and other related services",
          "Facilitating internships, exchange programs, on-the-job training, community engagement, research collaborations, and partnerships with external organizations or institutions",
          "Conducting investigations, disciplinary proceedings, grievance handling, compliance monitoring, risk management, and security operations",
          "Preparing statistical reports, institutional research, analytics, accreditation requirements, audits, and government compliance reports",
          "Maintaining directories, alumni relations, career placement services, and communication networks",
          "Disseminating official announcements, advisories, emergency notifications, and other institutional communications",
          "Producing publications, promotional materials, marketing campaigns, and documentation of university events and activities",
          "Soliciting participation in surveys, research studies, assessments, and non-commercial institutional initiatives",
          "Carrying out the day-to-day administration and operations of the University",
          "Fulfilling contractual obligations, protecting lawful interests, and complying with legal, regulatory, and public authority requirements",
        ]} />
        <p className="text-sm text-foreground/80 leading-relaxed">
          The University processes personal information only to the extent necessary and proportionate to the declared and legitimate purposes for which such information was collected. Reasonable organizational, physical, and technical safeguards are implemented to ensure the confidentiality, integrity, availability, and security of personal information under its custody.
        </p>
      </Section>

      <Section title="5. To Whom May the University Disclose Personal Information?">
        <p className="text-sm text-foreground/80 leading-relaxed">
          The University may disclose or share personal information, including sensitive personal information, to authorized individuals, offices, organizations, or entities when such disclosure is necessary, lawful, and consistent with the legitimate purposes for which the information was collected, as well as in compliance with the Data Privacy Act of 2012 and other applicable laws and regulations. Disclosures may be made to government agencies, regulatory bodies, accrediting institutions, and public authorities when required or authorized by law; educational institutions, partner universities, training institutions, and research organizations for academic collaborations; medical professionals, healthcare providers, counselors, psychologists, insurers, and emergency responders for health, wellness, safety, insurance, or emergency-related purposes; third-party service providers, suppliers, contractors, consultants, auditors, legal advisers, and other entities engaged by the University; parents, legal guardians, next of kin, authorized representatives, or lawful heirs when appropriate and permitted by law; alumni associations, foundations, partner organizations, sponsors, and fundraising or development entities; providers of information technology services, cloud storage, communication platforms, learning management systems, and other digital or electronic systems; organizers, coordinators, and partners involved in university-sponsored programs, events, competitions, outreach activities, and research initiatives; and financial institutions, payment processors, scholarship providers, and entities involved in grants, sponsorships, payroll, or financial assistance programs.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          In certain cases, the University may transfer or disclose personal information to recipients located outside the Philippines, such as for international academic partnerships, exchange programs, cloud-based services, research collaborations, certifications, or other legitimate institutional purposes. Where cross-border transfer of personal information is necessary, the University shall take reasonable steps to ensure that appropriate safeguards, security measures, and data protection standards are implemented consistent with applicable data privacy laws and regulations.
        </p>
      </Section>

      <Section title="6. How Long Does the University Retain Personal Information?">
        <p className="text-sm text-foreground/80 leading-relaxed">
          The University retains personal information only for as long as necessary to fulfill the purposes for which such information was collected and processed, including the performance of academic, administrative, operational, employment, research, security, legal, regulatory, and historical functions of the University. Certain records and documents may be retained for extended periods or indefinitely for legitimate academic, archival, historical, statistical, research, accreditation, alumni, or institutional purposes, subject to the implementation of appropriate safeguards and security measures. Where retention periods are prescribed by law, regulation, or official policy, the University shall securely dispose of, anonymize, archive, or delete personal information after the applicable retention period has expired and when such information is no longer necessary for lawful or legitimate purposes. Disposal or destruction of records shall be conducted in a manner that protects the confidentiality and privacy of the data subject and prevents unauthorized access, use, disclosure, or recovery of personal information.
        </p>
      </Section>

      <Section title="7. How Does the University Protect and Secure Personal Information?">
        <p className="text-sm text-foreground/80 leading-relaxed">
          The University is committed to protecting the privacy, confidentiality, integrity, and security of personal information under its custody and control. The University implements reasonable and appropriate organizational, physical, and technical measures to safeguard personal information against unauthorized access, disclosure, misuse, alteration, destruction, loss, or any other unlawful processing. All University personnel are required to observe confidentiality obligations and uphold the privacy rights of data subjects. Access to personal information is restricted only to authorized individuals who require such access in the performance of their legitimate duties and responsibilities.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          The University adopts and maintains appropriate security measures which may include secure storage and controlled access to physical records and documents; password protection, user authentication, and role-based access controls for electronic systems and databases; encryption, firewalls, antivirus software, monitoring systems, and other cybersecurity measures for digital information and networks; data privacy and information security policies, protocols, and training programs for university personnel; security monitoring systems, including CCTV and access control mechanisms where appropriate; procedures for secure transmission, retention, backup, recovery, disposal, and destruction of records and data; and regular assessment, review, and enhancement of security practices and data protection measures.
        </p>
      </Section>

      <Section title="8. How Does the University Handle Data Breaches and Security Incidents?">
        <p className="text-sm text-foreground/80 leading-relaxed">
          Any actual, suspected, or potential data security incident or personal data breach that comes to the attention of the University shall be properly documented, investigated, assessed, and managed in accordance with established University policies, procedures, and applicable laws and regulations. The University shall take all necessary, appropriate, and reasonable measures to contain, mitigate, and address the effects of any data security incident or personal data breach. Where required by law or when there are reasonable grounds to believe that a personal data breach is likely to affect the rights, freedoms, or interests of data subjects, the University shall notify the appropriate regulatory authorities and the affected individuals within the periods and in the manner prescribed by applicable laws and regulations.
        </p>
      </Section>

      <Section title="9. What Are the Rights of Data Subjects Regarding their Personal Information?">
        <p className="text-sm text-foreground/80 leading-relaxed">
          Under the Data Privacy Act of 2012, all data subjects of the University are granted specific rights in relation to the personal information processed by the University. Data subjects have the right to be informed about how their personal information is collected and processed, to access the personal data held by the University, and to request correction or rectification of any inaccurate, outdated, or incomplete information. They also have the right to object to the processing of their personal data, to withdraw consent where applicable, and to request the suspension, blocking, removal, or destruction of their personal information, subject to lawful grounds and applicable regulations.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Requests for access, correction, or other rights may be made by submitting a formal written request to the appropriate University office, such as the concerned department head, College Dean, or University Registrar. The University may charge reasonable fees to cover administrative costs such as verifying identity, locating, retrieving, reviewing, and reproducing requested records, where applicable and permitted by law. Access to personal information may be denied or restricted in certain circumstances, including situations where disclosure would violate the privacy rights of other individuals, compromise security, safety, or the University's duty of care, conflict with legal, regulatory, or contractual obligations, or fall under exemptions provided under applicable data privacy laws.
        </p>
      </Section>

      <Section title="10. Inquiries and Concerns">
        <p className="text-sm text-foreground/80 leading-relaxed">
          For any questions, clarifications, or further information regarding how the University collects, processes, stores, discloses, or protects personal information, data subjects may contact the University's designated Data Protection Officer:
        </p>
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground/80 leading-relaxed">
          <p className="font-semibold">Data Protection Officer</p>
          <p>Atty. Susan B. Jacinto</p>
          <p>Legal Counsel / Data Protection Officer</p>
          <p>Email: dpo@baliuagu.edu.ph</p>
          <p>Office Address: 1069 Gil Carlos Street, Baliwag, Bulacan</p>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          The University shall promptly review, investigate, and evaluate all received concerns or complaints in accordance with applicable laws, regulations, and internal policies. A response or formal decision shall be communicated to the concerned data subject within a reasonable period, depending on the nature and complexity of the inquiry or complaint.
        </p>
      </Section>
    </div>
  );
}

// ==================== TERMS OF SERVICE CONTENT ====================

function TermsOfServiceContent() {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-8 last:mb-0">
      <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
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
      <div className="mb-8 pb-6 border-b border-border/60">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
          Personal Information Consent Form
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          By using the BU Alumni Tracer Study platform, you acknowledge and agree to the following terms regarding the collection, processing, storage, and use of your personal information in accordance with the University's Privacy Policy and the Data Privacy Act of 2012.
        </p>
      </div>

      <Section title="Consent to Data Processing">
        <p className="text-sm text-foreground/80 leading-relaxed">
          I, as a data subject of Baliuag University ("BU" or the "University"), hereby acknowledge and agree to the following terms regarding the collection, processing, storage, and use of my personal information in accordance with the University's Privacy Policy and the Data Privacy Act of 2012.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          I understand that by applying for admission, enrollment, employment, engagement, or participation in any program, service, or activity of the University, I voluntarily allow BU to collect, process, store, and use my personal, sensitive personal, and privileged information for legitimate academic, administrative, employment, operational, research, security, and institutional purposes, as defined in the University's Privacy Policy.
        </p>
      </Section>

      <Section title="Accuracy of Information">
        <p className="text-sm text-foreground/80 leading-relaxed">
          I confirm that all personal information I provide to BU is true, accurate, complete, and up to date. I understand that the University reserves the right to review, correct, revoke, or modify any decision or transaction made based on inaccurate, misleading, or false information submitted.
        </p>
      </Section>

      <Section title="Marketing and Communications">
        <p className="text-sm text-foreground/80 leading-relaxed">
          I understand and acknowledge that the University, through its Admission and Marketing Services Office (AMSO), may collect, process, use, publish, and disseminate my personal information, photographs, audio recordings, and video recordings through official University platforms, including the BU website, Learning Management System (LMS) for students and Teaching Personnel, online platforms, Google Forms, social media accounts, promotional materials, and other institutional communication channels for legitimate educational, marketing, documentation, and institutional purposes, subject to applicable laws and University policies.
        </p>
      </Section>

      <Section title="Reliance on Official Documents">
        <p className="text-sm text-foreground/80 leading-relaxed">
          I acknowledge that I have not relied on any oral or written representations, statements, or assurances outside of the University's official Privacy Policy, consent forms, and authorized communications.
        </p>
      </Section>

      <Section title="Condition of Engagement">
        <p className="text-sm text-foreground/80 leading-relaxed">
          I understand that my consent to the processing of personal information, together with compliance with the University's Privacy Policy and related institutional rules, is a requirement for my admission, enrollment, employment, participation, or continued engagement with the University.
        </p>
      </Section>

      <Section title="Dispute Resolution">
        <p className="text-sm text-foreground/80 leading-relaxed">
          I agree that any concern, issue, or dispute arising from the processing of my personal information shall first be addressed through good faith dialogue with the University. If unresolved, it may be elevated in accordance with applicable Philippine laws and appropriate dispute resolution mechanisms.
        </p>
      </Section>

      <Section title="Scope of Consent">
        <p className="text-sm text-foreground/80 leading-relaxed">
          I understand that this consent applies not only to students but also to other data subjects of the University, including applicants for admission or employment, employees, faculty, staff, alumni, visitors, contractors, partners, and other individuals or entities with legitimate or official relations with the University.
        </p>
      </Section>

      <Section title="Data Subject Rights">
        <p className="text-sm text-foreground/80 leading-relaxed">
          I understand that I retain my rights as a data subject under the Data Privacy Act of 2012, including the right to be informed, to access, to object, to correct, and to request appropriate remedies concerning the processing of my personal information, subject to lawful limitations and institutional requirements.
        </p>
      </Section>

      <div className="mt-8 pt-6 border-t border-border/60 text-xs text-muted-foreground leading-relaxed">
        <p>
          By checking "I agree" below, you confirm that you have read, understood, and consent to the terms of this Personal Information Consent Form and the Baliuag University Privacy Policy.
        </p>
      </div>
    </div>
  );
}

// ==================== EXPORTED COMPONENTS ====================

export function PrivacyPolicyPreview({ children, onScrollComplete, className }: { children: React.ReactNode; onScrollComplete?: () => void; className?: string }) {
  return (
    <DocumentPreviewShell
      title="Baliuag University Privacy Policy"
      url="https://baliuagu.edu.ph/posts/baliuag-university-data-privacy-statement"
      documentType="privacy"
      triggerLabel={children}
      onScrollComplete={onScrollComplete}
      className={className}
    />
  );
}

export function TermsOfServicePreview({ children, onScrollComplete, className }: { children: React.ReactNode; onScrollComplete?: () => void; className?: string }) {
  return (
    <DocumentPreviewShell
      title="Personal Information Consent Form"
      url="https://baliuagu.edu.ph/terms-of-service"
      documentType="terms"
      triggerLabel={children}
      onScrollComplete={onScrollComplete}
      className={className}
    />
  );
}



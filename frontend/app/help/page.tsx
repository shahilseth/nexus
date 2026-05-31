"use client";

import { useEffect, useState } from "react";
import { CircleHelp, ChevronDown, Keyboard, Mail } from "lucide-react";
import AppShell from "@/components/AppShell";
import { helpApi } from "@/lib/api";

interface Faq {
  q: string;
  a: string;
}

interface Shortcut {
  keys: string;
  description: string;
}

interface HelpData {
  faqs: Faq[];
  shortcuts: Shortcut[];
  contact: { email: string };
}

export default function HelpPage() {
  const [data, setData] = useState<HelpData | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    helpApi.getFaqs()
      .then(r => setData(r.data))
      .catch(() => {});
  }, []);

  function toggleFaq(i: number) {
    setOpenIndex(prev => (prev === i ? null : i));
  }

  return (
    <AppShell>
      <div className="page help-page">
        <div className="page-head" style={{ marginBottom: 28 }}>
          <div className="grow">
            <div className="page-title">Help</div>
            <div className="page-sub">Answers, shortcuts, and ways to reach us.</div>
          </div>
        </div>

        {/* FAQs */}
        <div className="help-section">
          <div className="help-section-title">
            <CircleHelp size={16} /> Frequently asked questions
          </div>

          {!data ? (
            <div style={{ color: "var(--fg-muted)", fontSize: 14 }}>Loading…</div>
          ) : (
            data.faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <div
                  className={`faq-q${openIndex === i ? " open" : ""}`}
                  onClick={() => toggleFaq(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && toggleFaq(i)}
                >
                  {faq.q}
                  <ChevronDown size={16} />
                </div>
                <div className={`faq-a${openIndex === i ? " open" : ""}`}>
                  {faq.a}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Keyboard shortcuts */}
        <div className="help-section">
          <div className="help-section-title">
            <Keyboard size={16} /> Keyboard shortcuts
          </div>

          {!data ? (
            <div style={{ color: "var(--fg-muted)", fontSize: 14 }}>Loading…</div>
          ) : (
            data.shortcuts.map((s, i) => (
              <div key={i} className="shortcut-row">
                <div className="shortcut-keys">
                  {s.keys.split("+").map((k, ki) => (
                    <span key={ki} className="kbd">{k}</span>
                  ))}
                </div>
                <span className="shortcut-desc">{s.description}</span>
              </div>
            ))
          )}
        </div>

        {/* Contact */}
        <div className="help-section">
          <div className="help-section-title">
            <Mail size={16} /> Contact support
          </div>
          <p style={{ fontSize: 14, color: "var(--fg-muted)", margin: "0 0 12px" }}>
            Can&apos;t find what you need? Send us an email and we&apos;ll get back to you within one business day.
          </p>
          {data && (
            <a className="contact-email" href={`mailto:${data.contact.email}`}>
              <Mail size={15} />
              {data.contact.email}
            </a>
          )}
        </div>
      </div>
    </AppShell>
  );
}

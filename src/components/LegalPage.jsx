import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function LegalPage({ title, intro, children }) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition mb-4">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Home</span>
      </Link>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
      {intro && <p className="mt-2 text-sm text-slate-600 leading-relaxed">{intro}</p>}
      <div className="mt-8 space-y-7 text-sm leading-relaxed text-slate-700 [&>section>h2]:text-base [&>section>h2]:font-bold [&>section>h2]:text-slate-900 [&>section>h2]:mb-1.5 [&>section>p]:text-slate-600 [&>section>ul]:list-disc [&>section>ul]:pl-5 [&>section>ul]:space-y-1 [&>section>ul]:text-slate-600">
        {children}
      </div>
      <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-4 text-xs text-slate-600">
        Questions about this page? Contact us at{' '}
        <a href="mailto:support@1tap.in" className="font-semibold text-sky-700 hover:underline">support@1tap.in</a>
        {' '}or <a href="tel:+919762622762" className="font-semibold text-sky-700 hover:underline">+91 97626 22762</a>.
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { fetchAdminInquiries } from '../../services/inquiryService';
import { AdminTableSkeleton } from '../../components/skeletons';
import { Mail, RefreshCw, MessageSquare, AlertCircle, Calendar, Phone } from 'lucide-react';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInquiries = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminInquiries();
    if (res.success) {
      setInquiries(res.inquiries || []);
    } else {
      setError(res.error || 'Failed to load inquiries.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Customer Inquiries
            </h1>
            <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-500/30">
              {inquiries.length} {inquiries.length === 1 ? 'Message' : 'Messages'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Messages and inquiries submitted by visitors from the customer storefront.
          </p>
        </div>

        <button
          type="button"
          onClick={loadInquiries}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-xs">
        {loading ? (
          <AdminTableSkeleton columns={5} rows={5} label="Loading customer inquiries" />
        ) : inquiries.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white">No inquiries yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are currently no customer inquiries submitted to the database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 pl-4 pr-3">Customer</th>
                  <th className="py-3.5 px-3">Contact</th>
                  <th className="py-3.5 px-3">Message</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 pr-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 pl-4 pr-3 font-bold text-white">
                      {inq.name}
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="h-3 w-3 text-slate-500" />
                          <a href={`mailto:${inq.email}`} className="hover:underline">{inq.email}</a>
                        </div>
                        {inq.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <Phone className="h-3 w-3 text-slate-500" />
                            <span>{inq.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-200 max-w-md">
                      <p className="line-clamp-2 leading-relaxed">{inq.message}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-bold text-indigo-400 border border-indigo-500/20">
                        {inq.status || 'New'}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(inq.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

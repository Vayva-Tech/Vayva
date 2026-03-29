"use client";

import { FileText, Plus, House, Phone, Question, Info, Lock } from "@phosphor-icons/react";
import { Button } from "@vayva/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

const SAMPLE_PAGES = [
  { id: '1', title: 'Home', slug: '/', type: 'system', status: 'published', views: 1250 },
  { id: '2', title: 'About Us', slug: '/about', type: 'page', status: 'published', views: 340 },
  { id: '3', title: 'Contact', slug: '/contact', type: 'page', status: 'published', views: 890 },
  { id: '4', title: 'FAQ', slug: '/faq', type: 'page', status: 'draft', views: 0 },
  { id: '5', title: 'Privacy Policy', slug: '/privacy', type: 'legal', status: 'published', views: 156 },
];

export default function PagesPage() {
  const totalPages = SAMPLE_PAGES.length;
  const publishedPages = SAMPLE_PAGES.filter(p => p.status === 'published').length;
  const draftPages = SAMPLE_PAGES.filter(p => p.status === 'draft').length;
  const totalViews = SAMPLE_PAGES.reduce((sum, p) => sum + p.views, 0);

  return (
    <div className="space-y-6">
      <PageWithInsights
        insights={
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick actions
              </div>
              <div className="mt-3 grid gap-2">
                <Button className="bg-green-600 hover:bg-green-700 text-white h-10 rounded-xl font-semibold justify-between">
                  <span>Create page</span>
                  <Plus size={18} />
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Insight
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-900">
                Keep it simple
              </div>
              <p className="text-sm text-gray-500 mt-1">
                A short About page + clear Contact page improves trust and conversions.
              </p>
            </div>
          </>
        }
      >
        <PageHeader
          title="Pages"
          subtitle="Manage your site content pages"
          actions={
            <Button className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
              <Plus size={18} className="mr-2" />
              Create Page
            </Button>
          }
        />

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryWidget
          icon={<FileText size={18} />}
          label="Total Pages"
          value={String(totalPages)}
          trend={`${draftPages} drafts`}
          positive
        />
        <SummaryWidget
          icon={<House size={18} />}
          label="Published"
          value={String(publishedPages)}
          trend="live pages"
          positive
        />
        <SummaryWidget
          icon={<Lock size={18} />}
          label="Drafts"
          value={String(draftPages)}
          trend="unpublished"
          positive={draftPages === 0}
        />
        <SummaryWidget
          icon={<Question size={18} />}
          label="Total Views"
          value={String(totalViews)}
          trend="all time"
          positive
        />
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50" scope="col">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Page</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Slug</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Status</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Views</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {SAMPLE_PAGES.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{page.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{page.slug}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 capitalize">
                      {page.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        page.status === 'published'
                          ? "bg-green-50 text-green-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-semibold text-gray-900">{page.views.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <FileText size={16} />
                      </Button>
                      <Button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Lock size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </PageWithInsights>
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

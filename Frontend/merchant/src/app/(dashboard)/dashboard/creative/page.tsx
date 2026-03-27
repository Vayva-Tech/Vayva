/**
 * Creative Dashboard Main Page
 * Comprehensive dashboard for creative agencies and professionals
 */

'use client';

import React from 'react';
import { useCreativeDashboard } from './hooks/useCreativeDashboard';
import { CreativeSkeleton } from './components/CreativeSkeleton';
import { ErrorBoundary } from '@vayva/ui';
import { ComponentErrorState } from '@/components/error-boundary/ComponentErrorState';
import { PortfolioManagement } from './components/PortfolioManagement';
import { ClientProofing } from './components/ClientProofing';
import { AssetLibrary } from './components/AssetLibrary';
import { CreativeTools } from './components/CreativeTools';
import { DashboardStats } from './components/DashboardStats';

export default function CreativeDashboardPage() {
  const { data, isLoading, error, refetch } = useCreativeDashboard();

  if (isLoading) {
    return <CreativeSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ComponentErrorState 
          message="Failed to load creative dashboard" 
          onRetry={() => refetch()} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Creative Studio Dashboard
          </h1>
          <p className="text-gray-600">
            Manage projects, assets, and client collaborations
          </p>
        </div>

        {/* Stats Overview */}
        <ErrorBoundary
          serviceName="DashboardStats"
          fallback={<ComponentErrorState onRetry={() => refetch()} />}
        >
          <DashboardStats stats={data.stats} />
        </ErrorBoundary>

        {/* Main Content - Tabs or Sections */}
        <div className="space-y-6">
          {/* Portfolio Management */}
          <ErrorBoundary
            serviceName="PortfolioManagement"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
          >
            <PortfolioManagement 
              projects={data.portfolioProjects}
              onToggleFeatured={(projectId) => console.log('Toggle featured:', projectId)}
              onPublish={(projectId) => console.log('Publish:', projectId)}
            />
          </ErrorBoundary>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Proofing */}
            <ErrorBoundary
              serviceName="ClientProofing"
              fallback={<ComponentErrorState onRetry={() => refetch()} />}
            >
              <ClientProofing 
                proofs={data.proofs}
                onApprove={(proofId) => console.log('Approve:', proofId)}
                onRequestRevisions={(proofId, reason) => console.log('Request revisions:', proofId, reason)}
                onAddComment={(proofId, comment) => console.log('Add comment:', proofId, comment)}
              />
            </ErrorBoundary>

            {/* Creative Tools */}
            <ErrorBoundary
              serviceName="CreativeTools"
              fallback={<ComponentErrorState onRetry={() => refetch()} />}
            >
              <CreativeTools 
                palettes={data.colorPalettes}
                templates={data.templates}
                fonts={data.fontPairs}
                onGenerateColor={() => console.log('Generate color')}
                onExportPalette={(paletteId) => console.log('Export palette:', paletteId)}
                onUseTemplate={(templateId) => console.log('Use template:', templateId)}
              />
            </ErrorBoundary>
          </div>

          {/* Asset Library - Full Width */}
          <ErrorBoundary
            serviceName="AssetLibrary"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
          >
            <AssetLibrary 
              assets={data.assets}
              folders={data.folders}
              onUpload={(files) => console.log('Upload files:', files)}
              onDownload={(assetId) => console.log('Download:', assetId)}
              onDelete={(assetId) => console.log('Delete:', assetId)}
              onTag={(assetId, tag) => console.log('Add tag:', assetId, tag)}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

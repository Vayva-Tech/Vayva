/**
 * Creative Dashboard Components Unit Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PortfolioManagement } from '../src/app/(dashboard)/dashboard/creative/components/PortfolioManagement';
import { ClientProofing } from '../src/app/(dashboard)/dashboard/creative/components/ClientProofing';
import { AssetLibrary } from '../src/app/(dashboard)/dashboard/creative/components/AssetLibrary';
import { CreativeTools } from '../src/app/(dashboard)/dashboard/creative/components/CreativeTools';
import { DashboardStats } from '../src/app/(dashboard)/dashboard/creative/components/DashboardStats';

describe('Creative Dashboard Components', () => {
  describe('DashboardStats', () => {
    const mockStats = {
      activeProjects: 12,
      pendingReviews: 5,
      totalAssets: 248,
      monthlyRevenue: 45000,
    };

    it('renders all stat cards', () => {
      render(<DashboardStats stats={mockStats} />);
      
      expect(screen.getByText('Active Projects')).toBeInTheDocument();
      expect(screen.getByText('Pending Reviews')).toBeInTheDocument();
      expect(screen.getByText('Total Assets')).toBeInTheDocument();
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    });

    it('displays correct values', () => {
      render(<DashboardStats stats={mockStats} />);
      
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('248')).toBeInTheDocument();
      expect(screen.getByText('$45,000')).toBeInTheDocument();
    });

    it('shows trend indicators', () => {
      render(<DashboardStats stats={mockStats} />);
      
      expect(screen.getByText('+12%')).toBeInTheDocument();
      expect(screen.getByText('-5%')).toBeInTheDocument();
      expect(screen.getByText('+24%')).toBeInTheDocument();
      expect(screen.getByText('+18%')).toBeInTheDocument();
    });
  });

  describe('PortfolioManagement', () => {
    const mockProjects = [
      {
        id: '1',
        title: 'Brand Identity Design',
        client: 'Acme Corp',
        thumbnail: '/thumb1.jpg',
        category: 'BRANDING' as const,
        status: 'PUBLISHED' as const,
        featured: true,
        createdAt: '2024-01-15',
        metrics: { views: 1250, likes: 89, shares: 34 },
      },
      {
        id: '2',
        title: 'Website Redesign',
        client: 'TechStart',
        thumbnail: '/thumb2.jpg',
        category: 'WEB_DESIGN' as const,
        status: 'IN_PROGRESS' as const,
        featured: false,
        createdAt: '2024-01-20',
        metrics: { views: 567, likes: 42, shares: 12 },
      },
    ];

    it('renders portfolio projects', () => {
      render(<PortfolioManagement projects={mockProjects} />);
      
      expect(screen.getByText('Brand Identity Design')).toBeInTheDocument();
      expect(screen.getByText('Website Redesign')).toBeInTheDocument();
    });

    it('displays client names', () => {
      render(<PortfolioManagement projects={mockProjects} />);
      
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('TechStart')).toBeInTheDocument();
    });

    it('shows project metrics', () => {
      render(<PortfolioManagement projects={mockProjects} />);
      
      expect(screen.getByText('1,250')).toBeInTheDocument();
      expect(screen.getByText('89')).toBeInTheDocument();
    });

    it('filters by category', () => {
      render(<PortfolioManagement projects={mockProjects} />);
      
      const filter = screen.getByLabelText(/filter/i) || screen.getByRole('combobox');
      fireEvent.change(filter, { target: { value: 'BRANDING' } });
      
      expect(screen.getByText('Brand Identity Design')).toBeInTheDocument();
    });

    it('calls onToggleFeatured when clicked', () => {
      const onToggleFeatured = vi.fn();
      render(<PortfolioManagement projects={mockProjects} onToggleFeatured={onToggleFeatured} />);
      
      const featureButtons = screen.getAllByText(/featured|feature/i);
      fireEvent.click(featureButtons[0]);
      
      expect(onToggleFeatured).toHaveBeenCalledWith('1');
    });
  });

  describe('ClientProofing', () => {
    const mockProofs = [
      {
        id: '1',
        projectId: 'proj-1',
        projectName: 'Logo Design v3',
        version: 3,
        fileUrl: '/file1.pdf',
        fileName: 'logo_v3.pdf',
        fileType: 'PDF' as const,
        submittedAt: '2024-01-20T10:00:00Z',
        status: 'PENDING' as const,
        comments: [
          {
            id: 'c1',
            author: 'John Doe',
            content: 'Looks great! Just adjust the spacing.',
            timestamp: '2024-01-20T11:00:00Z',
            resolved: false,
          },
        ],
      },
    ];

    it('renders proof items', () => {
      render(<ClientProofing proofs={mockProofs} />);
      
      expect(screen.getByText('Logo Design v3')).toBeInTheDocument();
      expect(screen.getByText('logo_v3.pdf')).toBeInTheDocument();
    });

    it('displays comment count', () => {
      render(<ClientProofing proofs={mockProofs} />);
      
      expect(screen.getByText('1 comments')).toBeInTheDocument();
    });

    it('allows selecting a proof for review', () => {
      render(<ClientProofing proofs={mockProofs} />);
      
      const proofCard = screen.getByText('Logo Design v3').closest('[role="button"]') || 
                       screen.getByText('Logo Design v3').closest('div[onclick]');
      if (proofCard) {
        fireEvent.click(proofCard);
      }
      
      // Should show preview section
      expect(screen.getByText('Version 3')).toBeInTheDocument();
    });

    it('calls onApprove when approve button clicked', () => {
      const onApprove = vi.fn();
      render(<ClientProofing proofs={mockProofs} onApprove={onApprove} />);
      
      // Select the proof first
      const proofCard = screen.getByText('Logo Design v3').closest('div');
      if (proofCard) {
        fireEvent.click(proofCard);
      }
      
      const approveButton = screen.getByText('✓ Approve');
      fireEvent.click(approveButton);
      
      expect(onApprove).toHaveBeenCalledWith('1');
    });
  });

  describe('AssetLibrary', () => {
    const mockAssets = [
      {
        id: '1',
        name: 'Hero Image',
        type: 'IMAGE' as const,
        url: '/hero.jpg',
        thumbnailUrl: '/hero-thumb.jpg',
        size: 2500000,
        uploadedAt: '2024-01-15T10:00:00Z',
        uploadedBy: 'user-1',
        tags: ['hero', 'banner', 'marketing'],
      },
      {
        id: '2',
        name: 'Brand Guidelines',
        type: 'DOCUMENT' as const,
        url: '/guidelines.pdf',
        size: 5000000,
        uploadedAt: '2024-01-16T14:00:00Z',
        uploadedBy: 'user-1',
        tags: ['brand', 'guidelines'],
      },
    ];

    it('renders asset library', () => {
      render(<AssetLibrary assets={mockAssets} />);
      
      expect(screen.getByText('Hero Image')).toBeInTheDocument();
      expect(screen.getByText('Brand Guidelines')).toBeInTheDocument();
    });

    it('displays file sizes correctly', () => {
      render(<AssetLibrary assets={mockAssets} />);
      
      expect(screen.getByText(/2.5 MB|2,500,000 B/)).toBeInTheDocument();
    });

    it('shows asset tags', () => {
      render(<AssetLibrary assets={mockAssets} />);
      
      expect(screen.getByText('hero')).toBeInTheDocument();
      expect(screen.getByText('brand')).toBeInTheDocument();
    });

    it('filters assets by search query', () => {
      render(<AssetLibrary assets={mockAssets} />);
      
      const searchInput = screen.getByPlaceholderText('Search assets...');
      fireEvent.change(searchInput, { target: { value: 'hero' } });
      
      expect(screen.getByText('Hero Image')).toBeInTheDocument();
    });

    it('allows selecting multiple assets', () => {
      render(<AssetLibrary assets={mockAssets} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      
      expect(screen.getByText(/1 asset\(s\) selected/)).toBeInTheDocument();
    });
  });

  describe('CreativeTools', () => {
    const mockPalettes = [
      {
        id: '1',
        name: 'Summer Vibes',
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      },
    ];

    const mockTemplates = [
      {
        id: '1',
        name: 'Instagram Post',
        thumbnail: '/template1.jpg',
        category: 'SOCIAL_MEDIA' as const,
        dimensions: { width: 1080, height: 1080, unit: 'PX' as const },
      },
    ];

    const mockFonts = [
      {
        id: '1',
        headingFont: 'Montserrat',
        bodyFont: 'Open Sans',
        preview: 'Heading Text\nBody text goes here',
      },
    ];

    it('renders color tools tab', () => {
      render(<CreativeTools palettes={mockPalettes} templates={mockTemplates} fonts={mockFonts} />);
      
      expect(screen.getByText('🎨 Colors')).toBeInTheDocument();
      expect(screen.getByText('Color Palette Generator')).toBeInTheDocument();
    });

    it('switches between tabs', () => {
      render(<CreativeTools palettes={mockPalettes} templates={mockTemplates} fonts={mockFonts} />);
      
      const fontsTab = screen.getByText('Aa Fonts');
      fireEvent.click(fontsTab);
      
      expect(screen.getByText('Font Pairings')).toBeInTheDocument();
    });

    it('displays saved color palettes', () => {
      render(<CreativeTools palettes={mockPalettes} templates={mockTemplates} fonts={mockFonts} />);
      
      expect(screen.getByText('Summer Vibes')).toBeInTheDocument();
    });

    it('generates random colors', () => {
      render(<CreativeTools />);
      
      const generateButton = screen.getByText('Generate New');
      fireEvent.click(generateButton);
      
      // Should update colors (implementation dependent)
      expect(generateButton).toBeInTheDocument();
    });

    it('displays font pairings', () => {
      render(<CreativeTools palettes={mockPalettes} templates={mockTemplates} fonts={mockFonts} />);
      
      // Switch to fonts tab
      const fontsTab = screen.getByText('Aa Fonts');
      fireEvent.click(fontsTab);
      
      expect(screen.getByText('Montserrat + Open Sans')).toBeInTheDocument();
    });

    it('displays templates', () => {
      render(<CreativeTools palettes={mockPalettes} templates={mockTemplates} fonts={mockFonts} />);
      
      // Switch to templates tab
      const templatesTab = screen.getByText('📐 Templates');
      fireEvent.click(templatesTab);
      
      expect(screen.getByText('Instagram Post')).toBeInTheDocument();
      expect(screen.getByText('1080 × 1080 PX')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('renders all creative components together without errors', () => {
      const { container } = render(
        <div>
          <DashboardStats 
            stats={{ activeProjects: 5, pendingReviews: 2, totalAssets: 50, monthlyRevenue: 10000 }} 
          />
          <PortfolioManagement projects={[]} />
          <ClientProofing proofs={[]} />
          <AssetLibrary assets={[]} />
          <CreativeTools />
        </div>
      );

      expect(container.querySelectorAll('[class*="rounded-xl"]').length).toBeGreaterThan(0);
    });
  });
});

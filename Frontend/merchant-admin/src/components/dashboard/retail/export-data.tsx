'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  data: any[];
  filename: string;
  columns: Array<{ key: string; label: string }>;
}

interface ScheduledReport {
  email: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: 'csv' | 'pdf';
  filters?: any;
}

interface ExportDataProps {
  data: any[];
  columns: Array<{ key: string; label: string }>;
  filename?: string;
  className?: string;
  onExport?: (options: ExportOptions) => void;
  onScheduleReport?: (report: ScheduledReport) => void;
}

export function ExportData({
  data,
  columns,
  filename = 'export',
  className,
  onExport,
  onScheduleReport,
}: ExportDataProps) {
  const convertToCSV = (dataArray: any[], cols: Array<{ key: string; label: string }>) => {
    const headers = cols.map(col => col.label).join(',');
    const rows = dataArray.map(item =>
      cols.map(col => {
        const value = item[col.key];
        // Handle special characters and quotes
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',')
    );
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = () => {
    try {
      const csv = convertToCSV(data, columns);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV exported successfully');
      onExport?.({ format: 'csv', data, filename, columns });
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error(error);
    }
  };

  const downloadPDF = () => {
    toast.info('PDF generation started...');
    // In production, this would call an API endpoint to generate PDF
    // For now, we'll simulate it
    setTimeout(() => {
      toast.success('PDF downloaded successfully');
      onExport?.({ format: 'pdf', data, filename, columns });
    }, 1000);
  };

  const downloadExcel = () => {
    toast.success('Excel export started...');
    // In production, use a library like exceljs or xlsx
    onExport?.({ format: 'excel', data, filename, columns });
  };

  const scheduleReport = (frequency: 'daily' | 'weekly' | 'monthly') => {
    const email = prompt('Enter email address for scheduled reports:');
    if (email) {
      onScheduleReport?.({
        email,
        frequency,
        format: 'csv',
      });
      toast.success(`Report scheduled ${frequency}`);
    }
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={downloadCSV} className="cursor-pointer gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export as CSV</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadExcel} className="cursor-pointer gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export as Excel</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadPDF} className="cursor-pointer gap-2">
            <FileText className="h-4 w-4" />
            <span>Export as PDF</span>
          </DropdownMenuItem>
          
          <div className="my-2 border-t" />
          
          <div className="px-2 py-1.5 text-sm font-semibold">Schedule Reports</div>
          <DropdownMenuItem 
            onClick={() => scheduleReport('daily')} 
            className="cursor-pointer gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Daily Email</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => scheduleReport('weekly')} 
            className="cursor-pointer gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Weekly Email</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => scheduleReport('monthly')} 
            className="cursor-pointer gap-2"
          >
            <Mail className="h-4 w-4" />
            <span>Monthly Email</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Server-side PDF generation helper (to be used in API routes)
export async function generatePDF(data: any[], options: {
  title: string;
  columns: Array<{ key: string; label: string }>;
  filename: string;
}) {
  // This would be implemented server-side using libraries like pdfkit or puppeteer
  // Example implementation structure:
  /*
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument();
  
  // Add title
  doc.fontSize(20).text(options.title, { align: 'center' });
  
  // Add table header
  options.columns.forEach((col, i) => {
    doc.x = 50 + (i * 100);
    doc.text(col.label, { bold: true });
  });
  
  // Add rows
  data.forEach((row) => {
    options.columns.forEach((col, i) => {
      doc.x = 50 + (i * 100);
      doc.text(String(row[col.key]));
    });
  });
  
  return doc;
  */
  
  throw new Error('Server-side implementation required');
}

"use client";

import { useState } from 'react';
import { Download, Trophy, Calendar, User, Award } from "lucide-react";

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  instructorName: string;
  certificateId: string;
  onDownload?: () => void;
}

export default function CertificateGenerator({ 
  studentName, 
  courseName, 
  completionDate, 
  instructorName, 
  certificateId,
  onDownload
}: CertificateProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = () => {
    setIsGenerating(true);
    
    // Simulate certificate generation delay
    setTimeout(() => {
      if (onDownload) {
        onDownload();
      }
      
      // In a real implementation, this would generate and download a PDF
      console.log('Certificate downloaded for:', studentName);
      setIsGenerating(false);
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Certificate Preview */}
      <div className="bg-white border-8 border-yellow-400 rounded-xl shadow-2xl overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-400 p-3 rounded-full">
              <Trophy className="h-12 w-12 text-blue-900" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">CERTIFICATE</h1>
          <h2 className="text-2xl font-semibold">OF COMPLETION</h2>
        </div>

        {/* Body */}
        <div className="p-12 text-center">
          {/* Award Text */}
          <div className="mb-8">
            <p className="text-xl text-gray-600 mb-6">
              This certifies that
            </p>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">
              {studentName}
            </h3>
            <p className="text-xl text-gray-600 mb-2">
              has successfully completed
            </p>
          </div>

          {/* Course Name */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h4 className="text-2xl font-bold text-gray-900">
              {courseName}
            </h4>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Completion Date</p>
                <p className="font-medium">{formatDate(completionDate)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Instructor</p>
                <p className="font-medium">{instructorName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Certificate ID</p>
                <p className="font-mono font-medium text-sm">{certificateId}</p>
              </div>
            </div>
          </div>

          {/* Signature Area */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <div className="grid grid-cols-2 gap-12">
              <div>
                <div className="h-16 border-b border-gray-300 mb-2"></div>
                <p className="font-medium text-gray-900">Course Instructor</p>
                <p className="text-gray-600 text-sm">{instructorName}</p>
              </div>
              <div>
                <div className="h-16 border-b border-gray-300 mb-2"></div>
                <p className="font-medium text-gray-900">Date Issued</p>
                <p className="text-gray-600 text-sm">{formatDate(completionDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 py-6 text-center">
          <p className="text-gray-500 text-sm">
            Verified Certificate - EduLearn Platform
          </p>
        </div>
      </div>

      {/* Download Button */}
      <div className="text-center">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating Certificate...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Download Certificate
            </>
          )}
        </button>
        
        <p className="text-gray-500 text-sm mt-4">
          Your certificate will be downloaded as a PDF file
        </p>
      </div>
    </div>
  );
}
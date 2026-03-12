"use client";

import { useState, useRef, useEffect } from 'react';
import Header from "@/components/Header";
import { QrCode, Camera, Scan, CheckCircle, XCircle, Clock, User, Ticket } from "lucide-react";

interface ScannedTicket {
  ticketNumber: string;
  eventName: string;
  attendeeName: string;
  ticketType: string;
  eventId: string;
  isValid: boolean;
  message: string;
  timestamp: string;
}

export default function EventCheckInPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedTickets, setScannedTickets] = useState<ScannedTicket[]>([]);
  const [currentScan, setCurrentScan] = useState<ScannedTicket | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Mock ticket database for demonstration
  const mockTickets: Record<string, any> = {
    'TICKET-ABC123': {
      eventId: 'event-1',
      eventName: 'Tech Conference 2024',
      attendeeName: 'John Doe',
      ticketType: 'VIP',
      status: 'valid',
      checkedIn: false
    },
    'TICKET-DEF456': {
      eventId: 'event-1',
      eventName: 'Tech Conference 2024',
      attendeeName: 'Jane Smith',
      ticketType: 'General',
      status: 'valid',
      checkedIn: true
    },
    'TICKET-GHI789': {
      eventId: 'event-1',
      eventName: 'Tech Conference 2024',
      attendeeName: 'Bob Johnson',
      ticketType: 'VIP',
      status: 'invalid',
      checkedIn: false
    }
  };

  useEffect(() => {
    if (isScanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isScanning]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      setCameraError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // In a real implementation, you would use a QR code library here
    // For demo purposes, we'll simulate scanning
    simulateQRScan();
  };

  const simulateQRScan = () => {
    // Simulate QR code detection with random ticket numbers
    const ticketKeys = Object.keys(mockTickets);
    const randomTicket = ticketKeys[Math.floor(Math.random() * ticketKeys.length)];
    
    setTimeout(() => {
      processScannedCode(randomTicket);
    }, 1000);
  };

  const processScannedCode = (ticketCode: string) => {
    const ticketData = mockTickets[ticketCode];
    
    if (!ticketData) {
      setCurrentScan({
        ticketNumber: ticketCode,
        eventName: 'Unknown Event',
        attendeeName: 'Unknown',
        ticketType: 'Unknown',
        eventId: '',
        isValid: false,
        message: 'Ticket not found in system',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const scannedTicket: ScannedTicket = {
      ticketNumber: ticketCode,
      eventName: ticketData.eventName,
      attendeeName: ticketData.attendeeName,
      ticketType: ticketData.ticketType,
      eventId: ticketData.eventId,
      isValid: ticketData.status === 'valid' && !ticketData.checkedIn,
      message: ticketData.status === 'valid' 
        ? ticketData.checkedIn 
          ? 'Already checked in' 
          : 'Valid ticket - ready for entry'
        : 'Invalid ticket',
      timestamp: new Date().toISOString()
    };

    setCurrentScan(scannedTicket);
    
    // Add to scan history
    setScannedTickets(prev => [scannedTicket, ...prev.slice(0, 9)]); // Keep last 10 scans
    
    // Auto-clear current scan after 3 seconds
    setTimeout(() => {
      setCurrentScan(null);
    }, 3000);
  };

  const handleManualEntry = () => {
    if (manualCode.trim()) {
      processScannedCode(manualCode.trim().toUpperCase());
      setManualCode('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[
        { label: "Event Management", href: "/manage-events" },
        { label: "Check-in Scanner" }
      ]} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Check-in Scanner</h1>
            <p className="text-gray-600">Scan QR codes or enter ticket numbers manually</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Scanner Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Code Scanner</h2>
                
                <div className="bg-gray-900 rounded-xl overflow-hidden relative mb-4">
                  {isScanning ? (
                    <>
                      <video
                        ref={videoRef}
                        className="w-full h-64 object-cover"
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="border-2 border-dashed border-white rounded-lg w-48 h-48 flex items-center justify-center">
                          <QrCode className="h-16 w-16 text-white opacity-50" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black bg-opacity-50 rounded-lg p-3">
                          <p className="text-white text-center text-sm">
                            Point camera at QR code
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-64 bg-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Camera not active</p>
                      </div>
                    </div>
                  )}
                  
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {cameraError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">Camera Error</span>
                    </div>
                    <p className="text-red-600 mt-1">{cameraError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {!isScanning ? (
                    <button
                      onClick={() => setIsScanning(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    >
                      <Camera className="h-5 w-5" />
                      Start Scanner
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={scanQRCode}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                      >
                        <Scan className="h-5 w-5" />
                        Scan Now
                      </button>
                      <button
                        onClick={() => setIsScanning(false)}
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Stop
                      </button>
                    </>
                  )}
                </div>

                {/* Manual Entry */}
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">Manual Entry</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      placeholder="Enter ticket number"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleManualEntry();
                        }
                      }}
                    />
                    <button
                      onClick={handleManualEntry}
                      className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    >
                      <Ticket className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Scan Result */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Scan Result</h2>
                
                {currentScan ? (
                  <div className={`rounded-xl p-6 mb-6 ${
                    currentScan.isValid 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-lg ${
                        currentScan.isValid ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {currentScan.isValid ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(currentScan.timestamp)}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Event</p>
                        <p className="font-medium text-gray-900">{currentScan.eventName}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Attendee</p>
                        <p className="font-medium text-gray-900">{currentScan.attendeeName}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Ticket Type</p>
                        <p className="font-medium text-gray-900">{currentScan.ticketType}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Ticket Number</p>
                        <p className="font-mono text-gray-900">{currentScan.ticketNumber}</p>
                      </div>
                      
                      <div className={`p-3 rounded-lg ${
                        currentScan.isValid ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <p className={`text-sm font-medium ${
                          currentScan.isValid ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {currentScan.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center mb-6">
                    <Scan className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Scan a QR code to see ticket details</p>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {scannedTickets.length}
                    </p>
                    <p className="text-sm text-gray-600">Total Scans</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {scannedTickets.filter(t => t.isValid).length}
                    </p>
                    <p className="text-sm text-gray-600">Valid Entries</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {scannedTickets.filter(t => !t.isValid).length}
                    </p>
                    <p className="text-sm text-gray-600">Invalid</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scan History */}
            {scannedTickets.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Scans</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scannedTickets.map((ticket, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-xl border ${
                        ticket.isValid 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {ticket.isValid ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium text-gray-900">
                              {ticket.attendeeName}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {ticket.ticketNumber} • {ticket.ticketType}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {formatDate(ticket.timestamp)}
                          </p>
                          <p className="text-xs font-medium mt-1">
                            {ticket.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
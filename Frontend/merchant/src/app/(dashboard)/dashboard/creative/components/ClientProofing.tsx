/**
 * Client Proofing Workflow - Review and Approval System
 */

import React, { useState } from 'react';

export interface ProofItem {
  id: string;
  projectId: string;
  projectName: string;
  version: number;
  fileUrl: string;
  fileName: string;
  fileType: 'IMAGE' | 'PDF' | 'VIDEO' | 'DOCUMENT';
  submittedAt: string;
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REVISIONS_NEEDED';
  comments: ProofComment[];
}

export interface ProofComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  resolved: boolean;
  annotations?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

interface ClientProofingProps {
  proofs: ProofItem[];
  onApprove?: (proofId: string) => void;
  onRequestRevisions?: (proofId: string, reason: string) => void;
  onAddComment?: (proofId: string, comment: string) => void;
}

export function ClientProofing({ 
  proofs, 
  onApprove, 
  onRequestRevisions,
  onAddComment 
}: ClientProofingProps) {
  const [selectedProof, setSelectedProof] = useState<ProofItem | null>(null);
  const [commentText, setCommentText] = useState('');
  const [revisionReason, setRevisionReason] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  const pendingProofs = proofs.filter(p => p.status === 'PENDING' || p.status === 'IN_REVIEW');
  const completedProofs = proofs.filter(p => p.status === 'APPROVED' || p.status === 'REVISIONS_NEEDED');

  const handleApprove = () => {
    if (selectedProof) {
      onApprove?.(selectedProof.id);
      setSelectedProof(null);
    }
  };

  const handleRequestRevisions = () => {
    if (selectedProof && revisionReason.trim()) {
      onRequestRevisions?.(selectedProof.id, revisionReason);
      setShowRevisionModal(false);
      setRevisionReason('');
      setSelectedProof(null);
    }
  };

  const handleAddComment = () => {
    if (selectedProof && commentText.trim()) {
      onAddComment?.(selectedProof.id, commentText);
      setCommentText('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Client Proofing & Reviews</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proof List */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            Pending Reviews
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {pendingProofs.length}
            </span>
          </h4>

          {pendingProofs.map((proof) => (
            <div
              key={proof.id}
              onClick={() => setSelectedProof(proof)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedProof?.id === proof.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-medium text-gray-900">{proof.projectName}</h5>
                  <p className="text-sm text-gray-600">{proof.fileName}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  proof.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  proof.status === 'REVISIONS_NEEDED' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  v{proof.version}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <span>{proof.fileType}</span>
                <span>•</span>
                <span>{new Date(proof.submittedAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{proof.comments.length} comments</span>
              </div>
            </div>
          ))}

          {pendingProofs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No pending reviews
            </div>
          )}
        </div>

        {/* Preview & Actions */}
        <div className="border rounded-lg p-4 bg-gray-50">
          {selectedProof ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{selectedProof.projectName}</h4>
                <p className="text-sm text-gray-600">Version {selectedProof.version}</p>
              </div>

              {/* File Preview */}
              <div className="aspect-video bg-white rounded-lg flex items-center justify-center border">
                {selectedProof.fileType === 'IMAGE' ? (
                  <img
                    src={selectedProof.fileUrl}
                    alt={selectedProof.fileName}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <p className="text-4xl mb-2">📄</p>
                    <p className="text-sm">{selectedProof.fileName}</p>
                    <button className="mt-3 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                      Open in New Tab
                    </button>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-700">Comments ({selectedProof.comments.length})</h5>
                
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {selectedProof.comments.map((comment) => (
                    <div key={comment.id} className={`p-3 rounded-lg ${comment.resolved ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleApprove}
                  className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => setShowRevisionModal(true)}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                >
                  ↻ Request Revisions
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>Select a proof to review</p>
            </div>
          )}
        </div>
      </div>

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-bold mb-4">Request Revisions</h4>
            <textarea
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="Describe required revisions..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 h-32 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRevisions}
                disabled={!revisionReason.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

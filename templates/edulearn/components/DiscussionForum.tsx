"use client";

import { useState } from 'react';
import { MessageCircle, ThumbsUp, Reply, MoreHorizontal, Send, User } from "lucide-react";

interface DiscussionComment {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies: DiscussionComment[];
}

interface DiscussionForumProps {
  courseId: string;
  lessonId?: string;
  topic?: string;
}

export default function DiscussionForum({ courseId, lessonId, topic }: DiscussionForumProps) {
  const [comments, setComments] = useState<DiscussionComment[]>([
    {
      id: "1",
      author: {
        name: "Alex Rivera",
        avatar: "AR",
        role: "Student"
      },
      content: "I'm having trouble with the extrude tool in Blender. Does anyone have tips for getting clean geometry?",
      timestamp: "2 hours ago",
      likes: 12,
      isLiked: false,
      replies: [
        {
          id: "1-1",
          author: {
            name: "Sarah Chen",
            avatar: "SC",
            role: "Instructor"
          },
          content: "Try using the 'Offset Even' option when extruding. This helps maintain consistent wall thickness!",
          timestamp: "1 hour ago",
          likes: 8,
          isLiked: true,
          replies: []
        }
      ]
    },
    {
      id: "2",
      author: {
        name: "Marcus Johnson",
        avatar: "MJ",
        role: "Student"
      },
      content: "Has anyone completed the assignment on procedural materials? I'd love to see some examples!",
      timestamp: "5 hours ago",
      likes: 7,
      isLiked: false,
      replies: []
    }
  ]);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleLike = (commentId: string, isReply: boolean = false, parentCommentId?: string) => {
    setComments(prev => prev.map(comment => {
      if (isReply && parentCommentId) {
        // Handle reply liking
        const parentComment = prev.find(c => c.id === parentCommentId);
        if (parentComment) {
          const updatedReplies = parentComment.replies.map(reply => 
            reply.id === commentId 
              ? { ...reply, likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1, isLiked: !reply.isLiked }
              : reply
          );
          return {
            ...parentComment,
            replies: updatedReplies
          };
        }
      }
      
      // Handle main comment liking
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked
        };
      }
      return comment;
    }));
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const newCommentObj: DiscussionComment = {
      id: `comment-${Date.now()}`,
      author: {
        name: "Current Student",
        avatar: "CS",
        role: "Student"
      },
      content: newComment,
      timestamp: "Just now",
      likes: 0,
      isLiked: false,
      replies: []
    };

    setComments(prev => [...prev, newCommentObj]);
    setNewComment("");
  };

  const handleSubmitReply = (parentCommentId: string) => {
    if (!replyContent.trim()) return;

    const newReply: DiscussionComment = {
      id: `reply-${Date.now()}`,
      author: {
        name: "Current Student",
        avatar: "CS",
        role: "Student"
      },
      content: replyContent,
      timestamp: "Just now",
      likes: 0,
      isLiked: false,
      replies: []
    };

    setComments(prev => prev.map(comment => 
      comment.id === parentCommentId
        ? { ...comment, replies: [...comment.replies, newReply] }
        : comment
    ));

    setReplyContent("");
    setReplyingTo(null);
  };

  const CommentComponent = ({ comment, isReply = false, parentCommentId }: { 
    comment: DiscussionComment; 
    isReply?: boolean; 
    parentCommentId?: string;
  }) => (
    <div className={`flex gap-4 ${isReply ? 'ml-12 mt-4' : 'mb-6'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          {comment.author.avatar}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-4">
          {/* Author and Timestamp */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{comment.author.name}</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {comment.author.role}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>{comment.timestamp}</span>
              <button className="p-1 hover:bg-gray-200 rounded">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <p className="text-gray-700 mb-3">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleLike(comment.id, isReply, parentCommentId)}
              className={`flex items-center gap-1 text-sm ${
                comment.isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ThumbsUp className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
              <span>{comment.likes}</span>
            </button>
            
            {!isReply && (
              <button 
                onClick={() => setReplyingTo(comment.id)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <Reply className="h-4 w-4" />
                <span>Reply</span>
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies.map(reply => (
          <CommentComponent 
            key={reply.id} 
            comment={reply} 
            isReply={true} 
            parentCommentId={comment.id}
          />
        ))}

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <div className="mt-4 ml-12">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmitReply(comment.id);
                    }
                  }}
                />
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">
            {topic || "Class Discussion"}
          </h2>
        </div>
        <p className="text-gray-600">
          Discuss course materials, ask questions, and share insights with fellow learners.
        </p>
      </div>

      {/* New Comment Form */}
      <div className="border-b p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Start a discussion..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
                Post Discussion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="p-6">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
            <p className="text-gray-500">Be the first to start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map(comment => (
              <CommentComponent key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
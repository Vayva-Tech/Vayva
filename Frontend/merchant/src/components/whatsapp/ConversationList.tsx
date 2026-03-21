"use client";

import Link from "next/link";
import { User, CaretRight as ChevronRight } from "@phosphor-icons/react/ssr";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  contactName: string;
  subtitle: string;
  status: string;
  unread: boolean;
  lastMessage: string;
  lastMessageAt: string;
  direction: string;
}

interface ConversationListProps {
  conversations: Conversation[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-16 text-center flex flex-col items-center justify-center h-full">
        <div className="h-12 w-12 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center mb-4">
          <User className="h-6 w-6" />{" "}
          {/* Fallback icon, original was Inbox but generic is fine */}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Inbox Empty</h3>
        <p className="text-gray-500 max-w-sm">
          No customer messages or support requests yet.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          className={`relative p-4 hover:bg-gray-50 transition-colors cursor-pointer group flex items-start justify-between gap-4 ${conv.unread ? "bg-green-50/50" : ""}`}
        >
          <Link
            href={`/dashboard/support/messages/${conv.id}`}
            className="absolute inset-0"
          />
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`font-semibold text-sm ${conv.unread ? "text-gray-900" : "text-gray-700"}`}
                >
                  {conv.contactName}
                </span>
                {conv.unread && (
                  <span className="h-2 w-2 rounded-full bg-green-600"></span>
                )}
                <span className="text-xs text-gray-400 font-normal">
                  {formatDistanceToNow(new Date(conv.lastMessageAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p
                className={`text-sm line-clamp-1 ${conv.unread ? "text-gray-800 font-medium" : "text-gray-500"}`}
              >
                {conv.direction === "OUTBOUND" && (
                  <span className="text-gray-400 mr-1">You:</span>
                )}
                {conv.lastMessage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`px-2 py-1 rounded text-xs font-medium border ${
                conv.status === "OPEN"
                  ? "bg-green-50 text-green-700 border-green-100"
                  : conv.status === "RESOLVED"
                    ? "bg-gray-100 text-gray-600 border-gray-200"
                    : "bg-gray-50 text-gray-500 border-gray-200"
              }`}
            >
              {conv.status}
            </span>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
        </div>
      ))}
    </div>
  );
}

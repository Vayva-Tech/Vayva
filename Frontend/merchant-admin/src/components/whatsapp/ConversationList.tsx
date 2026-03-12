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
        <div className="h-12 w-12 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center mb-4">
          <User className="h-6 w-6" />{" "}
          {/* Fallback icon, original was Inbox but generic is fine */}
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">Inbox Empty</h3>
        <p className="text-slate-500 max-w-sm">
          No customer messages or support requests yet.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          className={`relative p-4 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start justify-between gap-4 ${conv.unread ? "bg-indigo-50/50" : ""}`}
        >
          <Link
            href={`/dashboard/support/messages/${conv.id}`}
            className="absolute inset-0"
          />
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`font-semibold text-sm ${conv.unread ? "text-slate-900" : "text-slate-700"}`}
                >
                  {conv.contactName}
                </span>
                {conv.unread && (
                  <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                )}
                <span className="text-xs text-slate-400 font-normal">
                  {formatDistanceToNow(new Date(conv.lastMessageAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p
                className={`text-sm line-clamp-1 ${conv.unread ? "text-slate-800 font-medium" : "text-slate-500"}`}
              >
                {conv.direction === "OUTBOUND" && (
                  <span className="text-slate-400 mr-1">You:</span>
                )}
                {conv.lastMessage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`px-2 py-1 rounded text-xs font-medium border ${
                conv.status === "OPEN"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                  : conv.status === "RESOLVED"
                    ? "bg-slate-100 text-slate-600 border-slate-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
              }`}
            >
              {conv.status}
            </span>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </div>
        </div>
      ))}
    </div>
  );
}

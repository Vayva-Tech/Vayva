import React from "react";
import Link from "next/link";
import { WhatsAppConversation, formatDate } from "@vayva/shared";
import { Button, cn } from "@vayva/ui";

interface ConversationListProps {
  conversations: WhatsAppConversation[];
  selectedId: string | null;
  onSelect?: (id: string) => void;
  getHref?: (id: string) => string;
  isLoading: boolean;
}

export const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
  getHref,
  isLoading,
}: ConversationListProps): React.ReactElement => {
  // Sort: Unread > Open > Recent
  const sorted = [...conversations].sort((a, b) => {
    if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
    return (
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  });

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-400">
        Loading conversations...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">No messages yet.</div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      {sorted.map((conv) => {
        const commonClassName = cn(
          "flex flex-col gap-1 p-4 border-b border-gray-100 hover:bg-white/40 transition-colors text-left group relative",
          selectedId === conv.id && "bg-[#F3F4F6]",
        );

        const content = (
          <>
            <div className="flex justify-between items-start w-full">
              <span
                className={cn(
                  "font-medium text-sm text-gray-900 truncate",
                  conv.unreadCount > 0 && "font-bold",
                )}
              >
                {conv.customerName || conv.customerPhone}
              </span>
              <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                {formatDate(conv.lastMessageAt)}
              </span>
            </div>

            <p
              className={cn(
                "text-xs truncate w-full pr-6",
                conv.unreadCount > 0
                  ? "text-gray-900 font-medium"
                  : "text-gray-400",
              )}
            >
              {conv.lastMessagePreview}
            </p>

            {/* Badges Row */}
            <div className="flex items-center gap-2 mt-2">
              {conv.tags?.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide",
                    tag === "order" && "bg-blue-50 text-blue-600",
                    tag === "booking" && "bg-purple-50 text-purple-600",
                    tag === "inquiry" && "bg-white/40 text-gray-400",
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Unread Badge */}
            {conv.unreadCount > 0 && (
              <div className="absolute right-4 top-10 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {conv.unreadCount}
              </div>
            )}
          </>
        );

        return getHref ? (
          <Link
            key={conv.id}
            href={getHref(conv.id)}
            className={commonClassName}
          >
            {content}
          </Link>
        ) : (
          <Button
            key={conv.id}
            variant="ghost"
            onClick={() => onSelect?.(conv.id)}
            className={commonClassName}
          >
            <div className="flex flex-col gap-1 text-left w-full">
              {content}
            </div>
          </Button>
        );
      })}
    </div>
  );
};

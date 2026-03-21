import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AgentPreview({ config }: { config: any }) {
  if (!config) return null;

  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-lg overflow-hidden border">
      {/* Header */}
      <div className="bg-[#075e54] text-white p-3 flex items-center gap-3">
        <Avatar className="w-10 h-10 border border-white/20">
          <AvatarImage src={config.avatarUrl} />
          <AvatarFallback>{config.name?.[0] || "A"}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-sm">{config.name}</h3>
          <p className="text-xs opacity-80">Online</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="p-4 h-64 bg-[#e5ddd5] flex flex-col gap-4 overflow-y-auto">
        {/* User Message */}
        <div className="self-end bg-[#dcf8c6] p-2 px-3 rounded-lg rounded-tr-none shadow-sm max-w-[80%] text-sm">
          Hi, do you allow returns?
          <span className="block text-[10px] text-right text-gray-400 mt-1">
            10:05 AM
          </span>
        </div>

        {/* Agent Response */}
        <div className="self-start bg-white p-2 px-3 rounded-lg rounded-tl-none shadow-sm max-w-[80%] text-sm">
          <p>
            Yes, we offer a 30-day return policy for all unused items!{" "}
            {config.signature ? `\n\n${config.signature}` : ""}
          </p>
          <span className="block text-[10px] text-right text-gray-400 mt-1">
            10:05 AM
          </span>
        </div>
      </div>

      {/* Tone Indicator */}
      <div className="p-2 bg-white/40 border-t text-xs text-center text-gray-400">
        Previewing Tone:{" "}
        <span className="font-medium capitalize">{config.tone}</span>
      </div>
    </div>
  );
}

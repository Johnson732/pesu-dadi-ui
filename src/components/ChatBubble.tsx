import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  text: string;
  isOwn: boolean;
}

export default function ChatBubble({ text, isOwn }: ChatBubbleProps) {
  return (
    <div className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
      <div 
        className={cn(
          "max-w-[75%] md:max-w-[60%] rounded-2xl px-5 py-3.5 text-base shadow-sm",
          isOwn 
            ? "bg-indigo-600 text-white rounded-br-sm" 
            : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
        )}
      >
        {text}
      </div>
    </div>
  );
}

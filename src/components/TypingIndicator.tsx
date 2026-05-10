import { motion } from "framer-motion";

type TypingIndicatorProps = {
  caption?: string;
};

export default function TypingIndicator({ caption }: TypingIndicatorProps) {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-3 w-fit max-w-[min(100%,20rem)]">
        {caption ? (
          <span className="text-sm text-gray-500 shrink-0">{caption}</span>
        ) : null}
        <motion.div 
          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
        />
        <motion.div 
          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.div 
          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
      </div>
    </div>
  );
}

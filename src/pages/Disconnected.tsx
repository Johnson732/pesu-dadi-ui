import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { clearActiveSession } from "@/lib/chat-session";

export default function Disconnected() {
  const [, setLocation] = useLocation();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 p-4"
    >
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 text-center space-y-8 shadow-xl shadow-gray-200/50">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <div className="w-8 h-8 bg-gray-400 rounded-full opacity-50" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Partner disconnected</h2>
          <p className="text-gray-500">Your chat session has ended.</p>
        </div>

        <div className="flex flex-col space-y-3">
          <Button 
            onClick={() => {
              clearActiveSession();
              setLocation("/searching");
            }}
            className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/25"
          >
            Find New Chat
          </Button>
          <Button 
            variant="ghost"
            onClick={() => {
              clearActiveSession();
              setLocation("/");
            }}
            className="w-full h-14 rounded-2xl text-gray-600 hover:text-gray-900"
          >
            Go Home
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

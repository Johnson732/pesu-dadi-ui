import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mars, Venus } from "lucide-react";

interface NavbarProps {
  isConnected?: boolean;
  partnerGender?: "male" | "female";
  onDisconnect: () => void;
}

export default function Navbar({ isConnected = false, partnerGender, onDisconnect }: NavbarProps) {
  const PartnerIcon = partnerGender === "female" ? Venus : partnerGender === "male" ? Mars : null;
  const iconColor = partnerGender === "female" ? "text-pink-500" : "text-blue-500";

  return (
    <div className="h-16 px-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between flex-shrink-0 z-50">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight whitespace-nowrap">
          <span className="text-gray-900">Hi </span>
          <motion.span
            animate={{ opacity: [1, 1, 0.2, 0.2, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="text-blue-500"
          >
            Da
          </motion.span>
          <motion.span
            animate={{ opacity: [0.2, 0.2, 1, 1, 0.2] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="text-rose-400"
          >
            Di
          </motion.span>
        </h1>
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${isConnected ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"}`} />
          {isConnected && PartnerIcon && <PartnerIcon className={`h-4 w-4 ${iconColor}`} aria-hidden="true" />}
          <span className={`text-sm font-semibold ${isConnected ? "text-green-700" : "text-amber-700"}`}>
            {isConnected ? "Matched" : "Searching"}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="destructive"
          onClick={onDisconnect}
          className="rounded-xl shadow-lg shadow-red-500/20 h-10 px-4 font-medium"
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clearActiveSession, getUserPreferences, saveUserPreferences, type AgeRange } from "@/lib/chat-session";

export default function Home() {
  const [, setLocation] = useLocation();
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [onlineCount, setOnlineCount] = useState(8412);

  useEffect(() => {
    const savedPreferences = getUserPreferences();
    if (savedPreferences) {
      setGender(savedPreferences.gender);
      setAge(savedPreferences.ageRange);
    }

    const interval = setInterval(() => {
      setOnlineCount((prev) => prev + Math.floor(Math.random() * 7) - 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gender && age) {
      saveUserPreferences({
        gender: gender as "male" | "female",
        ageRange: age as AgeRange,
      });
      clearActiveSession();
      setLocation("/searching");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 p-4"
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">

          {/* Logo + Title stacked tightly */}
          <div className="flex flex-col items-center" style={{ gap: 0 }}>
            {/* Glow rings float above the title */}
            <div className="relative flex items-center justify-center" style={{ marginBottom: "-8px" }}>
              {/* Outer pulsing ring */}
              <motion.div
                animate={{ scale: [1, 1.18, 1], opacity: [0.2, 0.45, 0.2] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400/25 to-violet-400/25"
              />
              {/* Mid pulsing ring */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.55, 0.3] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400/25 to-violet-400/25"
              />
              {/* Main circle */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-400/30"
              >
                <MessageCircle className="w-9 h-9 text-white" strokeWidth={1.8} />
              </motion.div>
            </div>

            <div className="space-y-1 pt-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                Hi{" "}
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
              <p className="text-base text-gray-500 tracking-wide font-medium">
                Connect with strangers. Share a moment. Start something unexpected.
              </p>
            </div>
          </div>

          {/* Live online counter */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-sm font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            <motion.span
              key={onlineCount}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {onlineCount.toLocaleString()}+ online now
            </motion.span>
          </motion.div>
        </div>

        <motion.div
          className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-2xl shadow-indigo-500/5"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">I am a</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-gray-200 focus:ring-indigo-500">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="male" className="rounded-lg">♂ Male</SelectItem>
                    <SelectItem value="female" className="rounded-lg">♀ Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Age</label>
                <Select value={age} onValueChange={setAge}>
                  <SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-gray-200 focus:ring-indigo-500">
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="18-24" className="rounded-lg">18-24</SelectItem>
                    <SelectItem value="25-34" className="rounded-lg">25-34</SelectItem>
                    <SelectItem value="35-44" className="rounded-lg">35-44</SelectItem>
                    <SelectItem value="45+" className="rounded-lg">45+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/25 transition-all duration-300"
              disabled={!gender || !age}
            >
              Start Chat
            </Button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}

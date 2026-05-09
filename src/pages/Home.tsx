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

  useEffect(() => {
    const savedPreferences = getUserPreferences();
    if (savedPreferences) {
      setGender(savedPreferences.gender);
      setAge(savedPreferences.ageRange);
    }
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
      className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_45%,_#fdf2f8_100%)] p-4"
    >
      <motion.div
        className="max-w-md w-full rounded-[2rem] border border-white/70 bg-white/78 backdrop-blur-2xl shadow-[0_30px_80px_rgba(79,70,229,0.18)] overflow-hidden"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative px-8 pt-10 pb-8 text-center overflow-hidden">
          <div className="absolute -top-10 -left-8 h-32 w-32 rounded-full bg-indigo-300/20 blur-3xl" />
          <div className="absolute -right-10 top-8 h-36 w-36 rounded-full bg-rose-300/20 blur-3xl" />

          <div className="relative flex flex-col items-center" style={{ gap: 0 }}>
            <div className="relative flex items-center justify-center" style={{ marginBottom: "-8px" }}>
              <motion.div
                animate={{ scale: [1, 1.18, 1], opacity: [0.2, 0.45, 0.2] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-32 w-32 rounded-full bg-gradient-to-br from-indigo-400/25 to-violet-400/25"
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.55, 0.3] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                className="absolute h-24 w-24 rounded-full bg-gradient-to-br from-indigo-400/25 to-violet-400/25"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-400/30"
              >
                <MessageCircle className="w-9 h-9 text-white" strokeWidth={1.8} />
              </motion.div>
            </div>

            <div className="space-y-2 pt-8">
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

        </div>

        <div className="border-t border-gray-100/80 bg-white/72 px-8 py-8">
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
                    <SelectItem value="18-25" className="rounded-lg">18-25</SelectItem>
                    <SelectItem value="25-35" className="rounded-lg">25-35</SelectItem>
                    <SelectItem value=">35" className="rounded-lg">&gt;35</SelectItem>
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
        </div>
      </motion.div>
    </motion.div>
  );
}

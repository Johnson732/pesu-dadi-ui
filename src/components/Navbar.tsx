import { Button } from "@/components/ui/button";

interface NavbarProps {
  partnerGender?: "male" | "female";
  partnerRegion?: string;
  onDisconnect: () => void;
  onNext: () => void;
}

export default function Navbar({ partnerGender, partnerRegion = "India", onDisconnect, onNext }: NavbarProps) {
  const isFemale = partnerGender === "female";
  const symbol = isFemale ? "♀" : "♂";
  const symbolColor = isFemale ? "text-pink-500" : "text-blue-500";
  const badgeBg = isFemale ? "bg-pink-50 border-pink-100" : "bg-blue-50 border-blue-100";

  return (
    <div className="h-16 px-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between flex-shrink-0 z-50">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold tracking-tight hidden sm:block">
          <span className="text-gray-900">Pesu </span><span className="text-blue-500">Da</span><span className="text-pink-500">Di</span>
        </h1>
        {partnerGender && (
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${badgeBg}`}>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
            <span className={`text-lg font-bold ${symbolColor}`}>{symbol}</span>
            <span className="text-sm font-medium text-gray-600">•</span>
            <span className="text-sm font-medium text-gray-700">{partnerRegion}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          onClick={onNext}
          className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 h-10 px-4 font-medium"
        >
          Next Chat
        </Button>
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

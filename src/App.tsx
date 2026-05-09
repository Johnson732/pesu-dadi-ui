import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Searching from "@/pages/Searching";
import Chat from "@/pages/Chat";
import Disconnected from "@/pages/Disconnected";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/searching" component={Searching} />
      <Route path="/chat" component={Chat} />
      <Route path="/disconnected" component={Disconnected} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;

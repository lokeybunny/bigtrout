import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { MusicPlayer } from "./components/MusicPlayer";
import Index from "./pages/Index";
import News from "./pages/News";
import Lore from "./pages/Lore";
import Live from "./pages/Live";
import Game from "./pages/Game";
import Meme from "./pages/Meme";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/news" element={<News />} />
          <Route path="/lore" element={<Lore />} />
          <Route path="/live" element={<Live />} />
          <Route path="/game" element={<Game />} />
          <Route path="/meme" element={<Meme />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <MusicPlayer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import AdminCreatures from "./pages/AdminCreatures";
import AdminSkills from "./pages/AdminSkills";
import AdminCards from "./pages/AdminCards";
import AdminListPage from "./pages/AdminListPage";
import NfcTestPage from "./pages/NfcTestPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminCreatures />} />
          <Route path="/admin/skills" element={<AdminSkills />} />
          <Route path="/admin/cards" element={<AdminCards />} />
          <Route path="/admin/list" element={<AdminListPage />} />
          <Route path="/nfc-test" element={<NfcTestPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import TracksPage from "./pages/Tracks";
import TrackDetail from "./pages/TrackDetail";
import CoursePlayer from "./pages/CoursePlayer";
import CoursesPage from "./pages/Courses";
import PracticePage from "./pages/Practice";
import QuestionHubPage from "./pages/QuestionHub";
import HackathonsPage from "./pages/Hackathons";
import TechVisePage from "./pages/TechVise";
import RoadmapsPage from "./pages/Roadmaps";
import MissionPage from "./pages/Mission";
import ProfilePage from "./pages/Profile";
import WhatsUpInTechPage from "./pages/WhatsUpInTech";
import KnowledgeGraphPage from "./pages/KnowledgeGraph";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./components/theme-provider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tracks" element={<TracksPage />} />
              <Route path="/tracks/:trackId" element={<TrackDetail />} />
              <Route path="/tracks/:trackId/courses/:courseId" element={<CoursePlayer />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/question-hub" element={<QuestionHubPage />} />
              <Route path="/hackathons" element={<HackathonsPage />} />
              <Route path="/techvise" element={<TechVisePage />} />
              <Route path="/whats-up-in-tech" element={<WhatsUpInTechPage />} />
              <Route path="/roadmaps" element={<RoadmapsPage />} />
              <Route path="/mission" element={<MissionPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/knowledge-graph" element={<KnowledgeGraphPage />} />
              <Route path="/settings" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import TracksPage from "./pages/Tracks";
import TrackDetail from "./pages/TrackDetail";
import CoursePlayer from "./pages/CoursePlayer";
import CoursesPage from "./pages/Courses";
import PracticePage from "./pages/Practice";
import LabView from "./pages/LabView";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lab" element={<LabView />} />
            <Route path="/lab/:labId" element={<LabView />} />
            <Route path="/tracks" element={<TracksPage />} />
            <Route path="/tracks/:trackId" element={<TrackDetail />} />
            <Route path="/tracks/:trackId/courses/:courseId" element={<CoursePlayer />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

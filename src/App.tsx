import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HowItWorks from "./pages/HowItWorks";
import Join from "./pages/Join";
import Farmers from "./pages/Farmers";
import Distributors from "./pages/Distributors";
import Retailers from "./pages/Retailers";
import Consumers from "./pages/Consumers";
import BatchDetails from "./pages/BatchDetails";
import Login from "./pages/Login";
import BlockchainGuide from "./pages/BlockchainGuide";
import FairTrade from "./pages/FairTrade";
import ApiDocs from "./pages/ApiDocs";
import Support from "./pages/Support";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import { AuthProvider } from "./context/AuthContext";
import FarmerProfile from "./pages/profiles/FarmerProfile";
import DistributorProfile from "./pages/profiles/DistributorProfile";
import RetailerProfile from "./pages/profiles/RetailerProfile";
import ConsumerProfile from "./pages/profiles/ConsumerProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import VerificationCenterDashboard from "./components/VerificationCenterDashboard";
import ConsumerBatchInfo from "./components/ConsumerBatchInfo";
import VerifierDashboard from "./pages/VerifierDashboard";

const queryClient = new QueryClient();

const App = () => (
  <I18nextProvider i18n={i18n}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/join" element={<Join />} />
              <Route path="/login" element={<Login />} />
              <Route path="/batch" element={<BatchDetails />} />
              <Route path="/verification" element={<VerificationCenterDashboard />} />
              <Route path="/batch/:batchId/info" element={<ConsumerBatchInfo batchId={"1"} />} />
              <Route element={<ProtectedRoute role="verifier" />}>
                <Route path="/verifier" element={<VerifierDashboard />} />
              </Route>

              <Route element={<ProtectedRoute role="farmer" />}>
                <Route path="/farmers" element={<Farmers />} />
                <Route path="/profile/farmer" element={<FarmerProfile />} />
              </Route>
              <Route element={<ProtectedRoute role="distributor" />}>
                <Route path="/distributors" element={<Distributors />} />
                <Route path="/profile/distributor" element={<DistributorProfile />} />
              </Route>
              <Route element={<ProtectedRoute role="retailer" />}>
                <Route path="/retailers" element={<Retailers />} />
                <Route path="/profile/retailer" element={<RetailerProfile />} />
              </Route>
              <Route element={<ProtectedRoute role="consumer" />}>
                <Route path="/consumers" element={<Consumers />} />
                <Route path="/profile/consumer" element={<ConsumerProfile />} />
              </Route>
              <Route path="/blockchain-guide" element={<BlockchainGuide />} />
              <Route path="/fair-trade" element={<FairTrade />} />
              <Route path="/api-docs" element={<ApiDocs />} />
              <Route path="/support" element={<Support />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </I18nextProvider>
);

export default App;

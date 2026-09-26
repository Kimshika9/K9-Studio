import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { Intro } from "./intro/Intro";
import { Layout } from "./layout/Layout";
import { RequireAuth } from "./auth/RequireAuth";
import { RequireAdmin } from "./auth/RequireAdmin";
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Projects, { ProjectDetail } from "./pages/Projects";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Support from "./pages/Support";
import CustomProject from "./pages/CustomProject";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

/** Scrolls to top on route change. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  // Returning visitors skip the intro from the very first render (spec §6)
  const [introDone, setIntroDone] = useState(() => {
    try {
      return sessionStorage.getItem("k9-intro-seen") === "1";
    } catch {
      return false;
    }
  });
  const location = useLocation();

  const isAdminArea = location.pathname.startsWith("/admin");
  const isAccountArea = location.pathname.startsWith("/account");
  const noIntro = introDone || isAdminArea || isAccountArea;

  return (
    <>
      {!noIntro && <Intro onDone={() => sessionStorage.setItem("k9-intro-seen", "1")} />}
      <ScrollToTop />
      <Routes>
        {/* Standalone screens (no site chrome) */}
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />
        <Route
          path="/account/*"
          element={
            <RequireAuth>
              <Account />
            </RequireAuth>
          }
        />
        {/* Public site with shared layout */}
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:slug" element={<ProjectDetail />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/support" element={<Support />} />
              <Route path="/custom" element={<CustomProject />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        } />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--surface-solid)",
            border: "1px solid var(--border-strong)",
            color: "var(--text-1)",
          },
        }}
      />
    </>
  );
}

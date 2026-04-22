import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-4 border-b">
        <h1
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          BrandHub
        </h1>

        <Button variant="outline" onClick={() => navigate("/sign-in")}>
          Login
        </Button>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 space-y-6">
        <h2 className="text-5xl font-bold leading-tight max-w-2xl">
          Build & Manage Your Brand Like a Pro
        </h2>

        <p className="text-gray-600 max-w-xl">
          Create your brand, manage products, and scale your business with our
          powerful eCommerce platform.
        </p>

        <div className="flex gap-4">
          {/* ✅ Go to signup */}
          <Button size="lg" onClick={() => navigate("/brand/signup")}>
            Get Started
          </Button>

          {/* Optional */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/about")}
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6 px-10 py-16">
        <div className="p-6 border rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg">Easy Setup</h3>
          <p className="text-gray-600 mt-2">
            Create your brand in minutes with a simple onboarding flow.
          </p>
        </div>

        <div className="p-6 border rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg">Manage Products</h3>
          <p className="text-gray-600 mt-2">
            Add, update, and organize your products easily.
          </p>
        </div>

        <div className="p-6 border rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg">Grow Business</h3>
          <p className="text-gray-600 mt-2">
            Scale your brand with powerful tools and analytics.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-20 bg-gray-100">
        <h2 className="text-3xl font-bold mb-4">Ready to launch your brand?</h2>

        <Button size="lg" onClick={() => navigate("/brand/signup")}>
          Sign Up as Brand
        </Button>
      </section>
    </div>
  );
}

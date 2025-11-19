import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Sparkles, Shield, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">{APP_TITLE}</span>
          </div>
          <Button onClick={handleGetStarted} size="lg">
            {isAuthenticated ? 'Go to Dashboard' : 'Try for Free'}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            The World's Best <span className="text-emerald-600">Excel AI</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform hours of Excel work into minutes with AI-powered spreadsheet automation, 
            financial modeling, and data processing.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg" className="text-lg px-8">
              Try for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Powered Automation</h3>
            <p className="text-gray-600">
              Natural language commands to create formulas, clean data, and build complex financial models instantly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Formula-Driven Outputs</h3>
            <p className="text-gray-600">
              Dynamic formulas that update with your data, not hard-coded values that break when inputs change.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Never Overwrites Data</h3>
            <p className="text-gray-600">
              Precise edits without overwriting existing information, addressing a primary concern with AI tools.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted by Professionals</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              'Accounting & FP&A',
              'Private Equity & VC',
              'Startups and Tech',
              'Corporate Real Estate',
              'Finance & Operations',
              'Management Consulting'
            ].map((useCase) => (
              <div key={useCase} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <span className="font-medium text-gray-700">{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold text-gray-900">
            Ready to Transform Your Excel Workflow?
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of professionals who save 10+ hours weekly with AI-powered spreadsheet automation.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="text-lg px-8">
            Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 {APP_TITLE}. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

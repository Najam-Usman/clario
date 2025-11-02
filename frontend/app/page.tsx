import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Brain, ArrowRight, CheckCircle, Heart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-purple-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-600 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold text-purple-900">Hoppr AI</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/upload">
              <Button className="bg-purple-600 text-white hover:bg-purple-700 rounded-full px-6">
                Try Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button className="bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-full px-6">
              Login
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-purple-400/40 to-purple-600/20 blur-3xl" />
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 shadow-2xl" />
            </div>
          </div>

          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              AI Radiology <span className="text-purple-600">Analysis</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Upload your X-ray or scan and receive clear, easy-to-understand insights powered by advanced AI technology
            </p>
            <Link href="/upload">
              <Button
                size="lg"
                className="bg-white text-purple-700 hover:bg-purple-50 border-2 border-purple-600 rounded-full px-8 h-14 text-lg font-medium"
              >
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to understand your radiology results</p>
          </div>

          <div className="space-y-8">
            <Card className="bg-white border-purple-100 shadow-lg rounded-3xl overflow-hidden">
              <CardContent className="p-8 md:p-10">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold">
                    01
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload Your Radiology Image</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Securely upload your X-ray, CT scan, or MRI image for instant AI-powered analysis
                    </p>
                  </div>
                  <Brain className="hidden md:block w-12 h-12 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-purple-100 shadow-lg rounded-3xl overflow-hidden">
              <CardContent className="p-8 md:p-10">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold">
                    02
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Complete Quick Questionnaire</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Answer a few simple questions about your symptoms and medical history to help contextualize your
                      results
                    </p>
                  </div>
                  <FileText className="hidden md:block w-12 h-12 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-purple-100 shadow-lg rounded-3xl overflow-hidden">
              <CardContent className="p-8 md:p-10">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold">
                    03
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Clear, Actionable Results</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Receive plain-language explanations with confidence scores and recommended next steps
                    </p>
                  </div>
                  <CheckCircle className="hidden md:block w-12 h-12 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-purple-100 via-purple-50 to-white border border-purple-200 rounded-3xl p-12 md:p-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Ready to Understand Your Results?</h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Get instant, AI-powered insights into your radiology images in just minutes
          </p>
          <Link href="/upload">
            <Button
              size="lg"
              className="bg-purple-600 text-white hover:bg-purple-700 rounded-full px-10 h-14 text-lg font-medium"
            >
              Start Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-100 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-gray-500">
          <p>© 2025 Hoppr AI. For informational purposes only. Not a substitute for professional medical advice.</p>
        </div>
      </footer>
    </div>
  )
}

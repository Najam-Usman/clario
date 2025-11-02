"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { AlertCircle, CheckCircle, Info, Calendar, Download, Share2, Sparkles } from "lucide-react"
import ConfidenceGauge from "@/components/confidence-gauge"
import { use } from "react"

const mockResult = {
  finding_summary: "No significant abnormalities detected",
  detailed_explanation:
    "The AI analysis of your chest X-ray shows clear lung fields with no signs of pneumonia, fluid accumulation, or masses. The heart size appears normal, and the bone structures are intact. This is a reassuring finding that suggests no acute issues requiring immediate attention.",
  confidence_score: 92.5,
  severity: "normal",
  recommended_actions:
    "Continue with your current health routine. If you develop new symptoms such as persistent cough, chest pain, or difficulty breathing, please consult your healthcare provider.",
  follow_up_needed: false,
  follow_up_urgency: "none",
}

const mockScan = {
  image_type: "X-Ray",
  body_part: "Chest",
  uploaded_at: new Date().toISOString(),
  image_url: "/chest-xray-medical-scan.jpg",
}

export default function ResultsPage({
  params,
}: {
  params: Promise<{ scanId: string }>
}) {
  const { scanId } = use(params)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "normal":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "mild":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "moderate":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "severe":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "critical":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-secondary/50 text-muted-foreground border-border"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "normal":
        return <CheckCircle className="h-5 w-5" />
      case "mild":
        return <Info className="h-5 w-5" />
      case "moderate":
        return <AlertCircle className="h-5 w-5" />
      case "severe":
        return <AlertCircle className="h-5 w-5" />
      case "critical":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground tracking-tight">Hoppr AI</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
                Your Radiology Report
              </h2>
              <p className="text-lg text-muted-foreground">
                {mockScan.image_type} - {mockScan.body_part} • {new Date(mockScan.uploaded_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="border-border hover:bg-secondary bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" className="border-border hover:bg-secondary bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Key Finding */}
          <Card className={`border-2 bg-card ${getSeverityColor(mockResult.severity)}`}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center ${getSeverityColor(mockResult.severity)}`}
                >
                  {getSeverityIcon(mockResult.severity)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl mb-3 text-foreground">
                    {mockResult.finding_summary}
                  </CardTitle>
                  <Badge variant="outline" className={getSeverityColor(mockResult.severity)}>
                    {mockResult.severity.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Confidence Score */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">AI Confidence Level</CardTitle>
              <CardDescription className="text-muted-foreground">
                How confident our AI is in this analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConfidenceGauge score={mockResult.confidence_score} />
              <p className="text-sm text-muted-foreground mt-6 leading-relaxed">
                A confidence score of {mockResult.confidence_score.toFixed(1)}% indicates that our AI model has high
                certainty in this analysis based on the image quality and pattern recognition.
              </p>
            </CardContent>
          </Card>

          {/* Detailed Explanation */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Detailed Explanation</CardTitle>
              <CardDescription className="text-muted-foreground">What the AI found in your scan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed text-lg">{mockResult.detailed_explanation}</p>
            </CardContent>
          </Card>

          {/* Scan Image */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Your Scan</CardTitle>
              <CardDescription className="text-muted-foreground">The radiology image that was analyzed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-xl overflow-hidden bg-secondary/30">
                <img
                  src={mockScan.image_url || "/placeholder.svg"}
                  alt="Radiology scan"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recommended Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Recommended Next Steps</CardTitle>
              <CardDescription className="text-muted-foreground">
                What you should do based on these results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-foreground leading-relaxed text-lg">{mockResult.recommended_actions}</p>

              {mockResult.follow_up_needed && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Calendar className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 text-lg">Follow-up Recommended</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Based on these findings, we recommend scheduling a follow-up appointment with your healthcare
                        provider.
                      </p>
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Schedule Appointment
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Important Disclaimer */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground mb-2 text-base">Important Notice</p>
                  <p>
                    This AI-generated report is for informational purposes only and does not replace professional
                    medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider about
                    your medical condition and before making any healthcare decisions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/" className="flex-1">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Try Another Scan
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { AlertCircle, CheckCircle, Info, Download, Share2, Sparkles, Copy, User } from "lucide-react"
import ConfidenceGauge from "@/components/confidence-gauge"
import { useState, useEffect } from "react"

const mockResult = {
  finding_summary: "No significant abnormalities detected",
  detailed_explanation:
    "The AI analysis of your radiology scan shows clear imaging with no signs of acute abnormalities. The structures appear normal, and there are no concerning findings that require immediate attention. This is a reassuring result that suggests no urgent issues.",
  confidence_score: 92.5,
  severity: "normal",
  recommended_actions:
    "Continue with your current health routine. If you develop new symptoms or have concerns, please consult your healthcare provider for a comprehensive evaluation.",
}

export default function ResultsPage() {
  const [questionnaireData, setQuestionnaireData] = useState<any>(null)
  const [formattedData, setFormattedData] = useState<string>("")
  const [showQuestionnaireData, setShowQuestionnaireData] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pipelineStatus, setPipelineStatus] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  // Poll pipeline status
  const checkPipelineStatus = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/status?analysisId=${analysisId}`)
      const status = await response.json()
      setPipelineStatus(status)
      
      if (status.status === 'running') {
        // Set start time if not already set
        if (!startTime) {
          setStartTime(Date.now())
        }
        
        // Check for timeout (5 minutes)
        const elapsed = Date.now() - (startTime || Date.now())
        if (elapsed > 300000) { // 5 minutes
          console.warn('Pipeline timeout - proceeding with GPT analysis')
          await runGPTAnalysis("Pipeline analysis timed out")
          return
        }
        
        // Simulate progress based on time elapsed
        const startTimeValue = new Date(status.startTime).getTime()
        const currentTime = new Date().getTime()
        const elapsedFromStart = currentTime - startTimeValue
        const estimatedTotal = 120000 // 2 minutes
        const calculatedProgress = Math.min((elapsedFromStart / estimatedTotal) * 100, 95)
        setProgress(calculatedProgress)
        
        // Continue polling
        setTimeout(() => checkPipelineStatus(analysisId), 2000)
      } else if (status.status === 'completed') {
        setProgress(100)
        // Run GPT analysis with questionnaire data
        await runGPTAnalysis(status.pipelineOutput)
      } else if (status.status === 'error') {
        setProgress(100)
        console.error('Pipeline failed:', status.error)
        // Still try to run GPT analysis with whatever output we have
        await runGPTAnalysis(status.pipelineOutput || "Pipeline analysis failed")
      }
    } catch (error) {
      console.error('Status check failed:', error)
      setIsProcessing(false)
      setIsLoading(false)
    }
  }

  // Run GPT analysis with both pipeline results and questionnaire data
  const runGPTAnalysis = async (pipelineOutput: string) => {
    try {
      const uploadedFilePath = localStorage.getItem('uploadedFilePath')
      const questionnaireData = localStorage.getItem('questionnaireData')
      
      console.log("Running GPT analysis with pipeline results and questionnaire data")
      
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filepath: uploadedFilePath,
          questionnaireData: questionnaireData ? JSON.parse(questionnaireData) : null,
          pipelineOutput: pipelineOutput // Include pipeline results
        }),
      })
      
      if (!analysisResponse.ok) {
        throw new Error('GPT analysis failed')
      }
      
      const analysisResults = await analysisResponse.json()
      setAnalysisResults(analysisResults)
      localStorage.setItem('analysisResults', JSON.stringify(analysisResults))
      
      setIsProcessing(false)
      setIsLoading(false)
      
    } catch (error) {
      console.error('GPT analysis failed:', error)
      setIsProcessing(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Load questionnaire data from localStorage
    const storedData = localStorage.getItem('questionnaireData')
    const storedFormatted = localStorage.getItem('questionnaireFormatted')
    const storedAnalysis = localStorage.getItem('analysisResults')
    const analysisId = localStorage.getItem('analysisId')
    
    if (storedData) {
      setQuestionnaireData(JSON.parse(storedData))
    }
    if (storedFormatted) {
      setFormattedData(storedFormatted)
    }
    
    // Check if we have completed analysis results
    if (storedAnalysis) {
      setAnalysisResults(JSON.parse(storedAnalysis))
      setIsLoading(false)
    } else if (analysisId) {
      // Start checking pipeline status
      setIsProcessing(true)
      checkPipelineStatus(analysisId)
    } else {
      // No analysis to check
      setIsLoading(false)
    }
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const getDisplayResults = () => {
    if (analysisResults && analysisResults.success) {
      // Parse the real analysis results
      return {
        finding_summary: "AI Analysis Complete",
        detailed_explanation: analysisResults.pipelineAnalysis || "Analysis completed successfully",
        gpt_analysis: analysisResults.gptAnalysis || "GPT analysis not available",
        confidence_score: 85.0, // You might want to extract this from the pipeline output
        severity: "normal", // You might want to determine this from the analysis
        recommended_actions: "Please consult with your healthcare provider to discuss these results."
      }
    }
    
    // Fallback to mock data if no real analysis available
    return {
      finding_summary: "No analysis data available",
      detailed_explanation: "Please upload a scan and complete the questionnaire to see results.",
      confidence_score: 0,
      severity: "normal",
      recommended_actions: "Upload a new scan to get started."
    }
  }

  const currentResults = getDisplayResults()
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
          
          {/* Processing Screen */}
          {isProcessing && (
            <div className="text-center space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
                  Analyzing Your Scan
                </h2>
                <p className="text-lg text-muted-foreground">
                  Please wait while our AI processes your radiology image...
                </p>
              </div>
              
              <Card className="bg-card border-border max-w-2xl mx-auto">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">Analysis Progress</span>
                      <span className="text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    {/* Status Message */}
                    <div className="text-center text-sm text-muted-foreground">
                      {pipelineStatus?.message || 'Processing...'}
                    </div>
                    
                    {/* Processing Steps */}
                    <div className="space-y-3 pt-4">
                      <div className="flex items-center gap-3">
                        {progress > 20 ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted animate-spin"></div>
                        )}
                        <span className="text-sm">Loading medical imaging models...</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {progress > 50 ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : progress > 20 ? (
                          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted"></div>
                        )}
                        <span className="text-sm">Analyzing radiology image...</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {progress > 80 ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : progress > 50 ? (
                          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted"></div>
                        )}
                        <span className="text-sm">Generating medical findings...</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {progress >= 100 ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : progress > 80 ? (
                          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted"></div>
                        )}
                        <span className="text-sm">Preparing personalized report...</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                This usually takes 1-2 minutes. Thank you for your patience while we ensure the highest quality analysis.
              </p>
              
              {/* Manual proceed button if stuck */}
              {progress >= 100 && (
                <div className="mt-6">
                  <Button 
                    onClick={() => runGPTAnalysis("Pipeline completed")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Proceed to Results
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Regular Results Content */}
          {!isProcessing && (
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
                    Your Radiology Report
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Analysis completed • {new Date().toLocaleDateString()}
                    {analysisResults && ` • File: ${localStorage.getItem('uploadedFileName') || 'Unknown'}`}
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
          <Card className={`border-2 bg-card ${getSeverityColor(currentResults.severity)}`}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center ${getSeverityColor(currentResults.severity)}`}
                >
                  {getSeverityIcon(currentResults.severity)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl mb-3 text-foreground">
                    {currentResults.finding_summary}
                  </CardTitle>
                  <Badge variant="outline" className={getSeverityColor(currentResults.severity)}>
                    {currentResults.severity.toUpperCase()}
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
              <ConfidenceGauge score={currentResults.confidence_score} />
              <p className="text-sm text-muted-foreground mt-6 leading-relaxed">
                A confidence score of {currentResults.confidence_score.toFixed(1)}% indicates that our AI model has high
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
              <p className="text-foreground leading-relaxed text-lg">{currentResults.detailed_explanation}</p>
            </CardContent>
          </Card>

          {/* GPT Analysis Section */}
          {analysisResults && analysisResults.gptAnalysis && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">AI-Powered Interpretation</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Personalized analysis combining scan results with your questionnaire data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed text-lg">{analysisResults.gptAnalysis}</p>
              </CardContent>
            </Card>
          )}

          {/* Recommended Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Recommended Next Steps</CardTitle>
              <CardDescription className="text-muted-foreground">
                What you should do based on these results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-foreground leading-relaxed text-lg">{currentResults.recommended_actions}</p>
            </CardContent>
          </Card>

          {/* Questionnaire Data Section */}
          {questionnaireData && (
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                      <User className="h-6 w-6" />
                      Patient Information
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Data collected from your questionnaire
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQuestionnaireData(!showQuestionnaireData)}
                      className="border-border hover:bg-secondary bg-transparent"
                    >
                      {showQuestionnaireData ? "Hide" : "Show"} Raw Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(formattedData)}
                      className="border-border hover:bg-secondary bg-transparent"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy for ChatGPT
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {showQuestionnaireData && (
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2">Structured JSON Data:</h4>
                      <pre className="text-sm text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(questionnaireData, null, 2)}
                      </pre>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2">ChatGPT Formatted:</h4>
                      <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {formattedData}
                      </pre>
                    </div>
                  </div>
                )}
                {!showQuestionnaireData && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Personal Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Name:</span> {questionnaireData.personalInformation?.firstName} {questionnaireData.personalInformation?.lastName}</p>
                        <p><span className="text-muted-foreground">Gender:</span> {questionnaireData.personalInformation?.gender}</p>
                        <p><span className="text-muted-foreground">Date of Birth:</span> {questionnaireData.personalInformation?.dateOfBirth}</p>
                        <p><span className="text-muted-foreground">Weight:</span> {questionnaireData.personalInformation?.weight}</p>
                        <p><span className="text-muted-foreground">Height:</span> {questionnaireData.personalInformation?.height}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Medical History</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Medications:</span> {questionnaireData.medicalHistory?.currentMedications?.join(", ")}</p>
                        <p><span className="text-muted-foreground">Allergies:</span> {questionnaireData.medicalHistory?.knownAllergies?.join(", ")}</p>
                        <p><span className="text-muted-foreground">Family History:</span> {questionnaireData.medicalHistory?.familyHistory?.hasChronicDiseases}</p>
                        <p><span className="text-muted-foreground">Symptoms:</span> {questionnaireData.currentSymptoms?.join(", ")}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
                Analyze Another Scan
              </Button>
            </Link>
          </div>
          </>
          )}
        </div>
      </main>
    </div>
  )
}

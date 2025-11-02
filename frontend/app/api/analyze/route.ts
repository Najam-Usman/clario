import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filepath, questionnaireData } = body

    if (!filepath) {
      return NextResponse.json({ error: "No file path provided" }, { status: 400 })
    }

    // Check if file exists
    if (!existsSync(filepath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Create temp directory for questionnaire data if provided
    let questionnaireFile = null
    if (questionnaireData) {
      const tempDir = join(process.cwd(), '..', 'temp')
      await mkdir(tempDir, { recursive: true })
      
      questionnaireFile = join(tempDir, `questionnaire_${Date.now()}.json`)
      await writeFile(questionnaireFile, JSON.stringify(questionnaireData, null, 2))
    }

    // Run pipeline.py to get the medical analysis
    console.log(`Running analysis on: ${filepath}`)
    const pipelineCommand = `python "${join(process.cwd(), '..', 'pipeline.py')}" "${filepath}"`
    
    const { stdout: pipelineOutput, stderr: pipelineError } = await execAsync(pipelineCommand, {
      cwd: join(process.cwd(), '..'),
      encoding: 'utf8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    })

    if (pipelineError) {
      console.error("Pipeline stderr:", pipelineError)
    }

    // Run gptapi.py to get GPT analysis
    console.log("Running GPT analysis...")
    let gptCommand = `python "${join(process.cwd(), '..', 'gptapi.py')}" "${filepath}"`
    
    // Add questionnaire data if available
    if (questionnaireFile) {
      // For now, we'll pass the questionnaire data via a separate mechanism
      // You might want to modify gptapi.py to accept questionnaire file path
    }

    const { stdout: gptOutput, stderr: gptError } = await execAsync(gptCommand, {
      cwd: join(process.cwd(), '..'),
      encoding: 'utf8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    })

    if (gptError) {
      console.error("GPT stderr:", gptError)
    }

    // Parse the outputs and return structured results
    const analysisResults = {
      pipelineAnalysis: pipelineOutput,
      gptAnalysis: gptOutput,
      questionnaireData: questionnaireData || null,
      timestamp: new Date().toISOString(),
      success: true
    }

    return NextResponse.json(analysisResults)

  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ 
      error: "Analysis failed", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { exec } from "child_process"
import { promisify } from "util"
import { existsSync } from "fs"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), '..', 'uploads')
    await mkdir(uploadsDir, { recursive: true })
    
    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const filename = `${timestamp}_${file.name}`
    const filepath = join(uploadsDir, filename)

    // Save file locally
    await writeFile(filepath, buffer)

    // Start pipeline analysis in background (don't wait for it)
    const analysisId = `analysis_${timestamp}`
    startPipelineAnalysis(filepath, analysisId)

    return NextResponse.json({
      message: "File uploaded successfully",
      filename: filename,
      filepath: filepath,
      originalName: file.name,
      size: file.size,
      type: file.type,
      analysisId: analysisId, // Return analysis ID to track progress
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

// Start pipeline analysis in background
async function startPipelineAnalysis(filepath: string, analysisId: string) {
  try {
    console.log(`Starting pipeline analysis for: ${filepath}`)
    
    // Create status file to track progress
    const statusDir = join(process.cwd(), '..', 'temp')
    await mkdir(statusDir, { recursive: true })
    const statusFile = join(statusDir, `${analysisId}_status.json`)
    
    // Set initial status
    await writeFile(statusFile, JSON.stringify({
      status: 'running',
      progress: 0,
      startTime: new Date().toISOString(),
      message: 'Starting pipeline analysis...'
    }))

    // Run pipeline analysis
    const pipelineCommand = `python "${join(process.cwd(), '..', 'pipeline.py')}" "${filepath}"`
    const { stdout: pipelineOutput, stderr: pipelineError } = await execAsync(pipelineCommand, {
      cwd: join(process.cwd(), '..'),
      encoding: 'utf8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    })

    // Update status to completed
    await writeFile(statusFile, JSON.stringify({
      status: 'completed',
      progress: 100,
      endTime: new Date().toISOString(),
      pipelineOutput: pipelineOutput,
      pipelineError: pipelineError,
      message: 'Pipeline analysis completed'
    }))

    console.log(`Pipeline analysis completed for: ${filepath}`)
  } catch (error) {
    console.error('Pipeline analysis failed:', error)
    
    // Update status to error
    const statusDir = join(process.cwd(), '..', 'temp')
    const statusFile = join(statusDir, `${analysisId}_status.json`)
    try {
      await writeFile(statusFile, JSON.stringify({
        status: 'error',
        progress: 0,
        endTime: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        message: 'Pipeline analysis failed'
      }))
    } catch (writeError) {
      console.error('Failed to write error status:', writeError)
    }
  }
}

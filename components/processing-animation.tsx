"use client"

// import { useCallback, useEffect, useMemo, useState } from "react"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Zap, CheckCircle } from "lucide-react"

interface ProcessingAnimationProps {
  onComplete: () => void
  processingType: "generate_shorts" | "edit_short",
  video?: string
}

export function ProcessingAnimation({ onComplete, processingType }: ProcessingAnimationProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

//   const stepCaptions = useMemo(() => {
//   if (processingType === "edit_short") {
//     return [
//       "Uploading your video...",
//       "Analyzing video content...",
//       "Processing video...",
//       "Applying enhancements...",
//       "Adding selected features...",
//       "Finalizing output...",
//     ]
//   } else {
//     return [
//       "Analyzing video content...",
//       "Identifying key moments...",
//       "Generating short clips...",
//       "Applying enhancements...",
//       "Adding selected features...",
//       "Finalizing output...",
//     ]
//   }
// }, [processingType])

//    /** -----------------------------------------------------------------
//    * 1. Low‑level API helpers
//    * ----------------------------------------------------------------- */
//   const uploadVideo = async (file: File) => {
//     const body = new FormData()
//     body.append("file", file)

//     await fetch("/api/upload", { method: "POST", body })
//     // add error handling here
//   }

//   const analyzeVideo = async () => fetch("/api/analyze", { method: "POST" })
//   const detectKeyMoments = async () =>
//     fetch("/api/key‑moments", { method: "POST" })
//   const generateClips = async () => fetch("/api/generate‑clips", { method: "POST" })
//   const enhanceVideo = async () => fetch("/api/enhance", { method: "POST" })
//   const finalize = async () => fetch("/api/finalize", { method: "POST" })

//   /** -----------------------------------------------------------------
//    * 2. The ordered pipeline (array of async fns)
//    * ----------------------------------------------------------------- */
//   const pipeline: (() => Promise<unknown>)[] = useMemo(() => {
//     if (processingType === "generate_shorts") {
//       return [
//         analyzeVideo,
//         detectKeyMoments,
//         generateClips,
//         enhanceVideo,
//         finalize,
//       ]
//     }

//     // edit_short variant
//     return [
//       // () => uploadVideo(video),
//       analyzeVideo,
//       enhanceVideo,
//       generateClips,
//       finalize,
//       () => Promise.resolve(), // placeholder if you still want 6 steps
//     ]
//   }, [processingType, video])

//   /** -----------------------------------------------------------------
//    * 3. Run the pipeline once when component mounts
//    * ----------------------------------------------------------------- */
//   const runPipeline = useCallback(async () => {
//     for (let i = 0; i < pipeline.length; i++) {
//       setCurrentStep(i)

//       /* Optional: show a “loading wiggle” while we wait */
//       const animate = startFakeProgress(i, pipeline.length)

//       try {
//         await pipeline[i]() // <- real API call
//       } finally {
//         animate.stop() // ensure the wiggle timer is cleared
//       }

//       /* Finished this step */
//       setProgress(((i + 1) / pipeline.length) * 100)
//     }

//     /** All done */
//     onComplete()
//   }, [pipeline, onComplete])

//   useEffect(() => {
//     runPipeline().catch(console.error)
//     // eslint‑disable‑next‑line react‑hooks/exhaustive‑deps
//   }, [])

//   /* ------------------------------------------------------------------ */

//   return (
//     <div className="space-y-4">
//       <Progress value={progress} />
//       <p className="text-sm text-center">{stepCaptions[currentStep]}</p>
//     </div>
//   )
// }

// /* -------------------------------------------------------------------- */
// /* Helpers                                                              */
// /* -------------------------------------------------------------------- */

// /**
//  * While a real step is running, we can “wiggle” the bar forward a tiny
//  * bit every ~800 ms so the UI doesn’t look frozen.  The returned object
//  * has a stop() method so you can cancel the timer once the Promise
//  * resolves.
//  */
// function startFakeProgress(
//   stepIndex: number,
//   stepsTotal: number,
//   tick = 800,
// ) {
//   let cancelled = false

//   const timer = setInterval(() => {
//     if (cancelled) return
//     const base = (stepIndex / stepsTotal) * 100
//     const wiggle = Math.random() * 3 // 0–3 %
//     // never exceed the start of the *next* step
//     const upperBound = ((stepIndex + 0.95) / stepsTotal) * 100
//     const next = Math.min(base + wiggle, upperBound)
//     setProgressSafely(next)
//   }, tick)

//   return {
//     stop() {
//       cancelled = true
//       clearInterval(timer)
//     },
//   }
// }

// // /* Guard against React state updates after unmount */
// let live = true
// function setProgressSafely(v: number) {
//   if (live) setProgressGlobal?.(v)
// }
// let setProgressGlobal: React.Dispatch<React.SetStateAction<number>>




  const steps = [
    processingType === "edit_short" ? "Uploading your video..." : "Analyzing video content..",
    "Analyzing video content...",
    processingType === "generate_shorts" ? "Identifying key moments..." : "Processing video...",
    processingType === "generate_shorts" ? "Generating short clips..." : "Applying enhancements...",
    "Adding selected features...",
    "Finalizing output...",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15 + 5
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 1000)
          return 100
        }
        return newProgress
      })
    }, 800)

    return () => clearInterval(interval)
  }, [onComplete])

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 1600)

    return () => clearInterval(stepInterval)
  }, [processingType])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center animate-pulse">
              {progress === 100 ? (
                <CheckCircle className="h-10 w-10 text-white" />
              ) : (
                <Zap className="h-10 w-10 text-white animate-bounce" />
              )}
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-primary/20 rounded-full animate-ping"></div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              {progress === 100 ? "Processing Complete!" : "Processing Your Video"}
            </h3>
            <p className="text-muted-foreground">{progress === 100 ? "Your video is ready!" : steps[currentStep]}</p>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Textarea } from "@/components/ui/textarea"
import { Upload, Link, X, FileVideo, Zap, Mail, MessageCircle, CheckIcon as Results } from "lucide-react"
import { cn } from "@/lib/utils"
import { PaymentModal } from "./components/payment-modal"
import { ProcessingAnimation } from "./components/processing-animation"
import { ResultsTab } from "./components/results-tab"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
// import { AuthModal } from "./components/auth-modal"
// import { UserMenu } from "./components/user-menu"
// import type { Session } from "@supabase/supabase-js"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { SignIn,UserButton } from '@clerk/nextjs'
import { useUser } from "@clerk/nextjs"
import { createClient } from "@supabase/supabase-js"
import { useSession } from '@clerk/nextjs'
import type { UserResource } from "@clerk/types";

interface User {
  email: string
  name: string
  avatar: string
}

interface VideoFile {
  file: File
  url: string
  name: string
  size: number
}

interface VideoLink {
  url: string
  title: string
  description: string
}

interface ProcessedVideo {
  id: string
  name: string
  originalSize: string
  processedSize: string
  duration: string
  format: string
  processedAt: string
  thumbnail: string
  downloadUrl: string
  type: "upload" | "link"
  originalUrl?: string
}
function extractYouTubeId(url: string): string | null {
  const regex = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]{11}).*/;
  const match = url.match(regex);
  return match ? match[1] : null;
}


export default function VideoUploader() {

  // Clerk Authentication state
  const { isSignedIn, user, isLoaded } = useUser()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { session } = useSession()
  // function createClerkSupabaseClient() {
  //   return createClient(
  //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //     {
  //       db: { schema: 'cutzy' },
  //       async accessToken() {
  //         return session?.getToken() ?? null
  //       },
  //       auth: {
  //         autoRefreshToken: true,
  //         persistSession: true,
  //         detectSessionInUrl: true,
  //       },
  //     },
  //   )
  // }

  // // Create a `client` object for accessing Supabase data using the Clerk token
  // const client = createClerkSupabaseClient()

  async function requestPost(api:string, payload: any){
    const request =  await fetch(api, {
            method:"POST",
            body: JSON.stringify(payload)
          })
          
    const response = await request.json()
    return response
  }

  async function insertUser(user: UserResource){
    const request = await requestPost("/api/auth/insert-user",{ user: user })
    console.log("insert user", request) 
  }

  async function checkUser(user: UserResource ){

    const userExistance = await requestPost("/api/auth/check-user",{ user: user})
    console.log("User exist?",userExistance)

    // const checkUserRequest =  await fetch("/api/auth/check-user", {
    //         method:"POST",
    //         body: JSON.stringify({ user: user})
    //       })
          
    // console.log("User exist?",userExist) 
    if(!userExistance.isExist){
      await insertUser(user)
    }

    // const { data: existingUser, error: fetchError } = await client
    //   .from("user")
    //   .select("user_id")
    //   .eq("user_id", user.id)

    // if (fetchError && fetchError.code !== "PGRST116") {
    //   // PGRST116 is "Results contain 0 rows" — not an actual error for this case
    //   console.error("Error checking user existence:", fetchError.message);
    // } else if (!existingUser) {
    //   // User doesn't exist, so insert
    //   const { error: insertError } = await client
    //     .from("user")
    //     .insert({
    //       user_id: user.id,
    //       email: user.primaryEmailAddress?.emailAddress,
    //       username: user.username,
    //       first_name: user.firstName,
    //       last_name: user.lastName
    //     })
    //     .single();

    //   if (insertError) {
    //     console.error("Error inserting user:", insertError.message);
    //   } else {
    //     console.log("User inserted successfully");
    //   }
    // } else {
    //   // User already exists, do nothing
    //   console.log("User already exists, skipping insert");
    // }

  }
  useEffect(() => {
    const login = async () => {
      if (isSignedIn && user) {
        checkUser(user)
        loadProcessedVideos(user.id)
        setShowAuthModal(false) // Close modal when user signs in
      } else {
        setProcessedVideos([])
      }
    }
    login()

    
  }, [isSignedIn, user])

  


  const loadProcessedVideos = async (userId: string) => {
    // Mock loading user-specific videos - replace with actual database query
    const mockVideos: ProcessedVideo[] = [
      {
        id: "1",
        name: "Sample Video.mp4",
        originalSize: "125 MB",
        processedSize: "45 MB",
        duration: "2:34",
        format: "MP4",
        processedAt: "2 hours ago",
        thumbnail: "/placeholder.svg?height=100&width=150",
        downloadUrl: "#",
        type: "upload",
      }
    ]
    setProcessedVideos(mockVideos)
  }

  const [uploadedVideo, setUploadedVideo] = useState<VideoFile | null>(null)
  const [videoLink, setVideoLink] = useState<VideoLink>({
    url: "",
    title: "",
    description: "",
  })
  const [isDragging, setIsDragging] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [showPayment, setShowPayment] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedVideos, setProcessedVideos] = useState<ProcessedVideo[]>([
    {
      id: "1",
      name: "Sample Video.mp4",
      originalSize: "125 MB",
      processedSize: "45 MB",
      duration: "2:34",
      format: "MP4",
      processedAt: "2 hours ago",
      thumbnail: "/placeholder.svg?height=100&width=150",
      downloadUrl: "#",
      type: "upload",
    }
  ])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [processingType, setProcessingType] = useState<"generate_shorts" | "edit_short">("generate_shorts")
  const [language, setLanguage] = useState("auto")
  const [parameters, setParameters] = useState({
    caption: false,
    reframe: false,
    emoji: false,
    intro_title: false,
    remove_silences: false,
  })
  const [shortsConfig, setShortsConfig] = useState({
    clipCount: 3,
    minDuration: 15,
    maxDuration: 60,
  })

  // const handleAuthSuccess = (userData: User) => {
  //   setUser(userData)
  //   setShowAuthModal(false)
  // }

  // const handleLogout = () => {
  //   setUser(null)
  //   // Clear any user-specific data
  //   setProcessedVideos([])
  // }

  // Add pricing calculation function
  const calculateShortsPrice = (clipCount: number) => {
    if (clipCount >= 10) return { perClip: 34, total: clipCount * 34 }
    if (clipCount >= 5) return { perClip: 36, total: clipCount * 36 }
    return { perClip: 50, total: clipCount * 50 }
  }

  const handleFileSelect = useCallback((file: File) => {
    if (file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file)
      setUploadedVideo({
        file,
        url,
        name: file.name,
        size: file.size,
      })
    }
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const removeUploadedVideo = () => {
    if (uploadedVideo) {
      URL.revokeObjectURL(uploadedVideo.url)
      setUploadedVideo(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = () => {
    if (!isSignedIn) {
      setShowAuthModal(true)
      return
    }
    console.log("Processing Configuration:", {
      type: processingType,
      language,
      parameters,
      ...(processingType === "generate_shorts" && { shortsConfig }),
      videoUrl: activeTab === "upload" ? uploadedVideo?.url : videoLink.url,
      videoTitle: activeTab === "upload" ? uploadedVideo?.name : videoLink.title,
      user: user?.emailAddresses[0]?.emailAddress,
    })

    
    setShowPayment(true)
  }

  const handlePaymentSuccess = () => {
    setIsProcessing(true)
  }

  // const tesUpload = async (uploadedVideo: VideoFile) => {

  //   // const response =  await fetch("/api/upload-file", {
  //   //   method:"POST",
  //   //   body: JSON.stringify({
  //   //     client:client,
  //   //     file: uploadedVideo?.file
  //   //   })
  //   // })

  //   // const uploadRes = await response.json()
  //   // console.log(uploadRes)
  //   const formData = new FormData();
  //   formData.append("file", uploadedVideo.file);
  //   formData.append("userId", user?) // harus File atau Blob;

  //   const request = await requestPost("/api/storage/upload-file",{ user: user, file:uploadedVideo})
  //   console.log("video uploaded:",request)

  //   // const { data, error } = await client
  //   // .storage
  //   // .from('tes')
  //   // .upload(`${user?.id}/${uploadedVideo?.name}`, uploadedVideo?.file, {
  //   //     upsert: true
  //   // })

  //   // console.log(data,error)
  // }
  
  const handleProcessingComplete = () => {
    setIsProcessing(false)

    // Add new processed video
    const newVideo: ProcessedVideo = {
      id: Date.now().toString(),
      name: activeTab === "upload" ? uploadedVideo?.name || "Unknown" : videoLink.title || "Video Link",
      originalSize: activeTab === "upload" ? formatFileSize(uploadedVideo?.size || 0) : "N/A",
      processedSize: "32 MB",
      duration: "3:45",
      format: "MP4",
      processedAt: "Just now",
      thumbnail: "/placeholder.svg?height=100&width=150",
      downloadUrl: "#",
      type: activeTab as "upload" | "link",
      originalUrl: activeTab === "link" ? videoLink.url : undefined,
    }

    setProcessedVideos((prev) => [newVideo, ...prev])

    // Reset form
    if (activeTab === "upload") {
      removeUploadedVideo()
    } else {
      setVideoLink({ url: "", title: "", description: "" })
    }

    // Switch to results tab
    setActiveTab("results")
  }

  const canSubmit =
    (activeTab === "upload" && uploadedVideo) || (activeTab === "link" && videoLink.url && isValidUrl(videoLink.url))

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <ProcessingAnimation onComplete={handleProcessingComplete} processingType={processingType} />
      </div>
    )
  }
  // video={processingType === "generate_shorts" ? uploadedVideo?.file : videoLink.url}

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* <Button onClick={() => tesUpload(uploadedVideo!)}> PROCESSING</Button> */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-500 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  CutZy
                </h1>
                <p className="text-sm text-muted-foreground">Lightning-fast short video generator</p>
              </div>
            </div>
            {/* Authentication Section */}
            <div className="flex items-center gap-3">
              {isSignedIn ? (
                <div className="flex items-center gap-3">
                  <UserButton showName/>
                  {/* <UserMenu /> */}
                </div>
              ) : (
                
                  <Button
                    size="sm"
                    onClick={() => setShowAuthModal(true)}
                    className="cursor-pointer bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-sm"
                  >
                    Sign In
                  </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Transform Your Videos in Seconds
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate your shorts video with just upload your videos or paste links to our AI-powered processing
              engine.
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
            <CardContent className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger
                    value="upload"
                    className="flex cursor-pointer hover:bg-purple-500/5 items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-500 data-[state=active]:text-white"
                  >
                    <Upload className="h-4 w-4" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger
                    value="link"
                    className="flex cursor-pointer hover:bg-purple-500/5 items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-500 data-[state=active]:text-white"
                  >
                    <Link className="h-4 w-4" />
                    Video Link
                  </TabsTrigger>
                  <TabsTrigger
                    value="results"
                    className="flex cursor-pointer hover:bg-purple-500/5 items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-500 data-[state=active]:text-white"
                  >
                    <Results className="h-4 w-4" />
                    Results ({processedVideos.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-6">
                  {!uploadedVideo ? (
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 relative overflow-hidden",
                        isDragging
                          ? "border-primary bg-gradient-to-r from-primary/10 to-purple-500/10 scale-105"
                          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-purple-500/5",
                      )}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="relative z-10">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                          <FileVideo className="h-10 w-10 text-white" />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-2xl font-semibold">Drop your video here</h3>
                          <p className="text-muted-foreground">or click to browse your files</p>
                        </div>
                        <Button
                          size="lg"
                          className="mt-6 cursor-pointer bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Choose File
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <p className="text-sm text-muted-foreground mt-4">
                          Supports MP4, WebM, AVI, MOV and other video formats • Max 2GB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 border rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <FileVideo className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-green-900">{uploadedVideo.name}</p>
                            <p className="text-sm text-green-700">{formatFileSize(uploadedVideo.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeUploadedVideo}
                          className="text-green-700 hover:text-green-900"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="rounded-xl overflow-hidden bg-black shadow-lg">
                        <video
                          src={uploadedVideo.url}
                          controls
                          className="w-full max-h-80 object-contain"
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="link" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="video-url" className="text-base font-medium">
                        Video URL
                      </Label>
                      <Input
                        id="video-url"
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=... or any video URL"
                        value={videoLink.url}
                        onChange={(e) => setVideoLink({ ...videoLink, url: e.target.value })}
                        className="h-12 text-base"
                      />
                      {videoLink.url && !isValidUrl(videoLink.url) && (
                        <p className="text-sm text-destructive">Please enter a valid URL</p>
                      )}
                    </div>

                    {videoLink.url && isValidUrl(videoLink.url) && (
                      <div className="p-6 border rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <Link className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-semibold text-blue-900">Video Link Preview</span>
                        </div>
                        {videoLink.url && (
                          <img
                            src={`https://img.youtube.com/vi/${extractYouTubeId(videoLink.url)}/hqdefault.jpg`}
                            alt="Video thumbnail"
                            className="rounded-xl w-full max-h-80 object-contain"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="results">
                  <ResultsTab videos={processedVideos} />
                </TabsContent>
              </Tabs>

              {activeTab !== "results" && (
                <div className="space-y-6 mt-8">
                  {/* Processing Options */}
                  <div className="space-y-6 p-6 border rounded-xl bg-gradient-to-r from-gray-50 to-gray-100">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">⚙</span>
                      </div>
                      Processing Options
                    </h3>

                    {/* Service Type Selection */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Service Type</Label>
                        <Select
                          value={processingType}
                          onValueChange={(value: "generate_shorts" | "edit_short") => setProcessingType(value)}
                        >
                          <SelectTrigger className="h-12 cursor-pointer bg-white/80">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem className="cursor-pointer" value="generate_shorts">Generate shorts from video</SelectItem>
                            <SelectItem className="cursor-pointer" value="edit_short">Edit this short</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-medium">Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="h-12 cursor-pointer bg-white/80">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem className="cursor-pointer" value="auto">Auto Detect</SelectItem>
                            <SelectItem className="cursor-pointer" value="en">English</SelectItem>
                            <SelectItem className="cursor-pointer" value="id">Bahasa Indonesia</SelectItem>
                            <SelectItem className="cursor-pointer" value="es">Spanish</SelectItem>
                            <SelectItem className="cursor-pointer" value="fr">French</SelectItem>
                            <SelectItem className="cursor-pointer" value="de">German</SelectItem>
                            <SelectItem className="cursor-pointer" value="it">Italian</SelectItem>
                            <SelectItem className="cursor-pointer" value="pt">Portuguese</SelectItem>
                            <SelectItem className="cursor-pointer" value="ru">Russian</SelectItem>
                            <SelectItem className="cursor-pointer" value="ja">Japanese</SelectItem>
                            <SelectItem className="cursor-pointer" value="ko">Korean</SelectItem>
                            <SelectItem className="cursor-pointer" value="zh">Chinese</SelectItem>
                            <SelectItem className="cursor-pointer" value="ar">Arabic</SelectItem>
                            <SelectItem className="cursor-pointer" value="hi">Hindi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Shorts Configuration (only for generate_shorts) */}
                    {processingType === "generate_shorts" && (
                      <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
                        <h4 className="font-medium text-blue-900 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Shorts Generation Settings
                        </h4>

                        {/* Pricing Info Table - Make it clickable with better mobile layout */}
                        <div className="bg-white/80 rounded-lg p-3 sm:p-4 border border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">💰</span>
                            </div>
                            <h5 className="font-medium text-gray-900 text-sm sm:text-base">
                              Bulk Pricing - Tap to Select
                            </h5>
                          </div>
                          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-3 text-sm">
                            <button
                              onClick={() => setShortsConfig({ ...shortsConfig, clipCount: 1 })}
                              className={cn(
                                "p-3 sm:p-3 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 hover:shadow-md active:scale-95",
                                shortsConfig.clipCount === 1
                                  ? "border-primary bg-primary/10 shadow-md"
                                  : "border-gray-200 bg-gray-50 hover:border-primary/50",
                              )}
                            >
                              <div className="flex sm:flex-col items-center sm:items-center justify-between sm:justify-center text-center">
                                <div className="flex flex-col sm:block">
                                  <p className="font-semibold text-base sm:text-lg">1 Clip</p>
                                  <p className="text-primary font-bold text-lg sm:text-base">Rp50K</p>
                                </div>
                              </div>
                            </button>
                            <button
                              onClick={() => setShortsConfig({ ...shortsConfig, clipCount: 5 })}
                              className={cn(
                                "p-3 sm:p-3 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 hover:shadow-md active:scale-95",
                                shortsConfig.clipCount >= 5 && shortsConfig.clipCount < 10
                                  ? "border-primary bg-primary/10 shadow-md"
                                  : "border-gray-200 bg-gray-50 hover:border-primary/50",
                              )}
                            >
                              <div className="flex sm:flex-col items-center sm:items-center justify-between sm:justify-center text-center">
                                <div className="flex flex-col sm:block">
                                  <p className="font-semibold text-base sm:text-lg">5+ Clips</p>
                                  <p className="text-primary font-bold text-lg sm:text-base">Rp180K</p>
                                </div>
                                <div className="flex flex-col items-end sm:items-center">
                                  <div className="mt-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                    Save 28%
                                  </div>
                                </div>
                              </div>
                            </button>
                            <button
                              onClick={() => setShortsConfig({ ...shortsConfig, clipCount: 10 })}
                              className={cn(
                                "p-3 sm:p-3 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 hover:shadow-md active:scale-95",
                                shortsConfig.clipCount >= 10
                                  ? "border-primary bg-primary/10 shadow-md"
                                  : "border-gray-200 bg-gray-50 hover:border-primary/50",
                              )}
                            >
                              <div className="flex sm:flex-col items-center sm:items-center justify-between sm:justify-center text-center">
                                <div className="flex flex-col sm:block">
                                  <p className="font-semibold text-base sm:text-lg">10+ Clips</p>
                                  <p className="text-primary font-bold text-lg sm:text-base">Rp340K</p>
                                </div>
                                <div className="flex flex-col items-end sm:items-center">
                                  <div className="mt-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                    Save 32%
                                  </div>
                                </div>
                              </div>
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-3 text-center">
                            💡 Tap any pricing tier to automatically set the number of clips
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="clip-count" className="text-sm font-medium">
                              Number of Clips
                            </Label>
                            <Input
                              id="clip-count"
                              type="number"
                              min="1"
                              max="10"
                              value={shortsConfig.clipCount}
                              onChange={(e) =>
                                setShortsConfig({ ...shortsConfig, clipCount: Number.parseInt(e.target.value) || 1 })
                              }
                              className="h-10 text-base"
                            />
                            <p className="text-xs text-muted-foreground">
                              Current: Rp{calculateShortsPrice(shortsConfig.clipCount).perClip}K per clip
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="min-duration" className="text-sm font-medium">
                              Min Duration (seconds)
                            </Label>
                            <Input
                              id="min-duration"
                              type="number"
                              min="5"
                              max="300"
                              value={shortsConfig.minDuration}
                              onChange={(e) =>
                                setShortsConfig({ ...shortsConfig, minDuration: Number.parseInt(e.target.value) || 5 })
                              }
                              className="h-10 text-base"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="max-duration" className="text-sm font-medium">
                              Max Duration (seconds)
                            </Label>
                            <Input
                              id="max-duration"
                              type="number"
                              min="10"
                              max="600"
                              value={shortsConfig.maxDuration}
                              onChange={(e) =>
                                setShortsConfig({ ...shortsConfig, maxDuration: Number.parseInt(e.target.value) || 10 })
                              }
                              className="h-10 text-base"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Processing Parameters */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                        Processing Parameters
                      </h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <label
                          htmlFor="caption"
                          className="flex hover:border-primary/50 items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Checkbox
                            id="caption"
                            checked={parameters.caption}
                            onCheckedChange={(checked) =>
                              setParameters({ ...parameters, caption: !!checked })
                            }
                          />
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Add Captions</span>
                            <p className="text-xs text-muted-foreground">Generate automatic subtitles</p>
                          </div>
                        </label>
                        
                        <label
                          htmlFor="reframe"
                          className="flex hover:border-primary/50 items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Checkbox
                            id="reframe"
                            checked={parameters.reframe}
                            onCheckedChange={(checked) =>
                              setParameters({ ...parameters, reframe: !!checked })
                            }
                          />
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Smart Reframe</span>
                            <p className="text-xs text-muted-foreground">Auto-crop for mobile format</p>
                          </div>
                        </label>
                        
                        <label
                          htmlFor="emoji"
                          className="flex hover:border-primary/50 items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Checkbox
                            id="emoji"
                            checked={parameters.emoji}
                            onCheckedChange={(checked) =>
                              setParameters({ ...parameters, emoji: !!checked })
                            }
                          />
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Add Emojis</span>
                            <p className="text-xs text-muted-foreground">Enhance with relevant emojis</p>
                          </div>
                        </label>

                        <label
                          htmlFor="intro_title"
                          className="flex hover:border-primary/50 items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Checkbox
                            id="intro_title"
                            checked={parameters.intro_title}
                            onCheckedChange={(checked) =>
                              setParameters({ ...parameters, intro_title: !!checked })
                            }
                          />
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Intro Title</span>
                            <p className="text-xs text-muted-foreground">Add engaging title overlay</p>
                          </div>
                        </label>

                        <label
                          htmlFor="remove_silences"
                          className="flex hover:border-primary/50 items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Checkbox
                            id="remove_silences"
                            checked={parameters.remove_silences}
                            onCheckedChange={(checked) =>
                              setParameters({ ...parameters, remove_silences: !!checked })
                            }
                          />
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Remove Silences</span>
                            <p className="text-xs text-muted-foreground">Cut out quiet moments</p>
                          </div>
                        </label>

                      </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {processingType === "generate_shorts" ? "Shorts Generation" : "Video Editing"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {processingType === "generate_shorts"
                              ? `${shortsConfig.clipCount} clips • ${Object.values(parameters).filter(Boolean).length} features`
                              : `${Object.values(parameters).filter(Boolean).length} features selected`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            Rp
                            {processingType === "generate_shorts"
                              ? calculateShortsPrice(shortsConfig.clipCount).total
                              : "9.99"}K
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {processingType === "generate_shorts"
                              ? `Rp${calculateShortsPrice(shortsConfig.clipCount).perClip}K per clip`
                              : "per video"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons - Mobile Optimized */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      size="lg"
                      className={`w-full sm:flex-1 h-12 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 
                        ${canSubmit ? "cursor-pointer" : "cursor-not-allowed"}`}
                    >
                      <span className="block sm:inline">
                        {processingType === "generate_shorts" ? "Generate Shorts" : "Process Video"}
                      </span>
                      <span className="block sm:inline sm:ml-1">
                        - Rp
                        {processingType === "generate_shorts"
                          ? calculateShortsPrice(shortsConfig.clipCount).total
                          : "9.99"}K
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="cursor-pointer w-full sm:w-auto h-12 sm:h-12 text-sm sm:text-base bg-transparent"
                      onClick={() => {
                        if (activeTab === "upload") {
                          removeUploadedVideo()
                        } else {
                          setVideoLink({ url: "", title: "", description: "" })
                        }
                        setParameters({
                          caption: false,
                          reframe: false,
                          emoji: false,
                          intro_title: false,
                          remove_silences: false,
                        })
                        setShortsConfig({
                          clipCount: 3,
                          minDuration: 15,
                          maxDuration: 60,
                        })
                      }}
                    >
                      Reset All
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Contact Section */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4">Need Help?</h3>
            <p className="text-xl text-gray-300 mb-8">Get in touch with our team for support or custom solutions</p>

            <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-4 text-blue-400" />
                  <h4 className="font-semibold text-gray-300 mb-2">Email Support</h4>
                  <p className="text-gray-300 text-sm mb-4">Get help via email</p>
                  <Button variant="outline" className="cursor-pointer border-white/30 text-white hover:bg-white/10 bg-transparent">
                    isalomohendriyan@gmail.com
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-gray-400">
                © 2025 CutZy. All rights reserved. | Lightning-fast short video generator powered by AI
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} /> */}

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="p-0 bg-transparent overflow-hidden border-0 shadow-none w-auto">
          <SignIn />
          <DialogClose asChild>
            <button
              className="cursor-pointer absolute top-5 right-5 text-gray-300 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={
          processingType === "generate_shorts"
            ? calculateShortsPrice(shortsConfig.clipCount).total
            : 9.99
        }
        processingType={processingType}
      />
    </div>
  )
}

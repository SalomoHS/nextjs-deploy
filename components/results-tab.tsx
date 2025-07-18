"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Play, Share, Calendar, FileVideo, ExternalLink } from "lucide-react"

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

interface ResultsTabProps {
  videos: ProcessedVideo[]
}

export function ResultsTab({ videos }: ResultsTabProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <FileVideo className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No processed videos yet</h3>
        <p className="text-muted-foreground">Upload a video or provide a link to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Processed Videos</h2>
        <Badge variant="secondary">
          {videos.length} video{videos.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="grid gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex">
              <div className="w-32 h-24 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <Play className="h-8 w-8 text-primary" />
              </div>

              <div className="flex-1">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{video.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {video.processedAt}
                        </span>
                        <Badge variant={video.type === "upload" ? "default" : "secondary"}>
                          {video.type === "upload" ? "Uploaded" : "Linked"}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{video.duration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Format</p>
                      <p className="font-medium">{video.format}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Original Size</p>
                      <p className="font-medium">{video.originalSize}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Processed Size</p>
                      <p className="font-medium text-green-600">{video.processedSize}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
                      <Share className="h-4 w-4" />
                      Share
                    </Button>
                    {video.type === "link" && video.originalUrl && (
                      <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
                        <ExternalLink className="h-4 w-4" />
                        Original
                      </Button>
                    )}
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export interface AnalysisCard {
  title: string
  score: number
  grade: string
  color: string
  description: string
  tags: string[]
  recommendation: string
}

export interface DashboardMetrics {
  projectedViews: string
  shareProbability: string
  bestPostTime: string
  idealDuration: string
  targetAudience: string
  contentRank: string
  projectedViewsSub: string
  shareProbSub: string
  bestPostTimeSub: string
  idealDurationSub: string
  targetAudienceSub: string
  contentRankSub: string
}

export interface RecentAnalysis {
  reel_url: string
  overall_score: number
  shortcode: string
  created_at: string
}

export interface SubMetric {
  label: string
  value: number
  color: string
}

export interface InsightItem {
  label: string
  description: string
  impact: 'high' | 'medium' | 'low'
  icon: string
}

export interface HashtagSuggestion {
  tag: string
  reach: 'high' | 'medium' | 'low'
  competition: 'high' | 'medium' | 'low'
  relevance: number
}

export interface PostingTimeSlot {
  day: string
  time: string
  score: number
  reason: string
}

export interface AudienceMatch {
  primaryAgeRange: string
  secondaryAgeRange: string
  genderSplit: { male: number; female: number }
  topInterests: string[]
  topLocations: string[]
  matchScore: number
}

export interface WatchTimeEstimate {
  avgWatchTime: string
  completionRate: number
  estimatedReplays: number
  retentionCurve: { time: string; retention: number }[]
}

export interface EngagementPrediction {
  estimatedLikes: string
  estimatedComments: string
  estimatedShares: string
  estimatedSaves: string
  engagementRate: number
  viralityMultiplier: number
}

export interface ThumbnailSuggestion {
  type: 'cover-frame' | 'text-overlay' | 'face-closeup' | 'before-after' | 'curiosity-gap'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
}

export interface ConfidenceMetric {
  level: 'high' | 'medium' | 'low'
  score: number
  reasoning: string
}

export interface EnhancedReport {
  hookStrength: number
  viewerRetentionPrediction: number
  engagementPrediction: EngagementPrediction
  watchTimeEstimate: WatchTimeEstimate
  captionQuality: number
  hashtagSuggestions: HashtagSuggestion[]
  postingTimeSuggestions: PostingTimeSlot[]
  audienceMatch: AudienceMatch
  weakPoints: InsightItem[]
  strongPoints: InsightItem[]
  improvementSuggestions: InsightItem[]
  thumbnailSuggestions: ThumbnailSuggestion[]
  contentCategory: string
  confidence: ConfidenceMetric
  viralProbability: number
  finalVerdict: string
  verdictScore: number
}

export interface AnalysisResult {
  overallScore: number
  hookStrength: number
  audioSync: number
  visualQuality: number
  captionPower: number
  trendAlignment: number
  analysisCards: AnalysisCard[]
  dashboardMetrics: DashboardMetrics
  recentAnalyses: RecentAnalysis[]
  enhancedReport: EnhancedReport
}

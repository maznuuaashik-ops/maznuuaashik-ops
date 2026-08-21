import { motion } from 'framer-motion'

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ''}`} />
}

export default function SkeletonLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="py-16 sm:py-20 px-4 max-w-5xl mx-auto"
    >
      {/* Viral Score skeleton */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 mb-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center gap-4">
            <SkeletonBlock className="w-44 h-44 rounded-full" />
            <SkeletonBlock className="w-32 h-8 rounded-full" />
          </div>
          <div className="flex-1 w-full max-w-md space-y-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <SkeletonBlock className="w-24 h-4 rounded" />
                  <SkeletonBlock className="w-10 h-4 rounded" />
                </div>
                <SkeletonBlock className="w-full h-2 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="w-10 h-10 rounded-xl" />
                <div className="space-y-2">
                  <SkeletonBlock className="w-24 h-4 rounded" />
                  <SkeletonBlock className="w-16 h-3 rounded" />
                </div>
              </div>
              <SkeletonBlock className="w-10 h-10 rounded-xl" />
            </div>
            <SkeletonBlock className="w-full h-1.5 rounded-full mb-4" />
            <SkeletonBlock className="w-full h-3 rounded mb-2" />
            <SkeletonBlock className="w-4/5 h-3 rounded mb-4" />
            <div className="flex gap-2 mb-4">
              <SkeletonBlock className="w-16 h-6 rounded-full" />
              <SkeletonBlock className="w-20 h-6 rounded-full" />
              <SkeletonBlock className="w-14 h-6 rounded-full" />
            </div>
            <SkeletonBlock className="w-full h-16 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Dashboard skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <SkeletonBlock className="w-8 h-8 rounded-lg" />
              <SkeletonBlock className="w-20 h-3 rounded hidden sm:block" />
            </div>
            <SkeletonBlock className="w-24 h-7 rounded mb-1" />
            <SkeletonBlock className="w-16 h-3 rounded" />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

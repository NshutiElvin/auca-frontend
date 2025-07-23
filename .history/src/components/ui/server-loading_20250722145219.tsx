import React, { useEffect } from 'react'
import { Loader2, Server, CheckCircle2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '../../components/ui/alert'
import useToast from '../../hooks/useToast'

function ServerLoader() {
  const { serverLoadingMessage, setServerLoadingMessage } = useToast()

  useEffect(() => {
    if (serverLoadingMessage) {
      const timer = setTimeout(() => {
        if (setServerLoadingMessage) {
          setServerLoadingMessage({message:'mmmm', isServerLoading:false})
        }
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [serverLoadingMessage, setServerLoadingMessage])

  if (!serverLoadingMessage) return null

  const getIcon = () => {
    if (serverLoadingMessage.message.toLowerCase().includes('error') || serverLoadingMessage.message.toLowerCase().includes('failed')) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    if (serverLoadingMessage.message.toLowerCase().includes('success') || serverLoadingMessage.message.toLowerCase().includes('complete')) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
    return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
  }

  const getBorderColor = () => {
    if (serverLoadingMessage.message.toLowerCase().includes('error') || serverLoadingMessage.message.toLowerCase().includes('failed')) {
      return 'border-red-200'
    }
    if (serverLoadingMessage.message.toLowerCase().includes('success') || serverLoadingMessage.message.toLowerCase().includes('complete')) {
      return 'border-green-200'
    }
    return 'border-blue-200'
  }

  const getBackgroundColor = () => {
    if (serverLoadingMessage.message.toLowerCase().includes('error') || serverLoadingMessage.message.toLowerCase().includes('failed')) {
      return 'bg-red-50'
    }
    if (serverLoadingMessage.message.toLowerCase().includes('success') || serverLoadingMessage.message.toLowerCase().includes('complete')) {
      return 'bg-green-50'
    }
    return 'bg-blue-50'
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Mobile: Center positioning */}
      <div className="flex items-center justify-center min-h-screen px-4 md:hidden">
        <div className="pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-300">
          <Alert className={`max-w-sm shadow-lg border-2 backdrop-blur-sm ${getBorderColor()} ${getBackgroundColor()}`}>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {getIcon()}
              </div>
              <div className="flex-1">
                <AlertDescription className="text-sm font-medium text-gray-700">
                  {serverLoadingMessage.message}
                </AlertDescription>
              </div>
            </div>
            <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" 
                   style={{ width: '100%', animation: 'progress 5s linear forwards' }} />
            </div>
          </Alert>
        </div>
      </div>

      {/* Desktop: Top-right positioning */}
      <div className="hidden md:block">
        <div className="fixed top-4 right-4 pointer-events-auto animate-in slide-in-from-top-2 fade-in-0 duration-300">
          <Alert className={`w-80 shadow-xl border-2 backdrop-blur-sm ${getBorderColor()} ${getBackgroundColor()}`}>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Server className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {getIcon()}
                  <AlertDescription className="text-sm font-medium text-gray-700">
                    {serverLoadingMessage.message}
                  </AlertDescription>
                </div>
              </div>
            </div>
            <div className="mt-3 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                   style={{ 
                     width: '0%', 
                     animation: 'progress 5s linear forwards'
                   }} />
            </div>
          </Alert>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default ServerLoader
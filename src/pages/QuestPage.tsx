import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Timer } from 'lucide-react'
import { QuestRunner } from '@/components/QuestRunner'
import { useGameStore } from '@/store/useGameStore'
import { Module, Quest } from '@/types'
import { moduleData as contentModuleData } from '@/content'

export const QuestPage: React.FC = () => {
  const { moduleId, questId } = useParams<{ moduleId: string; questId: string }>()
  const navigate = useNavigate()
  const { startQuest } = useGameStore()
  const [quest, setQuest] = useState<Quest | null>(null)
  const [moduleData, setModuleData] = useState<Module | null>(null)

  useEffect(() => {
    if (moduleId) {
      console.log('Quest page loading module with ID:', moduleId)

      // Use unified module data from content management
      const module = contentModuleData[moduleId as keyof typeof contentModuleData]

      if (!module) {
        console.error('Unknown module ID:', moduleId)
        navigate('/modules')
        return
      }

      console.log('Quest page module loaded:', module)
      setModuleData(module)
    }
  }, [moduleId, navigate])

  useEffect(() => {
    if (moduleData && questId) {
      const foundQuest = moduleData.quests.find(q => q.id === questId)
      if (foundQuest) {
        setQuest(foundQuest)
        // Start the quest in GameStore
        startQuest(questId)
      } else {
        navigate(`/module/${moduleId}`)
      }
    }
  }, [moduleData, questId, moduleId, navigate, startQuest])

  const handleBack = () => {
    navigate(`/module/${moduleId}`)
  }

  if (!quest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-lg">Loading quest...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="safe-top bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Module</span>
            </button>

            <div className="flex items-center gap-2 text-gray-600">
              <Timer className="w-5 h-5" />
              <span>{moduleData?.durationMinutes || 10} min</span>
            </div>
          </div>
        </div>
      </header>

      {/* Quest Content */}
      <main className="py-8">
        <QuestRunner quest={quest} />
      </main>
    </div>
  )
}
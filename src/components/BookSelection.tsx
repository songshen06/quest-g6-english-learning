import React, { useState } from 'react'
import { BookOpen, Lock, Star, ChevronRight, Clock, Target } from 'lucide-react'
import { useBookStore, canUnlockBook, getRecommendedBooks } from '@/store/useBookStore'
import { useUserStore } from '@/store/useUserStore'
import { Book } from '@/types/books'

interface BookSelectionProps {
  onClose?: () => void
  showOnlyAvailable?: boolean
}

export const BookSelection: React.FC<BookSelectionProps> = ({
  onClose,
  showOnlyAvailable = false
}) => {
  const {
    currentBookId,
    allBooks,
    activeBooks,
    setCurrentBook,
    isBookUnlocked,
    getUserBookProgress,
    getBookProgress,
    unlockBook
  } = useBookStore()

  const { currentUser } = useUserStore()
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)

  // 获取用户当前年级（基于当前书籍或默认6年级）
  const currentGrade = selectedGrade || (currentBookId ?
    parseInt(currentBookId.split('-')[0].replace('grade', '')) : 6)

  // 过滤书籍
  const filteredBooks = showOnlyAvailable ? activeBooks : allBooks
  const displayBooks = selectedGrade
    ? filteredBooks.filter(book => book.grade === currentGrade)
    : filteredBooks

  
  // 获取推荐书籍
  const recommendedBooks = getRecommendedBooks(currentGrade, currentBookId || undefined)

  const handleSelectBook = (book: Book) => {
    console.log('📚 Book selected:', book.title)
    setCurrentBook(book.id)
    onClose?.()
  }

  const getBookStatus = (book: Book) => {
    // 所有书籍都已解锁，直接返回unlocked
    return 'unlocked'
  }

  const BookCard: React.FC<{ book: Book, isRecommended?: boolean }> = ({ book, isRecommended }) => {
    const status = getBookStatus(book)
    const progress = getUserBookProgress(book.id)
    const bookProgress = getBookProgress(book.id)
    const isCurrent = currentBookId === book.id

    return (
      <div
        role="button"
        tabIndex={0}
        className={`
          relative bg-white rounded-xl p-4 shadow-sm border-2 transition-all cursor-pointer
          ${isCurrent ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}
          ${status === 'locked' ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-md'}
        `}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleSelectBook(book)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleSelectBook(book)
          }
        }}
        style={{ pointerEvents: 'auto' }}
      >
        {/* 推荐标签 */}
        {isRecommended && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            推荐
          </div>
        )}

        {/* 当前标签 */}
        {isCurrent && (
          <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            当前
          </div>
        )}

        {/* 移除锁定状态显示 - 所有书籍都已解锁 */}

        <div className="flex gap-4">
          {/* 书籍封面 */}
          <div className="w-16 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-8 h-8 text-white" />
          </div>

          {/* 书籍信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 truncate">{book.title}</h3>
                <p className="text-sm text-gray-600 truncate">{book.subtitle}</p>
              </div>
              <span className={`
                text-xs px-2 py-1 rounded-full
                ${book.difficulty === 'beginner' ? 'bg-green-100 text-green-700' : ''}
                ${book.difficulty === 'elementary' ? 'bg-blue-100 text-blue-700' : ''}
                ${book.difficulty === 'intermediate' ? 'bg-purple-100 text-purple-700' : ''}
              `}>
                {book.difficulty === 'beginner' ? '初级' :
                 book.difficulty === 'elementary' ? '中级' : '高级'}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{book.description}</p>

            {/* 进度条 */}
            {progress && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>进度</span>
                  <span>{bookProgress.progress}% ({bookProgress.completedModules}/{bookProgress.totalModules})</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${bookProgress.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* 元信息 */}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>{book.totalModules} 单元</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{book.chapters.reduce((sum, ch) => sum + ch.estimatedMinutes, 0)}分钟</span>
              </div>
            </div>
          </div>
        </div>

        {/* 移除解锁提示 - 所有书籍都可以直接选择 */}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 年级筛选 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">选择年级</h3>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map(grade => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(selectedGrade === grade ? null : grade)}
              className={`
                py-2 px-3 rounded-lg text-sm font-medium transition-colors
                ${selectedGrade === grade
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              {grade}年级
            </button>
          ))}
        </div>
      </div>

      {/* 推荐书籍 */}
      {recommendedBooks.length > 0 && !selectedGrade && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            推荐书籍
          </h3>
          <div className="space-y-3">
            {recommendedBooks.map(book => (
              <BookCard key={book.id} book={book} isRecommended />
            ))}
          </div>
        </div>
      )}

      {/* 所有书籍 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          {selectedGrade ? `${selectedGrade}年级书籍` : '所有书籍'}
        </h3>
        <div className="space-y-3">
          {displayBooks.length > 0 ? (
            displayBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>该年级暂无可用书籍</p>
            </div>
          )}
        </div>
      </div>

      {/* 帮助信息 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">学习指南</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 可以自由选择任何年级和书籍开始学习</li>
          <li>• 建议从适合自己水平的年级开始</li>
          <li>• 每个单元建议按顺序完成以获得最佳学习效果</li>
          <li>• 系统会自动跟踪每本书的学习进度</li>
          <li>• 可以随时切换不同的书籍进行学习</li>
        </ul>
      </div>
    </div>
  )
}
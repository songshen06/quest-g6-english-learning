import { Book } from '@/types/books'

export const booksData: Book[] = [
  {
    id: 'grade5-lower',
    title: '五年级下册',
    subtitle: 'English Adventure Grade 5B',
    grade: 5,
    semester: 'lower',
    cover: '/images/books/grade5-lower.jpg',
    description: '五年级下册英语学习内容，包含10个主题单元',
    totalModules: 10,
    difficulty: 'elementary',
    tags: ['小学中年级', '基础语法', '日常对话'],
    isActive: true,
    publishedAt: '2024-01-01',
    chapters: [
      {
        id: 'g5l-ch1',
        bookId: 'grade5-lower',
        number: 1,
        title: 'Unit 1: driver player 司机 演奏者',
        description: 'driver player 司机 演奏者',
        moduleIds: ['grade5-lower-mod-01'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch2',
        bookId: 'grade5-lower',
        number: 2,
        title: 'Unit 2: traditional food 传统食物',
        description: 'traditional food 传统食物',
        moduleIds: ['grade5-lower-mod-02'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch3',
        bookId: 'grade5-lower',
        number: 3,
        title: 'Unit 3: library borrow 图书馆 借阅',
        description: 'library borrow 图书馆 借阅',
        moduleIds: ['grade5-lower-mod-03'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch4',
        bookId: 'grade5-lower',
        number: 4,
        title: 'Unit 4: letters seasons 寄信 季节',
        description: 'letters seasons 寄信 季节',
        moduleIds: ['grade5-lower-mod-04'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch5',
        bookId: 'grade5-lower',
        number: 5,
        title: 'Unit 5: shopping carrying 购物 背负',
        description: 'shopping carrying 购物 背负',
        moduleIds: ['grade5-lower-mod-05'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch6',
        bookId: 'grade5-lower',
        number: 6,
        title: 'Unit 6: travel plans 出行计划',
        description: 'travel plans 出行计划',
        moduleIds: ['grade5-lower-mod-06'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch7',
        bookId: 'grade5-lower',
        number: 7,
        title: 'Unit 7: jobs time 职业 时间',
        description: 'jobs time 职业 时间',
        moduleIds: ['grade5-lower-mod-07'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch8',
        bookId: 'grade5-lower',
        number: 8,
        title: 'Unit 8: make a kite 做风筝',
        description: 'make a kite 做风筝',
        moduleIds: ['grade5-lower-mod-08'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch9',
        bookId: 'grade5-lower',
        number: 9,
        title: 'Unit 9: theatre history 剧院 历史',
        description: 'theatre history 剧院 历史',
        moduleIds: ['grade5-lower-mod-09'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch10',
        bookId: 'grade5-lower',
        number: 10,
        title: 'Unit 10: travel prep 行前准备',
        description: 'travel prep 行前准备',
        moduleIds: ['grade5-lower-mod-10'],
        estimatedMinutes: 25,
        isLocked: false
      }
    ]
  },
  {
    id: 'grade6-upper',
    title: '六年级上册',
    subtitle: 'English Adventure Grade 6A',
    grade: 6,
    semester: 'upper',
    cover: '/images/books/grade6-upper.jpg',
    description: '六年级上册英语学习内容，包含10个主题单元',
    totalModules: 10,
    difficulty: 'intermediate',
    tags: ['小学中年级', '基础语法', '日常对话'],
    isActive: true,
    publishedAt: '2024-01-01',
    chapters: [
      {
        id: 'g6u-ch1',
        bookId: 'grade6-upper',
        number: 1,
        title: 'Unit 1: how long',
        description: 'how long',
        moduleIds: ['grade6-upper-mod-01'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6u-ch2',
        bookId: 'grade6-upper',
        number: 2,
        title: 'Unit 2: chinatown tombs',
        description: 'chinatown tombs',
        moduleIds: ['grade6-upper-mod-02'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6u-ch3',
        bookId: 'grade6-upper',
        number: 3,
        title: 'Unit 3: stamps hobbies',
        description: 'stamps hobbies',
        moduleIds: ['grade6-upper-mod-03'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6u-ch4',
        bookId: 'grade6-upper',
        number: 4,
        title: 'Unit 4: festivals',
        description: 'festivals',
        moduleIds: ['grade6-upper-mod-04'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6u-ch5',
        bookId: 'grade6-upper',
        number: 5,
        title: 'Unit 5: pen friends',
        description: 'pen friends',
        moduleIds: ['grade6-upper-mod-05'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6u-ch6',
        bookId: 'grade6-upper',
        number: 6,
        title: 'Unit 6: school answers',
        description: 'school answers',
        moduleIds: ['grade6-upper-mod-06'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6u-ch7',
        bookId: 'grade6-upper',
        number: 7,
        title: 'Unit 7: animals',
        description: 'animals',
        moduleIds: ['grade6-upper-mod-07'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6u-ch8',
        bookId: 'grade6-upper',
        number: 8,
        title: 'Unit 8: habits tidy',
        description: 'habits tidy',
        moduleIds: ['grade6-upper-mod-08'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6u-ch9',
        bookId: 'grade6-upper',
        number: 9,
        title: 'Unit 9: peace un',
        description: 'peace un',
        moduleIds: ['grade6-upper-mod-09'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6u-ch10',
        bookId: 'grade6-upper',
        number: 10,
        title: 'Unit 10: travel safety',
        description: 'travel safety',
        moduleIds: ['grade6-upper-mod-10'],
        estimatedMinutes: 25,
        isLocked: false
      }
    ]
  },
  {
    id: 'grade6-lower',
    title: '六年级下册',
    subtitle: 'English Adventure Grade 6B',
    grade: 6,
    semester: 'lower',
    cover: '/images/books/grade6-lower.jpg',
    description: '六年级下册英语学习内容，包含2个主题单元',
    totalModules: 2,
    difficulty: 'intermediate',
    tags: ['小学中年级', '基础语法', '日常对话'],
    isActive: true,
    publishedAt: '2024-01-01',
    chapters: [
      {
        id: 'g6l-ch1',
        bookId: 'grade6-lower',
        number: 1,
        title: 'Unit 1: future plans',
        description: 'future plans',
        moduleIds: ['grade6-lower-mod-01'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6l-ch2',
        bookId: 'grade6-lower',
        number: 2,
        title: 'Unit 2: travel dreams',
        description: 'travel dreams',
        moduleIds: ['grade6-lower-mod-02'],
        estimatedMinutes: 25,
        isLocked: false
      }
    ]
  }
]

export const getActiveBooks = () => {
  return booksData.filter(book => book.isActive)
}

export const getNextRecommendedBook = (currentBookId: string) => {
  const currentBook = booksData.find(book => book.id === currentBookId)
  if (!currentBook) return null

  // 推荐逻辑：同年级下册或下一年级上册
  if (currentBook.semester === 'upper') {
    const lowerBook = booksData.find(book =>
      book.grade === currentBook.grade && book.semester === 'lower'
    )
    if (lowerBook) return lowerBook
  }

  const nextGradeBook = booksData.find(book =>
    book.grade === currentBook.grade + 1 && book.semester === 'upper'
  )

  return nextGradeBook || null
}

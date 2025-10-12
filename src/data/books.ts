import { Book } from '@/types/books'

export const booksData: Book[] = [
  {
    id: 'grade4-upper',
    title: '四年级上册',
    subtitle: 'English Adventure Grade 4A',
    grade: 4,
    semester: 'upper',
    cover: '/images/books/grade4-upper.jpg',
    description: '四年级上册英语学习内容，包含10个主题单元',
    totalModules: 10,
    difficulty: 'elementary',
    tags: ['小学中年级', '基础语法', '日常对话'],
    isActive: true,
    publishedAt: '2024-01-01',
    chapters: [
      {
        id: 'g4u-ch1',
        bookId: 'grade4-upper',
        number: 1,
        title: 'Unit 1: past events and friends',
        description: 'past events and friends',
        moduleIds: ['grade4-upper-mod-01'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4u-ch2',
        bookId: 'grade4-upper',
        number: 2,
        title: 'Unit 2: helping at home',
        description: 'helping at home',
        moduleIds: ['grade4-upper-mod-02'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4u-ch3',
        bookId: 'grade4-upper',
        number: 3,
        title: 'Unit 3: what i didnt do',
        description: 'what i didnt do',
        moduleIds: ['grade4-upper-mod-03'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4u-ch4',
        bookId: 'grade4-upper',
        number: 4,
        title: 'Unit 4: inventions',
        description: 'inventions',
        moduleIds: ['grade4-upper-mod-04'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4u-ch5',
        bookId: 'grade4-upper',
        number: 5,
        title: 'Unit 5: school trips',
        description: 'school trips',
        moduleIds: ['grade4-upper-mod-05'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4u-ch6',
        bookId: 'grade4-upper',
        number: 6,
        title: 'Unit 6: story time',
        description: 'story time',
        moduleIds: ['grade4-upper-mod-06'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4u-ch7',
        bookId: 'grade4-upper',
        number: 7,
        title: 'Unit 7: asking about the past',
        description: 'asking about the past',
        moduleIds: ['grade4-upper-mod-07'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4u-ch8',
        bookId: 'grade4-upper',
        number: 8,
        title: 'Unit 8: past activities',
        description: 'past activities',
        moduleIds: ['grade4-upper-mod-08'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4u-ch9',
        bookId: 'grade4-upper',
        number: 9,
        title: 'Unit 9: accidents',
        description: 'accidents',
        moduleIds: ['grade4-upper-mod-09'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4u-ch10',
        bookId: 'grade4-upper',
        number: 10,
        title: 'Unit 10: healthy habits',
        description: 'healthy habits',
        moduleIds: ['grade4-upper-mod-10'],
        estimatedMinutes: 25,
        isLocked: false
      }
    ]
  },
  {
    id: 'grade4-lower',
    title: '四年级下册',
    subtitle: 'English Adventure Grade 4B',
    grade: 4,
    semester: 'lower',
    cover: '/images/books/grade4-lower.jpg',
    description: '四年级下册英语学习内容，包含10个主题单元',
    totalModules: 10,
    difficulty: 'elementary',
    tags: ['小学中年级', '基础语法', '日常对话'],
    isActive: true,
    publishedAt: '2024-01-01',
    chapters: [
      {
        id: 'g4l-ch1',
        bookId: 'grade4-lower',
        number: 1,
        title: 'Unit 1: rules and warnings',
        description: 'rules and warnings',
        moduleIds: ['grade4-lower-mod-01'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4l-ch2',
        bookId: 'grade4-lower',
        number: 2,
        title: 'Unit 2: shopping and prices',
        description: 'shopping and prices',
        moduleIds: ['grade4-lower-mod-02'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4l-ch3',
        bookId: 'grade4-lower',
        number: 3,
        title: 'Unit 3: storytelling',
        description: 'storytelling',
        moduleIds: ['grade4-lower-mod-03'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4l-ch4',
        bookId: 'grade4-lower',
        number: 4,
        title: 'Unit 4: music and feelings',
        description: 'music and feelings',
        moduleIds: ['grade4-lower-mod-04'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4l-ch5',
        bookId: 'grade4-lower',
        number: 5,
        title: 'Unit 5: present activities',
        description: 'present activities',
        moduleIds: ['grade4-lower-mod-05'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4l-ch6',
        bookId: 'grade4-lower',
        number: 6,
        title: 'Unit 6: future plans suggestions',
        description: 'future plans suggestions',
        moduleIds: ['grade4-lower-mod-06'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4l-ch7',
        bookId: 'grade4-lower',
        number: 7,
        title: 'Unit 7: telling the time',
        description: 'telling the time',
        moduleIds: ['grade4-lower-mod-07'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4l-ch8',
        bookId: 'grade4-lower',
        number: 8,
        title: 'Unit 8: directions and locations',
        description: 'directions and locations',
        moduleIds: ['grade4-lower-mod-08'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4l-ch9',
        bookId: 'grade4-lower',
        number: 9,
        title: 'Unit 9: countries and animals',
        description: 'countries and animals',
        moduleIds: ['grade4-lower-mod-09'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g4l-ch10',
        bookId: 'grade4-lower',
        number: 10,
        title: 'Unit 10: holiday plans',
        description: 'holiday plans',
        moduleIds: ['grade4-lower-mod-10'],
        estimatedMinutes: 25,
        isLocked: false
      }
    ]
  },
  {
    id: 'grade5-upper',
    title: '五年级上册',
    subtitle: 'English Adventure Grade 5A',
    grade: 5,
    semester: 'upper',
    cover: '/images/books/grade5-upper.jpg',
    description: '五年级上册英语学习内容，包含10个主题单元',
    totalModules: 10,
    difficulty: 'elementary',
    tags: ['小学中年级', '基础语法', '日常对话'],
    isActive: true,
    publishedAt: '2024-01-01',
    chapters: [
      {
        id: 'g5u-ch1',
        bookId: 'grade5-upper',
        number: 1,
        title: 'Unit 1: changes around us',
        description: 'changes around us',
        moduleIds: ['grade5-upper-mod-01'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5u-ch2',
        bookId: 'grade5-upper',
        number: 2,
        title: 'Unit 2: shopping time',
        description: 'shopping time',
        moduleIds: ['grade5-upper-mod-02'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5u-ch3',
        bookId: 'grade5-upper',
        number: 3,
        title: 'Unit 3: festivals',
        description: 'festivals',
        moduleIds: ['grade5-upper-mod-03'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5u-ch4',
        bookId: 'grade5-upper',
        number: 4,
        title: 'Unit 4: future plans',
        description: 'future plans',
        moduleIds: ['grade5-upper-mod-04'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5u-ch5',
        bookId: 'grade5-upper',
        number: 5,
        title: 'Unit 5: its mine',
        description: 'its mine',
        moduleIds: ['grade5-upper-mod-05'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5u-ch6',
        bookId: 'grade5-upper',
        number: 6,
        title: 'Unit 6: abilities and sports',
        description: 'abilities and sports',
        moduleIds: ['grade5-upper-mod-06'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5u-ch7',
        bookId: 'grade5-upper',
        number: 7,
        title: 'Unit 7: helpful animals',
        description: 'helpful animals',
        moduleIds: ['grade5-upper-mod-07'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5u-ch8',
        bookId: 'grade5-upper',
        number: 8,
        title: 'Unit 8: school life',
        description: 'school life',
        moduleIds: ['grade5-upper-mod-08'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5u-ch9',
        bookId: 'grade5-upper',
        number: 9,
        title: 'Unit 9: feelings',
        description: 'feelings',
        moduleIds: ['grade5-upper-mod-09'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5u-ch10',
        bookId: 'grade5-upper',
        number: 10,
        title: 'Unit 10: rules and advice',
        description: 'rules and advice',
        moduleIds: ['grade5-upper-mod-10'],
        estimatedMinutes: 25,
        isLocked: false
      }
    ]
  },
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
        title: 'Unit 1: driver player',
        description: 'driver player',
        moduleIds: ['grade5-lower-mod-01'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch2',
        bookId: 'grade5-lower',
        number: 2,
        title: 'Unit 2: traditional food',
        description: 'traditional food',
        moduleIds: ['grade5-lower-mod-02'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch3',
        bookId: 'grade5-lower',
        number: 3,
        title: 'Unit 3: library borrow',
        description: 'library borrow',
        moduleIds: ['grade5-lower-mod-03'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch4',
        bookId: 'grade5-lower',
        number: 4,
        title: 'Unit 4: letters seasons',
        description: 'letters seasons',
        moduleIds: ['grade5-lower-mod-04'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch5',
        bookId: 'grade5-lower',
        number: 5,
        title: 'Unit 5: shopping carrying',
        description: 'shopping carrying',
        moduleIds: ['grade5-lower-mod-05'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch6',
        bookId: 'grade5-lower',
        number: 6,
        title: 'Unit 6: travel plans',
        description: 'travel plans',
        moduleIds: ['grade5-lower-mod-06'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch7',
        bookId: 'grade5-lower',
        number: 7,
        title: 'Unit 7: jobs time',
        description: 'jobs time',
        moduleIds: ['grade5-lower-mod-07'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch8',
        bookId: 'grade5-lower',
        number: 8,
        title: 'Unit 8: make a kite',
        description: 'make a kite',
        moduleIds: ['grade5-lower-mod-08'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch9',
        bookId: 'grade5-lower',
        number: 9,
        title: 'Unit 9: theatre history',
        description: 'theatre history',
        moduleIds: ['grade5-lower-mod-09'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g5l-ch10',
        bookId: 'grade5-lower',
        number: 10,
        title: 'Unit 10: travel prep',
        description: 'travel prep',
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

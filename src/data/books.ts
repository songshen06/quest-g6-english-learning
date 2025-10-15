import { Book } from '@/types/books'

export const booksData: Book[] = [
  {
    id: 'grade1-upper',
    title: '一年级上册',
    subtitle: 'English Adventure Grade 1A',
    grade: 1,
    semester: 'upper',
    cover: '/images/books/grade1-upper.jpg',
    description: '一年级上册英语学习内容，包含10个主题单元',
    totalModules: 10,
    difficulty: 'beginner',
    tags: ['小学低年级', '基础语法', '日常对话'],
    isActive: true,
    publishedAt: '2024-01-01',
    chapters: [
      {
        id: 'g1u-ch1',
        bookId: 'grade1-upper',
        number: 1,
        title: 'Unit 1: greetings',
        description: 'greetings',
        moduleIds: ['grade1-upper-mod-01'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1u-ch2',
        bookId: 'grade1-upper',
        number: 2,
        title: 'Unit 2: names and identity',
        description: 'names and identity',
        moduleIds: ['grade1-upper-mod-02'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1u-ch3',
        bookId: 'grade1-upper',
        number: 3,
        title: 'Unit 3: classroom commands',
        description: 'classroom commands',
        moduleIds: ['grade1-upper-mod-03'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1u-ch4',
        bookId: 'grade1-upper',
        number: 4,
        title: 'Unit 4: colors',
        description: 'colors',
        moduleIds: ['grade1-upper-mod-04'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1u-ch5',
        bookId: 'grade1-upper',
        number: 5,
        title: 'Unit 5: this and that',
        description: 'this and that',
        moduleIds: ['grade1-upper-mod-05'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1u-ch6',
        bookId: 'grade1-upper',
        number: 6,
        title: 'Unit 6: classroom objects',
        description: 'classroom objects',
        moduleIds: ['grade1-upper-mod-06'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1u-ch7',
        bookId: 'grade1-upper',
        number: 7,
        title: 'Unit 7: asking yes no questions',
        description: 'asking yes no questions',
        moduleIds: ['grade1-upper-mod-07'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1u-ch8',
        bookId: 'grade1-upper',
        number: 8,
        title: 'Unit 8: counting',
        description: 'counting',
        moduleIds: ['grade1-upper-mod-08'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1u-ch9',
        bookId: 'grade1-upper',
        number: 9,
        title: 'Unit 9: age and birthday',
        description: 'age and birthday',
        moduleIds: ['grade1-upper-mod-09'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1u-ch10',
        bookId: 'grade1-upper',
        number: 10,
        title: 'Unit 10: family',
        description: 'family',
        moduleIds: ['grade1-upper-mod-10'],
        estimatedMinutes: 25,
        isLocked: false
      }
    ]
  },
  {
    id: 'grade1-lower',
    title: '一年级下册',
    subtitle: 'English Adventure Grade 1B',
    grade: 1,
    semester: 'lower',
    cover: '/images/books/grade1-lower.jpg',
    description: '一年级下册英语学习内容，包含10个主题单元',
    totalModules: 10,
    difficulty: 'beginner',
    tags: ['小学低年级', '基础语法', '日常对话'],
    isActive: true,
    publishedAt: '2024-01-01',
    chapters: [
      {
        id: 'g1l-ch1',
        bookId: 'grade1-lower',
        number: 1,
        title: 'Unit 1: professions',
        description: 'professions',
        moduleIds: ['grade1-lower-mod-01'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1l-ch2',
        bookId: 'grade1-lower',
        number: 2,
        title: 'Unit 2: prepositions of place',
        description: 'prepositions of place',
        moduleIds: ['grade1-lower-mod-02'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1l-ch3',
        bookId: 'grade1-lower',
        number: 3,
        title: 'Unit 3: counting and locating',
        description: 'counting and locating',
        moduleIds: ['grade1-lower-mod-03'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1l-ch4',
        bookId: 'grade1-lower',
        number: 4,
        title: 'Unit 4: body parts',
        description: 'body parts',
        moduleIds: ['grade1-lower-mod-04'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1l-ch5',
        bookId: 'grade1-lower',
        number: 5,
        title: 'Unit 5: farm animals',
        description: 'farm animals',
        moduleIds: ['grade1-lower-mod-05'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1l-ch6',
        bookId: 'grade1-lower',
        number: 6,
        title: 'Unit 6: describing animals',
        description: 'describing animals',
        moduleIds: ['grade1-lower-mod-06'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1l-ch7',
        bookId: 'grade1-lower',
        number: 7,
        title: 'Unit 7: there is there are',
        description: 'there is there are',
        moduleIds: ['grade1-lower-mod-07'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1l-ch8',
        bookId: 'grade1-lower',
        number: 8,
        title: 'Unit 8: clothes',
        description: 'clothes',
        moduleIds: ['grade1-lower-mod-08'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1l-ch9',
        bookId: 'grade1-lower',
        number: 9,
        title: 'Unit 9: sports',
        description: 'sports',
        moduleIds: ['grade1-lower-mod-09'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g1l-ch10',
        bookId: 'grade1-lower',
        number: 10,
        title: 'Unit 10: lets play',
        description: 'lets play',
        moduleIds: ['grade1-lower-mod-10'],
        estimatedMinutes: 25,
        isLocked: false
      }
    ]
  },
  {
    id: 'grade2-upper',
    title: '二年级上册',
    subtitle: 'English Adventure Grade 2A',
    grade: 2,
    semester: 'upper',
    cover: '/images/books/grade2-upper.jpg',
    description: '二年级上册英语学习内容，包含10个主题单元',
    totalModules: 10,
    difficulty: 'beginner',
    tags: ['小学低年级', '基础语法', '日常对话'],
    isActive: true,
    publishedAt: '2024-01-01',
    chapters: [
      {
        id: 'g2u-ch1',
        bookId: 'grade2-upper',
        number: 1,
        title: 'Unit 1: likes and dislikes',
        description: 'likes and dislikes',
        moduleIds: ['grade2-upper-mod-01'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2u-ch2',
        bookId: 'grade2-upper',
        number: 2,
        title: 'Unit 2: food preferences',
        description: 'food preferences',
        moduleIds: ['grade2-upper-mod-02'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2u-ch3',
        bookId: 'grade2-upper',
        number: 3,
        title: 'Unit 3: do you like',
        description: 'do you like',
        moduleIds: ['grade2-upper-mod-03'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2u-ch4',
        bookId: 'grade2-upper',
        number: 4,
        title: 'Unit 4: he likes clothes',
        description: 'he likes clothes',
        moduleIds: ['grade2-upper-mod-04'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2u-ch5',
        bookId: 'grade2-upper',
        number: 5,
        title: 'Unit 5: daily routines',
        description: 'daily routines',
        moduleIds: ['grade2-upper-mod-05'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2u-ch6',
        bookId: 'grade2-upper',
        number: 6,
        title: 'Unit 6: weekend activities',
        description: 'weekend activities',
        moduleIds: ['grade2-upper-mod-06'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2u-ch7',
        bookId: 'grade2-upper',
        number: 7,
        title: 'Unit 7: transportation',
        description: 'transportation',
        moduleIds: ['grade2-upper-mod-07'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2u-ch8',
        bookId: 'grade2-upper',
        number: 8,
        title: 'Unit 8: weekend routines',
        description: 'weekend routines',
        moduleIds: ['grade2-upper-mod-08'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2u-ch9',
        bookId: 'grade2-upper',
        number: 9,
        title: 'Unit 9: seasons',
        description: 'seasons',
        moduleIds: ['grade2-upper-mod-09'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2u-ch10',
        bookId: 'grade2-upper',
        number: 10,
        title: 'Unit 10: holidays',
        description: 'holidays',
        moduleIds: ['grade2-upper-mod-10'],
        estimatedMinutes: 25,
        isLocked: false
      }
    ]
  },
  {
    id: 'grade2-lower',
    title: '二年级下册',
    subtitle: 'English Adventure Grade 2B',
    grade: 2,
    semester: 'lower',
    cover: '/images/books/grade2-lower.jpg',
    description: '二年级下册英语学习内容，包含10个主题单元',
    totalModules: 10,
    difficulty: 'beginner',
    tags: ['小学低年级', '基础语法', '日常对话'],
    isActive: true,
    publishedAt: '2024-01-01',
    chapters: [
      {
        id: 'g2l-ch1',
        bookId: 'grade2-lower',
        number: 1,
        title: 'Unit 1: weather and activities',
        description: 'weather and activities',
        moduleIds: ['grade2-lower-mod-01'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2l-ch2',
        bookId: 'grade2-lower',
        number: 2,
        title: 'Unit 2: describing actions',
        description: 'describing actions',
        moduleIds: ['grade2-lower-mod-02'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2l-ch3',
        bookId: 'grade2-lower',
        number: 3,
        title: 'Unit 3: negations and questions',
        description: 'negations and questions',
        moduleIds: ['grade2-lower-mod-03'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2l-ch4',
        bookId: 'grade2-lower',
        number: 4,
        title: 'Unit 4: whats he doing',
        description: 'whats he doing',
        moduleIds: ['grade2-lower-mod-04'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2l-ch5',
        bookId: 'grade2-lower',
        number: 5,
        title: 'Unit 5: playing games',
        description: 'playing games',
        moduleIds: ['grade2-lower-mod-05'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2l-ch6',
        bookId: 'grade2-lower',
        number: 6,
        title: 'Unit 6: usually and now',
        description: 'usually and now',
        moduleIds: ['grade2-lower-mod-06'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2l-ch7',
        bookId: 'grade2-lower',
        number: 7,
        title: 'Unit 7: childrens day',
        description: 'childrens day',
        moduleIds: ['grade2-lower-mod-07'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2l-ch8',
        bookId: 'grade2-lower',
        number: 8,
        title: 'Unit 8: movement and direction',
        description: 'movement and direction',
        moduleIds: ['grade2-lower-mod-08'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2l-ch9',
        bookId: 'grade2-lower',
        number: 9,
        title: 'Unit 9: giving directions',
        description: 'giving directions',
        moduleIds: ['grade2-lower-mod-09'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g2l-ch10',
        bookId: 'grade2-lower',
        number: 10,
        title: 'Unit 10: locations',
        description: 'locations',
        moduleIds: ['grade2-lower-mod-10'],
        estimatedMinutes: 25,
        isLocked: false
      }
    ]
  },
  {
    id: 'grade3-upper',
    title: '三年级上册',
    subtitle: 'English Adventure Grade 3A',
    grade: 3,
    semester: 'upper',
    cover: '/images/books/grade3-upper.jpg',
    description: '三年级上册英语学习内容，包含10个主题单元',
    totalModules: 10,
    difficulty: 'elementary',
    tags: ['小学中年级', '基础语法', '日常对话'],
    isActive: true,
    publishedAt: '2024-01-01',
    chapters: [
      {
        id: 'g3u-ch1',
        bookId: 'grade3-upper',
        number: 1,
        title: 'Unit 1: food and cutlery',
        description: 'food and cutlery',
        moduleIds: ['grade3-upper-mod-01'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3u-ch2',
        bookId: 'grade3-upper',
        number: 2,
        title: 'Unit 2: ongoing actions',
        description: 'ongoing actions',
        moduleIds: ['grade3-upper-mod-02'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3u-ch3',
        bookId: 'grade3-upper',
        number: 3,
        title: 'Unit 3: these and those',
        description: 'these and those',
        moduleIds: ['grade3-upper-mod-03'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3u-ch4',
        bookId: 'grade3-upper',
        number: 4,
        title: 'Unit 4: abilities',
        description: 'abilities',
        moduleIds: ['grade3-upper-mod-04'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3u-ch5',
        bookId: 'grade3-upper',
        number: 5,
        title: 'Unit 5: asking for permission',
        description: 'asking for permission',
        moduleIds: ['grade3-upper-mod-05'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3u-ch6',
        bookId: 'grade3-upper',
        number: 6,
        title: 'Unit 6: possessions',
        description: 'possessions',
        moduleIds: ['grade3-upper-mod-06'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3u-ch7',
        bookId: 'grade3-upper',
        number: 7,
        title: 'Unit 7: health problems',
        description: 'health problems',
        moduleIds: ['grade3-upper-mod-07'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3u-ch8',
        bookId: 'grade3-upper',
        number: 8,
        title: 'Unit 8: possessive s',
        description: 'possessive s',
        moduleIds: ['grade3-upper-mod-08'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3u-ch9',
        bookId: 'grade3-upper',
        number: 9,
        title: 'Unit 9: future activities',
        description: 'future activities',
        moduleIds: ['grade3-upper-mod-09'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3u-ch10',
        bookId: 'grade3-upper',
        number: 10,
        title: 'Unit 10: travel plans',
        description: 'travel plans',
        moduleIds: ['grade3-upper-mod-10'],
        estimatedMinutes: 25,
        isLocked: false
      }
    ]
  },
  {
    id: 'grade3-lower',
    title: '三年级下册',
    subtitle: 'English Adventure Grade 3B',
    grade: 3,
    semester: 'lower',
    cover: '/images/books/grade3-lower.jpg',
    description: '三年级下册英语学习内容，包含10个主题单元',
    totalModules: 10,
    difficulty: 'elementary',
    tags: ['小学中年级', '基础语法', '日常对话'],
    isActive: true,
    publishedAt: '2024-01-01',
    chapters: [
      {
        id: 'g3l-ch1',
        bookId: 'grade3-lower',
        number: 1,
        title: 'Unit 1: describing people',
        description: 'describing people',
        moduleIds: ['grade3-lower-mod-01'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3l-ch2',
        bookId: 'grade3-lower',
        number: 2,
        title: 'Unit 2: describing places',
        description: 'describing places',
        moduleIds: ['grade3-lower-mod-02'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3l-ch3',
        bookId: 'grade3-lower',
        number: 3,
        title: 'Unit 3: weekend plans',
        description: 'weekend plans',
        moduleIds: ['grade3-lower-mod-03'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3l-ch4',
        bookId: 'grade3-lower',
        number: 4,
        title: 'Unit 4: counting fruit',
        description: 'counting fruit',
        moduleIds: ['grade3-lower-mod-04'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3l-ch5',
        bookId: 'grade3-lower',
        number: 5,
        title: 'Unit 5: plans for the week',
        description: 'plans for the week',
        moduleIds: ['grade3-lower-mod-05'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3l-ch6',
        bookId: 'grade3-lower',
        number: 6,
        title: 'Unit 6: body parts',
        description: 'body parts',
        moduleIds: ['grade3-lower-mod-06'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3l-ch7',
        bookId: 'grade3-lower',
        number: 7,
        title: 'Unit 7: asking how many',
        description: 'asking how many',
        moduleIds: ['grade3-lower-mod-07'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3l-ch8',
        bookId: 'grade3-lower',
        number: 8,
        title: 'Unit 8: school reports',
        description: 'school reports',
        moduleIds: ['grade3-lower-mod-08'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3l-ch9',
        bookId: 'grade3-lower',
        number: 9,
        title: 'Unit 9: then and now',
        description: 'then and now',
        moduleIds: ['grade3-lower-mod-09'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g3l-ch10',
        bookId: 'grade3-lower',
        number: 10,
        title: 'Unit 10: asking about the past',
        description: 'asking about the past',
        moduleIds: ['grade3-lower-mod-10'],
        estimatedMinutes: 25,
        isLocked: false
      }
    ]
  },
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
    description: '六年级下册英语学习内容，包含10个主题单元',
    totalModules: 10,
    difficulty: 'intermediate',
    tags: ['小学中年级', '基础语法', '日常对话'],
    isActive: true,
    publishedAt: '2024-01-01',
    chapters: [
      {
        id: 'g6l-ch1',
        bookId: 'grade6-lower',
        number: 1,
        title: 'Unit 1: ordering food',
        description: 'ordering food',
        moduleIds: ['grade6-lower-mod-01'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6l-ch2',
        bookId: 'grade6-lower',
        number: 2,
        title: 'Unit 2: plans and weather',
        description: 'plans and weather',
        moduleIds: ['grade6-lower-mod-02'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6l-ch3',
        bookId: 'grade6-lower',
        number: 3,
        title: 'Unit 3: past events',
        description: 'past events',
        moduleIds: ['grade6-lower-mod-03'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6l-ch4',
        bookId: 'grade6-lower',
        number: 4,
        title: 'Unit 4: describing actions',
        description: 'describing actions',
        moduleIds: ['grade6-lower-mod-04'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6l-ch5',
        bookId: 'grade6-lower',
        number: 5,
        title: 'Unit 5: simultaneous actions',
        description: 'simultaneous actions',
        moduleIds: ['grade6-lower-mod-05'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6l-ch6',
        bookId: 'grade6-lower',
        number: 6,
        title: 'Unit 6: gifts and past actions',
        description: 'gifts and past actions',
        moduleIds: ['grade6-lower-mod-06'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6l-ch7',
        bookId: 'grade6-lower',
        number: 7,
        title: 'Unit 7: famous people',
        description: 'famous people',
        moduleIds: ['grade6-lower-mod-07'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6l-ch8',
        bookId: 'grade6-lower',
        number: 8,
        title: 'Unit 8: asking why',
        description: 'asking why',
        moduleIds: ['grade6-lower-mod-08'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6l-ch9',
        bookId: 'grade6-lower',
        number: 9,
        title: 'Unit 9: best wishes',
        description: 'best wishes',
        moduleIds: ['grade6-lower-mod-09'],
        estimatedMinutes: 25,
        isLocked: false
      },
      {
        id: 'g6l-ch10',
        bookId: 'grade6-lower',
        number: 10,
        title: 'Unit 10: future school life',
        description: 'future school life',
        moduleIds: ['grade6-lower-mod-10'],
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

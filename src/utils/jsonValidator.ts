/**
 * JSON数据验证系统
 * 严格验证课本数据格式，确保moduleId和文件名完全匹配
 */

// 验证结果接口
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  summary: {
    totalWords: number
    totalPhrases: number
    totalPatterns: number
    totalQuests: number
    totalSteps: number
    totalPracticeItems: number
    totalFunFacts: number
  }
}

// 文件名和moduleId匹配验证
export interface FileModuleMatch {
  filename: string
  moduleId: string
  isMatch: boolean
  grade: number
  semester: 'upper' | 'lower'
  moduleNumber: number
  topic?: string
}

/**
 * 验证moduleId格式：grade{数字}-{lower/upper}-mod-{数字}
 */
const validateModuleIdFormat = (moduleId: string): {
  isValid: boolean
  grade?: number
  semester?: 'upper' | 'lower'
  moduleNumber?: number
  error?: string
} => {
  const pattern = /^grade(\d+)-(lower|upper)-mod-(\d+)$/
  const match = moduleId.match(pattern)

  if (!match) {
    return {
      isValid: false,
      error: `moduleId格式错误: "${moduleId}". 正确格式: grade{1-6}-{lower/upper}-mod-{1-10}`
    }
  }

  const grade = parseInt(match[1])
  const semester = match[2] as 'upper' | 'lower'
  const moduleNumber = parseInt(match[3])

  // 验证年级范围
  if (grade < 1 || grade > 6) {
    return {
      isValid: false,
      error: `年级超出范围: grade${grade}. 必须在 grade1 到 grade6 之间`
    }
  }

  // 验证单元编号范围
  if (moduleNumber < 1 || moduleNumber > 10) {
    return {
      isValid: false,
      error: `单元编号超出范围: mod-${moduleNumber}. 必须在 mod-1 到 mod-10 之间`
    }
  }

  return {
    isValid: true,
    grade,
    semester,
    moduleNumber
  }
}

/**
 * 解析文件名：grade{年级}-{学期}-mod-{单元号}-{主题}.json
 */
const parseFilename = (filename: string): {
  isValid: boolean
  grade?: number
  semester?: 'upper' | 'lower'
  moduleNumber?: number
  topic?: string
  error?: string
} => {
  // 移除.json扩展名
  const nameWithoutExt = filename.replace(/\.json$/, '')

  // 标准格式：grade5-lower-mod-01-driver-player
  const standardPattern = /^grade(\d+)-(lower|upper)-mod-(\d+)-(.+)$/
  const standardMatch = nameWithoutExt.match(standardPattern)

  if (standardMatch) {
    const grade = parseInt(standardMatch[1])
    const semester = standardMatch[2] as 'upper' | 'lower'
    const moduleNumber = parseInt(standardMatch[3])
    const topic = standardMatch[4]

    // 验证年级和单元范围
    if (grade < 1 || grade > 6) {
      return {
        isValid: false,
        error: `文件名年级超出范围: grade${grade}. 必须在 grade1 到 grade6 之间`
      }
    }

    if (moduleNumber < 1 || moduleNumber > 10) {
      return {
        isValid: false,
        error: `文件名单元编号超出范围: mod-${moduleNumber}. 必须在 mod-1 到 mod-10 之间`
      }
    }

    return {
      isValid: true,
      grade,
      semester,
      moduleNumber,
      topic
    }
  }

  // 兼容旧格式：module-01-how-long (默认为六年级上册)
  const oldPattern = /^module-(\d+)-(.+)$/
  const oldMatch = nameWithoutExt.match(oldPattern)

  if (oldMatch) {
    const moduleNumber = parseInt(oldMatch[1])
    const topic = oldMatch[2]

    if (moduleNumber < 1 || moduleNumber > 10) {
      return {
        isValid: false,
        error: `文件名单元编号超出范围: module-${moduleNumber}. 必须在 module-1 到 module-10 之间`
      }
    }

    return {
      isValid: true,
      grade: 6,
      semester: 'upper',
      moduleNumber,
      topic
    }
  }

  return {
    isValid: false,
    error: `文件名格式错误: "${filename}". 正确格式: grade{1-6}-{lower/upper}-mod-{1-10}-{主题}.json`
  }
}

/**
 * 验证文件名和moduleId是否匹配
 */
export const validateFilenameModuleMatch = (filename: string, moduleId: string): FileModuleMatch => {
  const moduleValidation = validateModuleIdFormat(moduleId)
  const filenameValidation = parseFilename(filename)

  if (!moduleValidation.isValid) {
    return {
      filename,
      moduleId,
      isMatch: false,
      grade: 0,
      semester: 'upper',
      moduleNumber: 0
    }
  }

  if (!filenameValidation.isValid) {
    return {
      filename,
      moduleId,
      isMatch: false,
      grade: 0,
      semester: 'upper',
      moduleNumber: 0
    }
  }

  // 检查关键信息是否匹配
  const isMatch =
    moduleValidation.grade === filenameValidation.grade &&
    moduleValidation.semester === filenameValidation.semester &&
    moduleValidation.moduleNumber === filenameValidation.moduleNumber

  return {
    filename,
    moduleId,
    isMatch,
    grade: moduleValidation.grade!,
    semester: moduleValidation.semester!,
    moduleNumber: moduleValidation.moduleNumber!,
    topic: filenameValidation.topic
  }
}

/**
 * 必需字段验证
 */
const requiredString = (value: any, fieldName: string): string | null => {
  if (typeof value !== 'string' || value.trim() === '') {
    return `${fieldName}是必需字段，必须是非空字符串`
  }
  return null
}

const requiredNumber = (value: any, fieldName: string): string | null => {
  if (typeof value !== 'number' || isNaN(value)) {
    return `${fieldName}是必需字段，必须是有效数字`
  }
  return null
}

const requiredArray = (value: any, fieldName: string): string | null => {
  if (!Array.isArray(value)) {
    return `${fieldName}是必需字段，必须是数组`
  }
  return null
}

/**
 * 验证单词数据
 */
const validateWord = (word: any, index: number): string[] => {
  const errors: string[] = []

  const idError = requiredString(word?.id, `words[${index}].id`)
  if (idError) errors.push(idError)

  const enError = requiredString(word?.en, `words[${index}].en`)
  if (enError) errors.push(enError)

  const zhError = requiredString(word?.zh, `words[${index}].zh`)
  if (zhError) errors.push(zhError)

  return errors
}

/**
 * 验证句型数据
 */
const validatePattern = (pattern: any, index: number): string[] => {
  const errors: string[] = []

  const qError = requiredString(pattern?.q, `patterns[${index}].q`)
  if (qError) errors.push(qError)

  const aError = requiredString(pattern?.a, `patterns[${index}].a`)
  if (aError) errors.push(aError)

  return errors
}

/**
 * 验证任务步骤
 */
const validateQuestStep = (step: any, stepIndex: number, questIndex: number): string[] => {
  const errors: string[] = []
  const prefix = `quests[${questIndex}].steps[${stepIndex}]`

  const validTypes = ['listen', 'select', 'speak', 'reveal', 'show', 'drag', 'action', 'fillblank',
                      'wordmatching', 'sentencesorting', 'entozh', 'zhtoen']

  if (!validTypes.includes(step?.type)) {
    errors.push(`${prefix}.type: 必须是以下之一: ${validTypes.join(', ')}`)
  }

  const textError = requiredString(step?.text, `${prefix}.text`)
  if (textError) errors.push(textError)

  // 类型特定验证
  switch (step?.type) {
    case 'wordmatching':
      if (!Array.isArray(step?.pairs) || step.pairs.length === 0) {
        errors.push(`${prefix}.pairs: wordmatching类型必需，必须是非空数组`)
      }
      break
    case 'sentencesorting':
      if (!Array.isArray(step?.scrambled) || step.scrambled.length === 0) {
        errors.push(`${prefix}.scrambled: sentencesorting类型必需，必须是非空数组`)
      }
      if (!Array.isArray(step?.correct) || step.correct.length === 0) {
        errors.push(`${prefix}.correct: sentencesorting类型必需，必须是非空数组`)
      }
      break
    case 'entozh':
      if (!step?.english) errors.push(`${prefix}.english: entozh类型必需`)
      if (!Array.isArray(step?.scrambledChinese) || step.scrambledChinese.length === 0) {
        errors.push(`${prefix}.scrambledChinese: entozh类型必需，必须是非空数组`)
      }
      break
    case 'zhtoen':
      if (!step?.chinese) errors.push(`${prefix}.chinese: zhtoen类型必需`)
      if (!Array.isArray(step?.scrambledEnglish) || step.scrambledEnglish.length === 0) {
        errors.push(`${prefix}.scrambledEnglish: zhtoen类型必需，必须是非空数组`)
      }
      break
  }

  return errors
}

/**
 * 验证任务数据
 */
const validateQuest = (quest: any, index: number): string[] => {
  const errors: string[] = []

  const idError = requiredString(quest?.id, `quests[${index}].id`)
  if (idError) errors.push(idError)

  const titleError = requiredString(quest?.title, `quests[${index}].title`)
  if (titleError) errors.push(titleError)

  if (!Array.isArray(quest?.steps) || quest.steps.length === 0) {
    errors.push(`quests[${index}].steps: 是必需的，不能为空数组`)
  } else {
    quest.steps.forEach((step: any, stepIndex: number) => {
      errors.push(...validateQuestStep(step, stepIndex, index))
    })
  }

  if (!quest?.reward || typeof quest?.reward?.xp !== 'number') {
    errors.push(`quests[${index}].reward.xp: 是必需的，必须是数字`)
  }

  return errors
}

/**
 * 主验证函数 - 验证单个模块
 */
export const validateModuleJson = (data: any, filename: string, existingModuleIds: Set<string> = new Set()): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. 验证文件名和moduleId匹配
  if (!data?.moduleId) {
    errors.push('moduleId是必需字段')
  } else {
    const matchResult = validateFilenameModuleMatch(filename, data.moduleId)
    if (!matchResult.isMatch) {
      errors.push(`文件名和moduleId不匹配: 文件名"${filename}" vs moduleId"${data.moduleId}"`)
      if (matchResult.grade !== 0) {
        errors.push(`详细信息: 文件名解析为 grade${matchResult.grade}-${matchResult.semester}-mod-${matchResult.moduleNumber.toString().padStart(2, '0')}`)
      }
    }

    // 检查moduleId唯一性
    if (existingModuleIds.has(data.moduleId)) {
      errors.push(`moduleId重复: "${data.moduleId}". moduleId必须在所有文件中唯一`)
    }

    // 验证moduleId格式
    const moduleValidation = validateModuleIdFormat(data.moduleId)
    if (!moduleValidation.isValid) {
      errors.push(moduleValidation.error!)
    }
  }

  // 2. 验证其他必需字段
  const titleError = requiredString(data?.title, 'title')
  if (titleError) errors.push(titleError)

  const durationError = requiredNumber(data?.durationMinutes, 'durationMinutes')
  if (durationError) errors.push(durationError)
  else if (data?.durationMinutes <= 0) {
    errors.push('durationMinutes必须是正数')
  }

  const wordsError = requiredArray(data?.words, 'words')
  if (wordsError) errors.push(wordsError)

  const questsError = requiredArray(data?.quests, 'quests')
  if (questsError) errors.push(questsError)

  // 如果有严重错误，返回早期
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      summary: {
        totalWords: 0,
        totalPhrases: 0,
        totalPatterns: 0,
        totalQuests: 0,
        totalSteps: 0,
        totalPracticeItems: 0,
        totalFunFacts: 0
      }
    }
  }

  // 3. 详细验证内容
  data.words.forEach((word: any, index: number) => {
    errors.push(...validateWord(word, index))
  })

  if (data.patterns && data.patterns.length > 0) {
    data.patterns.forEach((pattern: any, index: number) => {
      errors.push(...validatePattern(pattern, index))
    })
  }

  data.quests.forEach((quest: any, index: number) => {
    errors.push(...validateQuest(quest, index))
  })

  // 4. 生成统计信息
  const summary = {
    totalWords: data.words?.length || 0,
    totalPhrases: data.phrases?.length || 0,
    totalPatterns: data.patterns?.length || 0,
    totalQuests: data.quests?.length || 0,
    totalSteps: data.quests?.reduce((total: number, quest: any) => total + (quest.steps?.length || 0), 0) || 0,
    totalPracticeItems: data.practice?.length || 0,
    totalFunFacts: data.funFacts?.length || 0
  }

  // 5. 生成警告
  if (summary.totalWords < 3) {
    warnings.push('单词数量较少 (建议每个模块至少3个单词)')
  }

  if (summary.totalQuests < 1) {
    warnings.push('任务数量较少 (建议每个模块至少1个任务)')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary
  }
}

/**
 * 验证多个模块文件
 */
export const validateMultipleModules = (modules: { filename: string, data: any }[]): ValidationResult[] => {
  const allModuleIds = new Set<string>()
  const results: ValidationResult[] = []

  for (const module of modules) {
    const result = validateModuleJson(module.data, module.filename, allModuleIds)

    // 如果验证通过且moduleId有效，添加到集合
    if (result.isValid && module.data?.moduleId) {
      allModuleIds.add(module.data.moduleId)
    }

    results.push(result)
  }

  return results
}

/**
 * 打印验证结果
 */
export const printValidationResult = (result: ValidationResult, filename: string): void => {
  if (result.isValid) {
    console.log(`✅ [${filename}] JSON验证通过!`)
    console.log(`📊 内容统计: 单词 ${result.summary.totalWords} | 句型 ${result.summary.totalPatterns} | 任务 ${result.summary.totalQuests} | 步骤 ${result.summary.totalSteps}`)
  } else {
    console.log(`❌ [${filename}] JSON验证失败!`)
  }

  if (result.errors.length > 0) {
    console.log(`\n🚨 错误 (${result.errors.length}):`)
    result.errors.forEach(error => console.log(`   • ${error}`))
  }

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  警告 (${result.warnings.length}):`)
    result.warnings.forEach(warning => console.log(`   • ${warning}`))
  }

  console.log('')
}
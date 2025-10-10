// 统一的内容管理模块
// 所有JSON文件都在这里集中导入和管理

// 六年级上册模块 (Grade 6 Upper)
import module01HowLongData from './module-01-how-long.json'
import module02ChinatownTombsData from './module-02-chinatown-tombs.json'
import module03StampsHobbiesData from './module-03-stamps-hobbies.json'
import module04FestivalsData from './module-04-festivals.json'
import module05PenFriendsData from './module-05-pen-friends.json'
import module06SchoolAnswersData from './module-06-school-answers.json'
import module07AnimalsData from './module-07-animals.json'
import module08HabitsTidyData from './module-08-habits-tidy.json'
import module09PeaceUNData from './module-09-peace-un.json'
import module10TravelSafetyData from './module-10-travel-safety.json'

// 五年级下册模块 (Grade 5 Lower)
import grade5LowerModule01DriverPlayerData from './grade5-lower-mod-01-driver-player.json'
import grade5LowerModule02TraditionalFoodData from './grade5-lower-mod-02-traditional-food.json'
import grade5LowerModule03LibraryBorrowData from './grade5-lower-mod-03-library-borrow.json'
import grade5LowerModule04LettersSeasonsData from './grade5-lower-mod-04-letters-seasons.json'
import grade5LowerModule05ShoppingCarryingData from './grade5-lower-mod-05-shopping-carrying.json'
import grade5LowerModule06TravelPlansData from './grade5-lower-mod-06-travel-plans.json'
import grade5LowerModule07JobsTimeData from './grade5-lower-mod-07-jobs-time.json'
import grade5LowerModule08MakeAKiteData from './grade5-lower-mod-08-make-a-kite.json'
import grade5LowerModule09TheatreHistoryData from './grade5-lower-mod-09-theatre-history.json'
import grade5LowerModule10TravelPrepData from './grade5-lower-mod-10-travel-prep.json'

// 六年级下册模块 (Grade 6 Lower)
import grade6LowerModule01FuturePlansData from './grade6-lower-mod-01-future-plans.json'
import grade6LowerModule02TravelDreamsData from './grade6-lower-mod-02-travel-dreams.json'

// 重新导出所有模块数据
export { module01HowLongData as module01HowLong }
export { module02ChinatownTombsData as module02ChinatownTombs }
export { module03StampsHobbiesData as module03StampsHobbies }
export { module04FestivalsData as module04Festivals }
export { module05PenFriendsData as module05PenFriends }
export { module06SchoolAnswersData as module06SchoolAnswers }
export { module07AnimalsData as module07Animals }
export { module08HabitsTidyData as module08HabitsTidy }
export { module09PeaceUNData as module09PeaceUN }
export { module10TravelSafetyData as module10TravelSafety }

export { grade5LowerModule01DriverPlayerData as grade5LowerModule01DriverPlayer }
export { grade5LowerModule02TraditionalFoodData as grade5LowerModule02TraditionalFood }
export { grade5LowerModule03LibraryBorrowData as grade5LowerModule03LibraryBorrow }
export { grade5LowerModule04LettersSeasonsData as grade5LowerModule04LettersSeasons }
export { grade5LowerModule05ShoppingCarryingData as grade5LowerModule05ShoppingCarrying }
export { grade5LowerModule06TravelPlansData as grade5LowerModule06TravelPlans }
export { grade5LowerModule07JobsTimeData as grade5LowerModule07JobsTime }
export { grade5LowerModule08MakeAKiteData as grade5LowerModule08MakeAKite }
export { grade5LowerModule09TheatreHistoryData as grade5LowerModule09TheatreHistory }
export { grade5LowerModule10TravelPrepData as grade5LowerModule10TravelPrep }

export { grade6LowerModule01FuturePlansData as grade6LowerModule01FuturePlans }
export { grade6LowerModule02TravelDreamsData as grade6LowerModule02TravelDreams }

// 模块数据映射 - 支持多种访问方式
export const moduleData = {
  // 六年级上册模块的多种映射方式
  'module-01': module01HowLongData,
  'grade6-upper-mod-01': module01HowLongData,
  '6u-01': module01HowLongData,
  'mod-01': module01HowLongData,
  '01': module01HowLongData,

  'module-02': module02ChinatownTombsData,
  'grade6-upper-mod-02': module02ChinatownTombsData,
  '6u-02': module02ChinatownTombsData,
  'mod-02': module02ChinatownTombsData,
  '02': module02ChinatownTombsData,

  'module-03': module03StampsHobbiesData,
  'grade6-upper-mod-03': module03StampsHobbiesData,
  '6u-03': module03StampsHobbiesData,
  'mod-03': module03StampsHobbiesData,
  '03': module03StampsHobbiesData,

  'module-04': module04FestivalsData,
  'grade6-upper-mod-04': module04FestivalsData,
  '6u-04': module04FestivalsData,
  'mod-04': module04FestivalsData,
  '04': module04FestivalsData,

  'module-05': module05PenFriendsData,
  'grade6-upper-mod-05': module05PenFriendsData,
  '6u-05': module05PenFriendsData,
  'mod-05': module05PenFriendsData,
  '05': module05PenFriendsData,

  'module-06': module06SchoolAnswersData,
  'grade6-upper-mod-06': module06SchoolAnswersData,
  '6u-06': module06SchoolAnswersData,
  'mod-06': module06SchoolAnswersData,
  '06': module06SchoolAnswersData,

  'module-07': module07AnimalsData,
  'grade6-upper-mod-07': module07AnimalsData,
  '6u-07': module07AnimalsData,
  'mod-07': module07AnimalsData,
  '07': module07AnimalsData,

  'module-08': module08HabitsTidyData,
  'grade6-upper-mod-08': module08HabitsTidyData,
  '6u-08': module08HabitsTidyData,
  'mod-08': module08HabitsTidyData,
  '08': module08HabitsTidyData,

  'module-09': module09PeaceUNData,
  'grade6-upper-mod-09': module09PeaceUNData,
  '6u-09': module09PeaceUNData,
  'mod-09': module09PeaceUNData,
  '09': module09PeaceUNData,

  'module-10': module10TravelSafetyData,
  'grade6-upper-mod-10': module10TravelSafetyData,
  '6u-10': module10TravelSafetyData,
  'mod-10': module10TravelSafetyData,
  '10': module10TravelSafetyData,

  // 五年级下册模块映射
  'grade5-lower-mod-01': grade5LowerModule01DriverPlayerData,
  '5l-01': grade5LowerModule01DriverPlayerData,

  'grade5-lower-mod-02': grade5LowerModule02TraditionalFoodData,
  '5l-02': grade5LowerModule02TraditionalFoodData,

  'grade5-lower-mod-03': grade5LowerModule03LibraryBorrowData,
  '5l-03': grade5LowerModule03LibraryBorrowData,

  'grade5-lower-mod-04': grade5LowerModule04LettersSeasonsData,
  '5l-04': grade5LowerModule04LettersSeasonsData,

  'grade5-lower-mod-05': grade5LowerModule05ShoppingCarryingData,
  '5l-05': grade5LowerModule05ShoppingCarryingData,

  'grade5-lower-mod-06': grade5LowerModule06TravelPlansData,
  '5l-06': grade5LowerModule06TravelPlansData,

  'grade5-lower-mod-07': grade5LowerModule07JobsTimeData,
  '5l-07': grade5LowerModule07JobsTimeData,

  'grade5-lower-mod-08': grade5LowerModule08MakeAKiteData,
  '5l-08': grade5LowerModule08MakeAKiteData,

  'grade5-lower-mod-09': grade5LowerModule09TheatreHistoryData,
  '5l-09': grade5LowerModule09TheatreHistoryData,

  'grade5-lower-mod-10': grade5LowerModule10TravelPrepData,
  '5l-10': grade5LowerModule10TravelPrepData,

  // 六年级下册模块映射
  'grade6-lower-mod-01': grade6LowerModule01FuturePlansData,
  '6l-01': grade6LowerModule01FuturePlansData,

  'grade6-lower-mod-02': grade6LowerModule02TravelDreamsData,
  '6l-02': grade6LowerModule02TravelDreamsData,
}

// 便捷函数：根据模块ID获取数据
export function getModuleData(moduleId: string) {
  return moduleData[moduleId] || null
}

// 获取所有可用模块ID
export function getAllModuleIds() {
  return Object.keys(moduleData)
}

// 按年级分组模块
export function getModulesByGrade() {
  const grade6Upper = []
  const grade5Lower = []
  const grade6Lower = []

  for (let i = 1; i <= 10; i++) {
    const id = i.toString().padStart(2, '0')
    grade6Upper.push({
      id: `module-${id}`,
      displayName: `Module ${id}`,
      data: moduleData[`module-${id}`]
    })
  }

  for (let i = 1; i <= 10; i++) {
    const id = i.toString().padStart(2, '0')
    grade5Lower.push({
      id: `grade5-lower-mod-${id}`,
      displayName: `Grade 5 Lower Module ${id}`,
      data: moduleData[`grade5-lower-mod-${id}`]
    })
  }

  for (let i = 1; i <= 2; i++) {
    const id = i.toString().padStart(2, '0')
    grade6Lower.push({
      id: `grade6-lower-mod-${id}`,
      displayName: `Grade 6 Lower Module ${id}`,
      data: moduleData[`grade6-lower-mod-${id}`]
    })
  }

  return {
    grade6Upper,
    grade5Lower,
    grade6Lower
  }
}
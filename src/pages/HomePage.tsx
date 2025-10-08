import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Play, Star, Trophy, UserPlus, LogIn } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { BookSelection } from "@/components/BookSelection";
import { useGameStore } from "@/store/useGameStore";
import { useUserStore } from "@/store/useUserStore";
import { useBookStore } from "@/store/useBookStore";
import { useTranslation } from "@/hooks/useTranslation";
import { SimpleEncryption } from "@/utils/encryption";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { progress } = useGameStore();
  const { currentUser, isLoggedIn, users, setShowLoginModal, login, register } =
    useUserStore();

  const handleStartLearning = () => {
    // 如果没有登录，创建临时访客用户
    if (!isLoggedIn) {
      createGuestUser();
    }
    navigate("/modules");
  };

  const createGuestUser = async () => {
    const guestUsername = `guest_${Date.now()}`;
    const guestPassword = "guest123"; // 访客密码

    const success = await register(guestUsername, guestPassword, "访客用户");
    if (success) {
      console.log("Guest user created successfully");
    }
  };

  const quickStats = [
    {
      icon: Star,
      label: "Total XP",
      value: currentUser?.globalStats?.totalXP || 0,
      color: "text-yellow-600",
    },
    {
      icon: Trophy,
      label: "Badges",
      value: currentUser?.globalStats?.badges?.length || 0,
      color: "text-purple-600",
    },
    {
      icon: BookOpen,
      label: "Completed",
      value: currentUser?.globalStats?.questsCompleted || 0,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="safe-top bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{t("app.title")}</h1>
          <p className="text-lg text-gray-600 mt-2">{t("app.subtitle")}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8">
        {/* 未登录状态 */}
        {!isLoggedIn ? (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                欢迎来到 English Quest 英语学习！ 🎓
              </h2>
              <p className="text-gray-600 mb-6">
                开始你的英语学习冒险之旅！请先登录或创建新账号。
              </p>

              {/* 已有用户快速登录 */}
              {users.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    快速登录已有账号：
                  </h3>
                  <div className="grid gap-2">
                    {users.slice(0, 3).map((user) => (
                      <button
                        key={user.id}
                        onClick={() => login(user.username, "")} // 密码验证已在 login 函数中处理
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                            user.username.charCodeAt(0) % 6 === 0
                              ? "bg-blue-500"
                              : user.username.charCodeAt(0) % 6 === 1
                              ? "bg-green-500"
                              : user.username.charCodeAt(0) % 6 === 2
                              ? "bg-purple-500"
                              : user.username.charCodeAt(0) % 6 === 3
                              ? "bg-pink-500"
                              : user.username.charCodeAt(0) % 6 === 4
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        >
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {user.displayName}
                          </p>
                          <p className="text-xs text-gray-500">
                            @{user.username} • {user.totalXP} XP
                          </p>
                        </div>
                        <LogIn className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    注意：快速登录为演示功能，生产环境需要输入密码
                  </p>
                </div>
              )}

              {/* 登录/注册按钮 */}
              <div className="space-y-3">
                <button
                  onClick={handleStartLearning}
                  className="w-full btn btn-primary flex items-center justify-center gap-3"
                >
                  <Play className="w-5 h-5" />
                  快速体验（无需注册）
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="btn btn-outline flex items-center justify-center gap-2 py-2"
                  >
                    <LogIn className="w-4 h-4" />
                    登录
                  </button>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="btn btn-outline flex items-center justify-center gap-2 py-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    注册
                  </button>
                </div>
              </div>
            </div>

            {/* 功能介绍 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🌟 为什么选择 English Quest ？
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <strong>个性化学习</strong> - 根据你的进度调整学习内容
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <strong>多用户支持</strong> - 每个家庭成员都有独立的学习记录
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <strong>丰富的练习</strong> - 词汇、语法、听力全方位训练
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <strong>成就系统</strong> - 获得徽章和XP奖励，激励持续学习
                  </div>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* 已登录状态 */
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                欢迎回来，{currentUser?.displayName}！ 👋
              </h2>
              <p className="text-gray-600 mb-6">
                准备好继续你的英语学习冒险了吗？让我们从上次停下的地方开始吧！
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="text-center p-4 bg-gray-50 rounded-xl"
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                      <div className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartLearning}
                className="w-full btn btn-adhd btn-primary flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6" />
                开始学习
              </button>
            </div>

            {/* 学习连续天数 */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                🔥 学习连续天数
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    {currentUser?.globalStats.streakDays || 0} 天
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    继续保持，你做得很棒！
                  </p>
                </div>
                <div className="text-4xl">
                  {currentUser?.globalStats.streakDays === 0
                    ? "💪"
                    : currentUser?.globalStats.streakDays <= 3
                    ? "🌟"
                    : currentUser?.globalStats.streakDays <= 7
                    ? "🔥"
                    : currentUser?.globalStats.streakDays <= 14
                    ? "⭐"
                    : "🏆"}
                </div>
              </div>
            </div>

            {/* Daily Tip */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                💡 今日学习建议
              </h3>
              <p className="text-yellow-800">
                每天坚持学习10-15分钟，小小的习惯会带来巨大的进步！
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

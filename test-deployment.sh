#!/bin/bash

# 部署验证脚本
echo "🚀 开始部署验证..."

# 检查dist目录是否存在
if [ ! -d "dist" ]; then
    echo "❌ dist目录不存在，请先运行构建"
    exit 1
fi

echo "✅ dist目录存在"

# 检查关键文件
echo "📁 检查关键文件..."
required_files=(
    "index.html"
    "manifest.webmanifest"
    "assets/index-*.js"
    "assets/index-*.css"
    "sw.js"
    "registerSW.js"
)

missing_files=()
for file_pattern in "${required_files[@]}"; do
    if ! ls dist/$file_pattern 1> /dev/null 2>&1; then
        missing_files+=("$file_pattern")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ 所有关键文件都存在"
else
    echo "❌ 缺少以下文件:"
    printf '%s\n' "${missing_files[@]}"
    exit 1
fi

# 检查JSON文件数量
echo "📄 检查JSON模块文件..."
json_count=$(ls dist/content/*.json 2>/dev/null | wc -l)
if [ $json_count -eq 22 ]; then
    echo "✅ 找到所有22个JSON模块文件"
else
    echo "⚠️  只找到$json_count个JSON文件，期望22个"
fi

# 测试JSON文件内容
echo "🔍 验证JSON文件内容..."
sample_json=$(ls dist/content/*.json | head -1)
if [ -f "$sample_json" ]; then
    if command -v jq >/dev/null 2>&1; then
        module_id=$(jq -r '.moduleId' "$sample_json" 2>/dev/null)
        if [ "$module_id" != "null" ] && [ "$module_id" != "" ]; then
            echo "✅ JSON文件包含有效的moduleId: $module_id"
        else
            echo "❌ JSON文件缺少有效的moduleId"
        fi
    else
        echo "⚠️  jq未安装，跳过JSON内容验证"
    fi
fi

# 检查文件大小
echo "📊 检查文件大小..."
main_js_size=$(ls -la dist/assets/index-*.js | awk '{print $5}')
main_css_size=$(ls -la dist/assets/index-*.css | awk '{print $5}')

if [ $main_js_size -gt 100000 ]; then  # 大于100KB
    echo "✅ 主JS文件大小正常: $(($main_js_size / 1024))KB"
else
    echo "⚠️  主JS文件可能过小: $(($main_js_size / 1024))KB"
fi

if [ $main_css_size -gt 10000 ]; then  # 大于10KB
    echo "✅ 主CSS文件大小正常: $(($main_css_size / 1024))KB"
else
    echo "⚠️  主CSS文件可能过小: $(($main_css_size / 1024))KB"
fi

# PWA文件检查
echo "📱 检查PWA功能..."
if [ -f "dist/sw.js" ] && [ -s "dist/sw.js" ]; then
    echo "✅ Service Worker文件存在且非空"
else
    echo "❌ Service Worker文件缺失或为空"
fi

if [ -f "dist/manifest.webmanifest" ]; then
    echo "✅ PWA Manifest文件存在"
else
    echo "❌ PWA Manifest文件缺失"
fi

echo ""
echo "🎉 部署验证完成！"
echo ""
echo "📋 下一步操作建议:"
echo "1. 运行本地服务器测试: npx serve dist -p 4173"
echo "2. 在浏览器中访问: http://localhost:4173"
echo "3. 测试PWA功能: 安装应用、离线访问"
echo "4. 验证所有学习模块可以正常加载"
echo "5. 测试用户切换和数据隔离功能"
echo ""
echo "🌐 准备部署到生产环境时，可以将dist目录上传到你的静态文件服务器"
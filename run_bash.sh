#!/bin/bash

# ========================================
# 配置区域（在这里修改你的设置）
# ========================================

# 仓库路径（必填）
REPO_PATH="/Users/xiehang/Documents/products/next-project/my-next-app"

# 要写入的文件名
TARGET_FILE="daily_log.txt"

# ⏰ 定时执行时间（24小时制）
SCHEDULE_HOUR=3    # 小时 (0-23)
SCHEDULE_MINUTE=15 # 分钟 (0-59)

# 分支名称（main 或 master）
BRANCH="main"

# ========================================
# 以下为脚本逻辑，一般不需要修改
# ========================================

# 获取脚本自身的绝对路径
SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"

# 显示当前配置
echo "📋 当前配置："
echo "   仓库路径: $REPO_PATH"
echo "   目标文件: $TARGET_FILE"
echo "   定时时间: 每天 $SCHEDULE_HOUR:$SCHEDULE_MINUTE"
echo "   分支: $BRANCH"
echo ""

# ---------- 功能1：安装/更新定时任务 ----------
install_cron() {
    echo "🔧 正在设置定时任务..."
    
    # 生成 crontab 条目
    CRON_JOB="$SCHEDULE_MINUTE $SCHEDULE_HOUR * * * $SCRIPT_PATH >> $REPO_PATH/cron_log.txt 2>&1"
    
    # 检查是否已存在该任务
    if crontab -l 2>/dev/null | grep -F "$SCRIPT_PATH" > /dev/null; then
        echo "⚠️ 检测到已存在的定时任务，正在更新..."
        # 删除旧任务并添加新任务
        (crontab -l 2>/dev/null | grep -vF "$SCRIPT_PATH"; echo "$CRON_JOB") | crontab -
    else
        echo "✅ 正在添加新的定时任务..."
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    fi
    
    echo "✅ 定时任务已设置！"
    echo "📅 执行时间: 每天 $SCHEDULE_HOUR:$SCHEDULE_MINUTE"
    echo ""
}

# ---------- 功能2：查看当前定时任务 ----------
show_cron() {
    echo "📋 当前的定时任务："
    crontab -l 2>/dev/null || echo "   (没有定时任务)"
    echo ""
}

# ---------- 功能3：取消定时任务 ----------
remove_cron() {
    echo "🗑️ 正在取消定时任务..."
    if crontab -l 2>/dev/null | grep -F "$SCRIPT_PATH" > /dev/null; then
        (crontab -l 2>/dev/null | grep -vF "$SCRIPT_PATH") | crontab -
        echo "✅ 已取消定时任务"
    else
        echo "ℹ️ 没有找到相关的定时任务"
    fi
    echo ""
}

# ---------- 功能4：执行每日提交（核心功能） ----------
run_daily_task() {
    echo "🚀 开始执行每日任务..."
    
    # 切换到仓库目录
    cd "$REPO_PATH" || { echo "❌ 仓库路径错误，请检查！"; exit 1; }
    
    # 先拉取最新代码，避免冲突
    echo "📥 拉取远程最新代码..."
    git pull origin "$BRANCH" --rebase 2>/dev/null || echo "⚠️ 拉取失败，继续执行..."
    
    # 检查文件是否存在，不存在则创建
    if [ ! -f "$TARGET_FILE" ]; then
        echo "📄 文件不存在，正在创建: $TARGET_FILE"
        echo "========== 每日记录开始 ==========" > "$TARGET_FILE"
    fi
    
    # 生成当前时间
    CURRENT_TIME=$(date '+%Y-%m-%d %H:%M:%S')
    WEEKDAY=$(date '+%A')
    
    # 向文件追加记录
    echo "[$CURRENT_TIME] $WEEKDAY - 每日自动打卡 ✓" >> "$TARGET_FILE"
    
    # Git 提交
    git add "$TARGET_FILE"
    COMMIT_MSG="每日记录更新: $CURRENT_TIME"
    
    if git commit -m "$COMMIT_MSG"; then
        echo "✅ 提交成功: $COMMIT_MSG"
        if git push origin "$BRANCH"; then
            echo "🚀 推送成功！"; exit 1;
        else
            echo "❌ 推送失败，请检查网络或配置。"
        fi
    else
        echo "ℹ️ 没有新的更改需要提交。"
    fi
    echo ""
    osascript -e 'tell application "Terminal" to close first window' 2>/dev/null
}

# ---------- 主菜单 ----------
show_menu() {
    echo "========================================"
    echo "📌 每日自动提交脚本 - 控制面板"
    echo "========================================"
    echo "1. 🚀 立即执行一次提交"
    echo "2. ⏰ 安装/更新定时任务"
    echo "3. 📋 查看当前定时任务"
    echo "4. 🗑️ 取消定时任务"
    echo "5. ❌ 退出"
    echo "========================================"
    echo -n "请选择操作 [1-5]: "
    read -r choice
    
    case $choice in
        1) run_daily_task ;;
        2) install_cron ;;
        3) show_cron ;;
        4) remove_cron ;;
        5) echo "👋 再见！"; exit 0 ;;
        *) echo "❌ 无效选择，请重新运行"; exit 1 ;;
    esac
}

# ---------- 命令行参数支持 ----------
# 如果带参数运行，可以直接执行对应功能
case "$1" in
    --install) install_cron; exit 0 ;;
    --remove) remove_cron; exit 0 ;;
    --show) show_cron; exit 0 ;;
    --run) run_daily_task; exit 0 ;;
    --help)
        echo "用法: $0 [选项]"
        echo "  --install   安装/更新定时任务"
        echo "  --remove    取消定时任务"
        echo "  --show      查看当前定时任务"
        echo "  --run       立即执行一次提交"
        echo "  无参数       显示交互式菜单"
        exit 0
        ;;
esac

# 无参数时显示菜单
show_menu
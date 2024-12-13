# NFD - Telegram 消息转发机器人

一个基于 Cloudflare Workers 的 Telegram 消息转发机器人，提供消息转发、用户管理等功能。

## 特点

- 基于 Cloudflare Workers 搭建
  - 搭建成本低，单文件部署
  - 使用 Workers 自带域名
  - 基于 Workers KV 实现数据持久化
  - 全球 CDN 加速，稳定可靠
- 完整的用户管理系统
  - 用户屏蔽/解除屏蔽
  - 用户状态查询
  - 用户详细信息查看
- 灵活的消息发送功能
  - 支持群发消息
  - 支持定向发送
  - 支持向未屏蔽用户发送

## 功能列表

### 访客功能
- `/start` - 开始使用机器人
- `/info` - 查看个人信息

### 管理员功能
1. 用户管理
   - `/block` - 屏蔽用户
   - `/unblock` - 解除屏蔽
   - `/checkblock` - 检查用户状态
   - `/kk` - 查看用户详细信息

2. 消息发送
   - `/sendall` - 给所有用户发送消息
   - `/send` - 给指定用户发送消息
   - `/sendunblock` - 给未屏蔽用户发送消息

3. 其他功能
   - `/help` - 显示帮助信息
   - `/info` - 查看个人信息

## 搭建方法

1. 从 [@BotFather](https://t.me/BotFather) 获取 bot token
2. 生成一个随机字符串作为 secret（用于 Webhook 验证）
3. 从 [@username_to_id_bot](https://t.me/username_to_id_bot) 获取管理员 ID
4. 登录 [Cloudflare Workers](https://workers.cloudflare.com/)
5. 配置环境变量：
   - `ENV_BOT_TOKEN`: Bot Token
   - `ENV_BOT_SECRET`: Webhook Secret
   - `ENV_ADMIN_UID`: 管理员用户 ID
6. 创建并绑定 KV 命名空间：
   - 创建名为 `nfd` 的 KV 命名空间
   - 在 Settings -> Variables 中绑定 KV
7. 复制[worker.js](./src/worker.js)代码到 Worker
8. 访问 `https://your-worker.workers.dev/registerWebhook` 注册 Webhook

## 使用说明

### 基本功能
- 访客消息自动转发给管理员
- 管理员可直接回复消息
- 支持文本、图片等多种消息类型

### 命令格式
- 查看/屏蔽类命令使用空格分隔多个用户 ID
  - 例如：`/block 123456 789012`
- 发送类命令使用逗号分隔多个用户 ID
  - 例如：`/send 123456,789012 消息内容`

### 注意事项
- 命令支持两种使用方式：
  1. 直接输入命令 + 参数
  2. 回复消息使用命令
- 被屏蔽用户无法发送消息
- 管理员不能被屏蔽
- 所有操作都有详细的状态反馈

## 技术支持

如遇问题请检查：
1. 环境变量配置
2. KV 绑定状态
3. Webhook 注册状态
4. 错误日志记录

## Thanks
- [nfd](https://github.com/LloydAsp/nfd)
- [telegram-bot-cloudflare](https://github.com/cvzi/telegram-bot-cloudflare)

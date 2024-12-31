const TOKEN = ENV_BOT_TOKEN
const WEBHOOK = '/endpoint'
const SECRET = ENV_BOT_SECRET
const ADMIN_UID = ENV_ADMIN_UID
const NOTIFY_INTERVAL = 3600 * 1000;

const commands = {
  admin: [
    {command: 'help', description: '显示管理员帮助'},
    {command: 'block', description: '屏蔽用户 (回复消息或输入用户ID)'},
    {command: 'unblock', description: '解除屏蔽 (回复消息或输入用户ID)'},
    {command: 'checkblock', description: '检查用户状态 (回复消息或输入用户ID)'},
    {command: 'kk', description: '查看用户详细信息 (回复消息或输入用户ID)'},
    {command: 'info', description: '查看自己的信息'},
    {command: 'sendall', description: '给所有用户发送消息'},
    {command: 'send', description: '给指定用户发送消息'},
    {command: 'sendunblock', description: '给未屏蔽用户发送消息'},
    {command: 'sendgroup', description: '在指定群组发送消息'},
    {command: 'chat', description: '开始与用户对话 (回复消息或输入用户ID)'},
    {command: 'endchat', description: '结束当前对话'}
  ],
  guest: [
    {command: 'start', description: '开始使用机器人'},
    {command: 'info', description: '查看个人信息'}
  ]
}

const enable_notification = true

const templates = {
  help: () => `
🎯 <b>管理员指令菜单</b>
━━━━━━━━━━━━━━━━

📨 <b>消息管理</b>
• 直接回复 - 回复用户消息
• /chat - 开始与用户对话
• /endchat - 结束当前对话
• /sendall - 群发所有用户
• /send - 发送给指定用户
• /sendunblock - 发送给未屏蔽用户
• /sendgroup - 发送到指定群组

👥 <b>用户管理</b>
• /block - 屏蔽用户
• /unblock - 解除屏蔽
• /checkblock - 检查用户状态
• /kk - 查看用户详情
• /info - 查看自己的信息

💡 <b>使用说明</b>
• 大部分命令支持直接回复消息使用
• 对话模式下直接发送即可与用户对话
• 命令后加用户ID可指定操作对象
• 多个用户ID用空格分隔

⚡️ <b>快捷操作</b>
• 回复消息直接输入文字 = 回复用户
• /chat + 回复消息 = 开始对话
• /endchat = 结束当前对话
• /kk + 回复消息 = 查看用户信息

<i>❗️注意: 请谨慎使用管理命令，注意保护用户隐私</i>`,

  userInfo: (user, isBlocked = false, botBlocked = false) => `
📌 <b>用户信息</b>
━━━━━━━━━━━━━━━━
👤 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
🔖 用户名: ${user.username ? '@' + user.username : '未设置'}
🆔 ID: <code>${user.id}</code>
🔒 状态: ${isBlocked ? '🚫 已屏蔽' : '✅ 正常'}
🤖 Bot状态: ${botBlocked ? '🚫 已屏蔽Bot' : '✅ 正常'}

⏰ 查询时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  blocked: (users) => `
🚫 <b>用户已被屏蔽</b>
━━━━━━━━━━━━━━━━
${users.map(user => `👤 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
🔖 用户名: ${user.username ? '@' + user.username : '未设置'}
🆔 ID: <code>${user.id}</code>`).join('\n\n')}

⏰ 操作时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  unblocked: (users) => `
✅ <b>已解除用户屏蔽</b>
━━━━━━━━━━━━━━━━
${users.map(user => `👤 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
🔖 用户名: ${user.username ? '@' + user.username : '未设置'}
🆔 ID: <code>${user.id}</code>`).join('\n\n')}

⏰ 操作时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  blockStatus: (users) => `
📊 <b>用户状态查询</b>
━━━━━━━━━━━━━━━━
${users.map(user => `👤 昵称: <b>${user.info.first_name}${user.info.last_name ? ' ' + user.info.last_name : ''}</b>
🔖 用户名: ${user.info.username ? '@' + user.info.username : '未设置'}
🆔 ID: <code>${user.info.id}</code>
📊 状态: ${user.blocked ? '🚫 已屏蔽' : '✅ 正常'}`).join('\n\n')}

⏰ 查询时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  allBlockedUsers: (users) => `
📋 <b>被屏蔽用户列表</b>
━━━━━━━━━━━━━━━━
${users.length ? users.map(user => `👤 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
🔖 用户名: ${user.username ? '@' + user.username : '未设置'}
🆔 ID: <code>${user.id}</code>`).join('\n\n') : '✅ 暂无被屏蔽用户'}

⏰ 查询时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  messageSent: (type, users, failed = []) => `${failed.length > 0 ? '❌' : '✅'} <b>消息发送${failed.length > 0 ? '失败' : '成功'}</b>
━━━━━━━━━━━━━━━━
📨 发送类型: ${type}
📊 发送数量: ${users.length}条${
  users.length > 0 ? `\n\n✅ <b>发送成功</b>\n${users.map(user => 
    `👤 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
🔖 用户名: ${user.username ? '@' + user.username : '未设置'}
🆔 ID: <code>${user.id}</code>`).join('\n\n')}` : ''}${
  failed.length > 0 ? `\n\n❌ <b>发送失败</b>\n${failed.map(user => 
    `👤 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
🔖 用户名: ${user.username ? '@' + user.username : '未设置'}
🆔 ID: <code>${user.id}</code>
⚠️ 原因: ${user.error}`).join('\n\n')}` : ''}\n
⏰ 发送时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  startAdmin: () => `
🌸 <b>欢迎使用管理员模式</b>
━━━━━━━━━━━━━━━━
💡 使用 /help 查看所有可用命令
🔔 已启用消息通知功能
⚡️ 可直接回复消息与用户对话

<i>❗️注意: 请勿将管理员命令泄露给其他用户</i>`,

  startGuest: () => `
👋 <b>欢迎使用机器人</b>
━━━━━━━━━━━━━━━━
💭 您可以直接发送消息与管理员对话
📝 使用 /info 查看个人信息

<i>❗️消息将由管理员处理，请耐心等待回复</i>`,

  groupMessageSent: (group, success = true, error = null) => `
${success ? '✅ 群组消息发送成功' : '❌ 群组消息发送失败'}
━━━━━━━━━━━━━━━━
👥 群组名称: <b>${group.title}</b>
🆔 群组ID: <code>${group.id}</code>
${error ? `⚠️ 错误信息: ${error}` : ''}

⏰ 发送时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  userActions: (user, isBlocked, chatActive = false) => ({
    text: `👤 <b>用户详情</b>
━━━━━━━━━━━━━━━━
📌 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
🔖 用户名: ${user.username ? '@' + user.username : '未设置'}
🆔 ID: <code>${user.id}</code>
🔒 状态: ${isBlocked ? '🚫 已屏蔽' : '✅ 正常'}${
  user.type ? `\n📱 类型: ${
    user.type === 'private' ? '👤 个人用户' :
    user.type === 'group' ? '👥 群组' :
    user.type === 'supergroup' ? '📢 超级群组' :
    user.type === 'channel' ? '📣 频道' : 
    '❓ 未知'
  }` : ''}${user.bio ? `\n📝 简介: ${user.bio}` : ''}${
  user.description ? `\n📋 描述: ${user.description}` : ''}${
  user.invite_link ? `\n🔗 邀请链接: ${user.invite_link}` : ''}${
  user.can_join_groups !== undefined ? `\n👥 可加群: ${user.can_join_groups ? '✅ 是' : '❌ 否'}` : ''}${
  user.can_read_all_group_messages !== undefined ? `\n👀 可读所有群消息: ${user.can_read_all_group_messages ? '✅ 是' : '❌ 否'}` : ''}${
  user.supports_inline_queries !== undefined ? `\n💡 支持内联查询: ${user.supports_inline_queries ? '✅ 是' : '❌ 否'}` : ''}${
  chatActive ? '\n💭 对话: ✨ 进行中' : ''}\n
<i>💡 使用 /chat ${user.id} 开始对话
❗️使用 /endchat 结束对话</i>

⏰ 查询时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '👤 查看资料',
            url: `tg://user?id=${user.id}`
          },
          {
            text: '❌ 关闭',
            callback_data: 'close'
          }
        ]
      ]
    }
  }),

  chatStarted: (displayType, displayName, targetUserId) => `
✨ <b>对话已开启</b>
━━━━━━━━━━━━━━━━
💭 类型: ${displayType}
👤 名称: <b>${displayName}</b>
🆔 ID: <code>${targetUserId}</code>

<i>💡 直接发送消息即可与${displayType}对话
❗️使用 /endchat 结束对话</i>`,

  chatEnded: (userInfo, chatId) => `
🔚 <b>对话已结束</b>
━━━━━━━━━━━━━━━━
👤 名称: <b>${userInfo.type === 'group' || userInfo.type === 'supergroup' ? 
  userInfo.title : 
  userInfo.first_name + (userInfo.last_name ? ' ' + userInfo.last_name : '')}</b>
🆔 ID: <code>${chatId}</code>

⏰ 结束时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  chatError: (error, details = null) => `❌ <b>错误提示</b>
━━━━━━━━━━━━━━━━
⚠️ 错误: ${error}${details ? `\n📋 详情: ${details}` : ''}
💡 建议: ${
  error.includes('没有进行中的对话') ? '使用 /chat 命令开始新对话' :
  error.includes('请先结束当前对话') ? '使用 /endchat 结束当前对话' :
  '请稍后重试或联系管理员'
}\n
⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  paramError: (command, example) => `
❌ <b>参数错误</b>
━━━━━━━━━━━━━━━━
📝 命令: ${command}
⚠️ 原因: 参数不完整或格式错误

💡 <b>使用示例</b>
${example}

⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  permissionError: () => `
⛔️ <b>权限不足</b>
━━━━━━━━━━━━━━━━
⚠️ 该命令仅管理员可用

⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  operationSuccess: (operation, details) => `
✅ <b>操作成功</b>
━━━━━━━━━━━━━━━━
📝 操作: ${operation}
📋 详情: ${details}

⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  systemNotice: (title, content) => `
ℹ️ <b>${title}</b>
━━━━━━━━━━━━━━━━
${content}

⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  notification: (title, content) => `
🔔 <b>${title}</b>
━━━━━━━━━━━━━━━━
${content}

⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  statusChange: (user, status, reason = null) => `
📝 <b>用户状态变更</b>
━━━━━━━━━━━━━━━━
👤 用户: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
🔖 用户名: ${user.username ? '@' + user.username : '未设置'}
🆔 ID: <code>${user.id}</code>
📊 状态: ${status}
${reason ? `📋 原因: ${reason}` : ''}

⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  systemStatus: (status, details) => `
🔧 <b>系统状态</b>
━━━━━━━━━━━━━━━━
⚡️ 状态: ${status}
📋 详情: ${details}
🕒 运行时间: ${process.uptime().toFixed(2)}秒

⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  confirmAction: (action, target) => `
⚠️ <b>操作确认</b>
━━━━━━━━━━━━━━━━
📝 操作: ${action}
🎯 目标: ${target}

<i>❗️请确认是否继续执行此操作</i>

⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  actionResult: (action, success, details = null) => `
${success ? '✅' : '❌'} <b>${action}${success ? '成功' : '失败'}</b>
━━━━━━━━━━━━━━━━
📋 详情: ${details || (success ? '操作已完成' : '操作未完成')}
${!success ? '\n💡 建议: 请检查输入参数或稍后重试' : ''}

⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  helpSection: (title, commands) => `
${title}
${commands.map(cmd => `• ${cmd.command} - ${cmd.description}`).join('\n')}`,

  errorSuggestion: (error) => {
    const suggestions = {
      'bot was blocked': '请确认用户是否已解除对机器人的屏蔽',
      'chat not found': '请检查聊天ID是否正确',
      'Too Many Requests': '请降低发送消息的频率',
      'not enough rights': '请检查机器人的权限设置',
      'need administrator rights': '请确保机器人具有管理员权限',
      'message not found': '该消息可能已被删除',
      'group chat was upgraded': '请使用新的超级群组ID'
    }
    
    return suggestions[error] || '请稍后重试或联系管理员'
  },

  sendStatus: (type, success, target) => `
${success ? '✅' : '❌'} <b>消息${success ? '已发送' : '发送失败'}</b>
━━━━━━━━━━━━━━━━
📨 类型: ${type}
🎯 目标: ${target}
${!success ? '\n💡 建议: 请检查目标是否可达' : ''}

⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`
}

const handleError = (error, chatId) => {
  console.error('Error:', error)
  
  const errorMessages = {
    'message not found': templates.systemNotice('消息未找到', 
      '📄 该消息可能已被删除或无法访问\n' +
      '💡 建议：请检查消息是否存在'),
      
    'bot was blocked': templates.systemNotice('机器人已被屏蔽',
      '🚫 用户已屏蔽机器人，无法发送消息\n' +
      '💡 建议：等待用户解除屏蔽后再试'),
      
    'chat not found': templates.systemNotice('聊天未找到',
      '💬 找不到该聊天会话，可能已被删除\n' +
      '💡 建议：检查聊天ID是否正确'),
      
    'Too Many Requests': templates.systemNotice('请求限制',
      '⏳ 请求过于频繁，请稍后再试\n' +
      '💡 建议：降低发送消息的频率\n' +
      '⚡️ 提示：可以等待几秒后重试'),
      
    'not enough rights': templates.systemNotice('权限不足',
      '🔒 Bot没有足够的权限执行该操作\n' +
      '💡 建议：检查Bot的群组权限设置\n' +
      '⚡️ 提示：确保Bot具有发送消息权限'),
      
    'group chat was upgraded': templates.systemNotice('群组已升级',
      '📢 该群组已升级为超级群组\n' +
      '💡 建议：使用新的群组ID\n' +
      '⚡️ 提示：超级群组ID格式为负数'),
      
    'need administrator rights': templates.systemNotice('需要管理员权限',
      '👑 该操作需要管理员权限\n' +
      '💡 建议：确保Bot具有必要的管理权限\n' +
      '⚡️ 提示：检查群组权限设置')
  }

  const errorMsg = Object.entries(errorMessages).find(([key]) => 
    error.message.includes(key)
  )?.[1] || '⚠️ 系统错误'

  return sendMessage({
    chat_id: chatId,
    text: errorMsg,
    parse_mode: 'HTML'
  })
}

const notifyAdmin = async (text) => {
  try {
    await sendMessage({
      chat_id: ADMIN_UID,
      text: text,
      parse_mode: 'HTML'
    })
  } catch (error) {
    console.error('Failed to notify admin:', error)
  }
}

function apiUrl (methodName, params = null) {
  let query = ''
  if (params) {
    query = '?' + new URLSearchParams(params).toString()
  }
  return `https://api.telegram.org/bot${TOKEN}/${methodName}${query}`
}

function requestTelegram(methodName, body, params = null){
  return fetch(apiUrl(methodName, params), body)
    .then(r => r.json())
    .catch(error => {
      console.error(`Telegram API Error (${methodName}):`, error)
      throw error
    })
}

function makeReqBody(body) {
  if(body.reply_markup && typeof body.reply_markup === 'object') {
    body.reply_markup = JSON.stringify(body.reply_markup)
  }
  return {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}

function sendMessage(msg = {}){
  if(msg.reply_markup) {
    msg.reply_markup = JSON.stringify(msg.reply_markup)
  }
  return requestTelegram('sendMessage', makeReqBody(msg))
}

function copyMessage(msg = {}){
  return requestTelegram('copyMessage', makeReqBody(msg))
}

function forwardMessage(msg){
  return requestTelegram('forwardMessage', makeReqBody(msg))
}

async function getChat(chatId) {
  return requestTelegram('getChat', makeReqBody({
    chat_id: chatId
  }))
}

async function getUserProfilePhotos(userId) {
  return requestTelegram('getUserProfilePhotos', makeReqBody({
    user_id: userId,
    limit: 1
  }))
}

async function getFileUrl(file_id) {
  const file = await requestTelegram('getFile', makeReqBody({
    file_id: file_id
  }))
  if(file.ok) {
    return `https://api.telegram.org/file/bot${TOKEN}/${file.result.file_path}`
  }
  return null
}

async function setCommands() {
  try {
    await requestTelegram('setMyCommands', makeReqBody({
      commands: commands.admin,
      scope: {
        type: 'chat',
        chat_id: ADMIN_UID
      }
    }))
    
    await requestTelegram('setMyCommands', makeReqBody({
      commands: commands.guest,
      scope: {
        type: 'default'
      }
    }))
  } catch (error) {
    console.error('Failed to set commands:', error)
  }
}

addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (url.pathname === WEBHOOK) {
    event.respondWith(handleWebhook(event))
  } else if (url.pathname === '/registerWebhook') {
    event.respondWith(registerWebhook(event, url, WEBHOOK, SECRET))
  } else if (url.pathname === '/unRegisterWebhook') {
    event.respondWith(unRegisterWebhook(event))
  } else {
    event.respondWith(new Response('No handler for this request'))
  }
})

async function handleWebhook (event) {
  try {
    if (event.request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== SECRET) {
      return new Response('Unauthorized', { status: 403 })
    }

    const update = await event.request.json()
    event.waitUntil(onUpdate(update))

    return new Response('Ok')
  } catch (error) {
    console.error('Webhook Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

async function onUpdate (update) {
  try {
    if('message' in update) {
      await onMessage(update.message)
    } else if('callback_query' in update) {
      await onCallbackQuery(update.callback_query)
    }
  } catch(error) {
    console.error('Update handling error:', error)
  }
}

async function onMessage(message) {
  try {
    if(message.chat.type === 'group' || message.chat.type === 'supergroup') {
      const botInfo = await requestTelegram('getMe', makeReqBody({}))
      const isBotCommand = message.text?.startsWith('/')
      const isBotMentioned = message.text?.includes('@' + botInfo.result.username)
      const isReplyToBot = message.reply_to_message?.from?.id === botInfo.result.id
      const isAdmin = message.from.id.toString() === ADMIN_UID

      if(isBotCommand) {
        try {
          await requestTelegram('deleteMessage', makeReqBody({
            chat_id: message.chat.id,
            message_id: message.message_id
          }))
        } catch(error) {
          console.error('删除命令消息失败:', error)
        }
      }

      if(!isBotCommand && !isBotMentioned && !isReplyToBot) {
        return
      }

      if(isBotCommand) {
        const command = message.text.split('@')[0]
        
        if(command === '/start' || command === '/info') {
          return handleBasicCommands(message, command, isAdmin)
        }

        if(Object.values(commands.admin).some(cmd => command === '/' + cmd.command)) {
          if(!isAdmin) {
            return sendMessage({
              chat_id: message.chat.id,
              text: templates.permissionError(),
              parse_mode: 'HTML'
            })
          }
          return handleAdminCommand(message)
        }

        if(Object.values(commands.guest).some(cmd => command === '/' + cmd.command)) {
          return handleGuestCommand(message)
        }
      }

      if((isReplyToBot || isBotMentioned) && !isBotCommand) {
        return handleGuestMessage(message)
      }

      return
    }

    if(message.text?.startsWith('/')) {
      try {
        await requestTelegram('deleteMessage', makeReqBody({
          chat_id: message.chat.id,
          message_id: message.message_id
        }))
      } catch(error) {
        console.error('删除命令消息失败:', error)
      }
    }

    return handlePrivateMessage(message)
  } catch(error) {
    console.error('处理消息失败:', error)
    return handleError(error, message.chat.id)
  }
}

async function handleBasicCommands(message, command, isAdmin) {
  if(command === '/start') {
    return sendMessage({
      chat_id: message.chat.id,
      text: isAdmin ? templates.startAdmin() : templates.startGuest(),
      parse_mode: 'HTML'
    })
  } else if(command === '/info') {
    const userInfo = await getChat(message.from.id)
    const isBlocked = await nfd.get('isblocked-' + message.from.id, { type: "json" })
    const botBlocked = !await checkBotAccess(message.from.id)
    
    return sendMessage({
      chat_id: message.chat.id,
      text: templates.userInfo(userInfo.result, isBlocked, botBlocked),
      parse_mode: 'HTML'
    })
  }
}

async function handlePrivateMessage(message) {
  const isAdmin = message.chat.id.toString() === ADMIN_UID

  if(message.text === '/start' || message.text === '/info') {
    return handleBasicCommands(message, message.text, isAdmin)
  }

  if(isAdmin) {
    return handleAdminMessage(message)
  }

  return handleGuestMessage(message)
}

async function handleAdminMessage(message) {
  if(message.text?.startsWith('/')) {
    if(message.text === '/help') {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: templates.help(),
        parse_mode: 'HTML'
      })
    }

    const args = message.text.split(' ')
    const command = args[0]
    const commandHandlers = {
      '/block': handleBlock,
      '/unblock': handleUnBlock,
      '/checkblock': checkBlock,
      '/kk': handleKK,
      '/sendall': handleSendAll,
      '/send': handleSend,
      '/sendunblock': handleSendUnblock,
      '/sendgroup': handleSendGroup,
      '/chat': handleChat,
      '/endchat': handleEndChat
    }

    const handler = commandHandlers[command]
    if(handler) {
      if(command === '/endchat') {
        return handler(message)
      } else if(args.length > 1) {
        return handler(message, args.slice(1))
      } else if(message?.reply_to_message?.chat) {
        return handler(message)
      } else if(command === '/checkblock') {
        return handler(message, [])
      } else if(command === '/kk') {
        return handler(message)
      } else {
        return sendMessage({
          chat_id: ADMIN_UID,
          text: '❌ 请提供必要参数或回复用户消息',
          parse_mode: 'HTML'
        })
      }
    }
  } else {
    const targetUserId = await nfd.get('chat-with-' + ADMIN_UID, { type: "json" })
    if(targetUserId && !message?.reply_to_message) {
      try {
        const isBlocked = await nfd.get('isblocked-' + targetUserId, { type: "json" })
        if(isBlocked) {
          await nfd.delete('chat-with-' + ADMIN_UID)
          return sendMessage({
            chat_id: ADMIN_UID,
            text: '❌ 该用户已被屏蔽，对话已自动结束',
            parse_mode: 'HTML'
          })
        }

        const canAccess = await checkBotAccess(targetUserId)
        if(!canAccess) {
          await nfd.delete('chat-with-' + ADMIN_UID)
          return sendMessage({
            chat_id: ADMIN_UID,
            text: '❌ 该用户已屏蔽机器人，对话已自动结束',
            parse_mode: 'HTML'
          })
        }

        let result
        if(message.photo) {
          result = await sendPhoto({
            chat_id: targetUserId,
            photo: message.photo[message.photo.length - 1].file_id,
            caption: message.caption
          })
        } else if(message.video) {
          result = await sendVideo({
            chat_id: targetUserId,
            video: message.video.file_id,
            caption: message.caption
          })
        } else if(message.document) {
          result = await sendDocument({
            chat_id: targetUserId,
            document: message.document.file_id,
            caption: message.caption
          })
        } else if(message.voice) {
          result = await sendVoice({
            chat_id: targetUserId,
            voice: message.voice.file_id,
            caption: message.caption
          })
        } else if(message.sticker) {
          result = await sendSticker({
            chat_id: targetUserId,
            sticker: message.sticker.file_id
          })
        } else if(message.text) {
          if(message.text.toLowerCase() === '/endchat') {
            await nfd.delete('chat-with-' + ADMIN_UID)
            const userInfo = await getChat(targetUserId)
            return sendMessage({
              chat_id: ADMIN_UID,
              text: `🔚 <b>对话已结束</b>\n━━━━━━━━━━━━━━━━\n👤 用户: <b>${userInfo.result.first_name}</b>\n🆔 ID: <code>${targetUserId}</code>`,
              parse_mode: 'HTML'
            })
          }
          
          result = await sendMessage({
            chat_id: targetUserId,
            text: message.text
          })
        }

        if(!result?.ok) {
          const userInfo = await getChat(targetUserId)
          return sendMessage({
            chat_id: ADMIN_UID,
            text: templates.messageSent('对话消息', [], [{
              ...userInfo.result,
              error: '发送失败'
            }]),
            parse_mode: 'HTML'
          })
        }

        return
      } catch(error) {
        if(error.message.includes('bot was blocked') || error.message.includes('chat not found')) {
          await nfd.delete('chat-with-' + ADMIN_UID)
          const userInfo = await getChat(targetUserId)
          return sendMessage({
            chat_id: ADMIN_UID,
            text: templates.messageSent('对话消息', [], [{
              ...userInfo.result,
              error: '用户已屏蔽机器人'
            }]),
            parse_mode: 'HTML'
          })
        }
        return handleError(error, ADMIN_UID)
      }
    }

    if(message?.reply_to_message?.chat) {
      let guestChatId = await nfd.get('msg-map-' + message?.reply_to_message.message_id, { type: "json" })
      
      try {
        const userInfo = await getChat(guestChatId)
        if(!userInfo.ok) {
          return sendMessage({
            chat_id: ADMIN_UID,
            text: '❌ 无法获取用户信息',
            parse_mode: 'HTML'
          })
        }

        const canAccess = await checkBotAccess(guestChatId)
        if(!canAccess) {
          return sendMessage({
            chat_id: ADMIN_UID,
            text: templates.messageSent('回复消息', [], [{
              ...userInfo.result,
              error: '用户已屏蔽机器人'
            }]),
            parse_mode: 'HTML'
          })
        }

        const result = await copyMessage({
          chat_id: guestChatId,
          from_chat_id: message.chat.id,
          message_id: message.message_id,
        })

        if(!result.ok) {
          return sendMessage({
            chat_id: ADMIN_UID,
            text: templates.messageSent('回复消息', [], [{
              ...userInfo.result,
              error: '发送失败'
            }]),
            parse_mode: 'HTML'
          })
        }
      } catch(error) {
        return handleError(error, ADMIN_UID)
      }
    }
  }
}

async function handleGuestMessage(message) {
  const chatId = message.chat.id
  const fromId = message.from.id
  
  try {
    const isblocked = await nfd.get('isblocked-' + fromId, { type: "json" })
    if(isblocked) {
      return sendMessage({
        chat_id: chatId,
        text: '🚫 您已被封禁访问',
        reply_to_message_id: message.message_id
      })
    }

    const msgMapKeys = await nfd.list({prefix: 'msg-map-'})
    for(const key of msgMapKeys.keys) {
      const oldUserId = await nfd.get(key.name, { type: "json" })
      if(oldUserId === chatId.toString()) {
        await nfd.delete(key.name)
      }
    }

    const forwardReq = await forwardMessage({
      chat_id: ADMIN_UID,
      from_chat_id: chatId,
      message_id: message.message_id
    })

    if(forwardReq.ok) {
      await nfd.put('msg-map-' + forwardReq.result.message_id, chatId)
      
      const currentChat = await nfd.get('chat-with-' + ADMIN_UID, { type: "json" })
      if(currentChat === fromId.toString()) {
        await sendMessage({
          chat_id: ADMIN_UID,
          text: '↑ 来自当前对话用户的消息',
          parse_mode: 'HTML'
        })
      }

      if(message.chat.type === 'group' || message.chat.type === 'supergroup') {
        await sendMessage({
          chat_id: ADMIN_UID,
          text: `📩 来自群组「${message.chat.title}」的消息\n` +
                `👤 发送者: ${message.from.first_name}${message.from.last_name ? ' ' + message.from.last_name : ''}\n` +
                `🆔 用户ID: <code>${message.from.id}</code>`,
          parse_mode: 'HTML'
        })
      }
    }
  } catch (error) {
    return handleError(error, chatId)
  }
}

async function handleBlock(message, args = null) {
  try {
    let userIds = []
    if(args) {
      userIds = args
    } else if(message?.reply_to_message?.message_id) {
      const userId = await nfd.get('msg-map-' + message.reply_to_message.message_id, { type: "json" })
      if(userId) {
        userIds = [userId]
      }
    }

    if(userIds.length === 0) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 请提供用户ID或回复用户消息',
        parse_mode: 'HTML'
      })
    }

    const blockedUsers = []
    for(const userId of userIds) {
      try {
        const userInfo = await getChat(userId)
        if(userInfo.ok) {
          await nfd.put('isblocked-' + userId, true)
          blockedUsers.push(userInfo.result)
        }
      } catch(error) {
        console.error(`屏蔽用户 ${userId} 失败:`, error)
      }
    }

    if(blockedUsers.length === 0) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 未找到有效用户',
        parse_mode: 'HTML'
      })
    }

    return sendMessage({
      chat_id: ADMIN_UID,
      text: templates.blocked(blockedUsers),
      parse_mode: 'HTML'
    })

  } catch(error) {
    console.error('屏蔽用户失败:', error)
    return handleError(error, ADMIN_UID)
  }
}

async function handleUnBlock(message, args = null) {
  try {
    let userIds = []
    if(args) {
      userIds = args
    } else if(message?.reply_to_message?.message_id) {
      const userId = await nfd.get('msg-map-' + message.reply_to_message.message_id, { type: "json" })
      if(userId) {
        userIds = [userId]
      }
    }

    if(userIds.length === 0) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 请提供用户ID或回复用户消息',
        parse_mode: 'HTML'
      })
    }

    const unblockedUsers = []
    for(const userId of userIds) {
      try {
        const userInfo = await getChat(userId)
        if(userInfo.ok) {
          await nfd.delete('isblocked-' + userId)
          unblockedUsers.push(userInfo.result)
        }
      } catch(error) {
        console.error(`取消屏蔽用户 ${userId} 失败:`, error)
      }
    }

    if(unblockedUsers.length === 0) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 未找到有效用户',
        parse_mode: 'HTML'
      })
    }

    return sendMessage({
      chat_id: ADMIN_UID,
      text: templates.unblocked(unblockedUsers),
      parse_mode: 'HTML'
    })

  } catch(error) {
    console.error('取消屏蔽用户失败:', error)
    return handleError(error, ADMIN_UID)
  }
}

async function checkBlock(message, args = null) {
  try {
    if(args && args.length > 0) {
      const userInfo = await getChat(args[0])
      if(!userInfo.ok) {
        return sendMessage({
          chat_id: ADMIN_UID,
          text: '❌ 无法获取用户信息',
          parse_mode: 'HTML'
        })
      }

      const isBlocked = await nfd.get('isblocked-' + args[0], { type: "json" })
      const botBlocked = await checkBotAccess(args[0])

      if(!isBlocked && await nfd.get('isblocked-' + args[0])) {
        await nfd.delete('isblocked-' + args[0])
      }

      return sendMessage({
        chat_id: ADMIN_UID,
        text: templates.userInfo(userInfo.result, isBlocked || false, !botBlocked),
        parse_mode: 'HTML'
      })
    } else {
      const blockedUsers = []
      const keys = await nfd.list({ prefix: 'isblocked-' })
      
      for(const key of keys.keys) {
        const userId = key.name.replace('isblocked-', '')
        try {
          const isBlocked = await nfd.get(key.name, { type: "json" })
          if(!isBlocked) {
            await nfd.delete(key.name)
            continue
          }

          const userInfo = await getChat(userId)
          if(userInfo.ok) {
            blockedUsers.push(userInfo.result)
          } else {
            await nfd.delete(key.name)
          }
        } catch(error) {
          console.error(`获取用户 ${userId} 信息失败:`, error)
          await nfd.delete(key.name)
        }
      }

      if(blockedUsers.length === 0) {
        return sendMessage({
          chat_id: ADMIN_UID,
          text: '✅ 当前没有被屏蔽的用户',
          parse_mode: 'HTML'
        })
      }

      return sendMessage({
        chat_id: ADMIN_UID,
        text: templates.blocked(blockedUsers),
        parse_mode: 'HTML'
      })
    }
  } catch(error) {
    console.error('检查用户状态失败:', error)
    return handleError(error, ADMIN_UID)
  }
}

async function handleKK(message, userIds = null) {
  try {
    let guestChatIds = []
    if(userIds) {
      guestChatIds = userIds
    } else if(message?.reply_to_message?.message_id) {
      const guestChatId = await nfd.get('msg-map-' + message.reply_to_message.message_id, { type: "json" })
      if(guestChatId) {
        guestChatIds = [guestChatId]
      } else {
        return sendMessage({
          chat_id: ADMIN_UID,
          text: '❌ 无法获取用户信息，请确保回复的是用户消息',
          parse_mode: 'HTML'
        })
      }
    } else {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 请提供用户ID或回复用户消息',
        parse_mode: 'HTML'
      })
    }

    const userInfos = []
    for(const id of guestChatIds) {
      try {
        const userInfo = await getChat(id)
        if(userInfo.ok) {
          const photos = await getUserProfilePhotos(id)
          const isBlocked = await nfd.get('isblocked-' + id, { type: "json" })
          const botBlocked = await checkBotBlockedByMessage(id)
          
          userInfos.push({
            info: userInfo.result,
            photo: photos.ok && photos.result.total_count > 0 ? photos.result.photos[0][0].file_id : null,
            isBlocked: isBlocked || false,
            botBlocked: botBlocked
          })
        }
      } catch(error) {
        console.error(`获取用户 ${id} 信息失败:`, error)
      }
    }

    if(userInfos.length === 0) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 未找到有效用户信息',
        parse_mode: 'HTML'
      })
    }

    for(const user of userInfos) {
      try {
        const currentChat = await nfd.get('chat-with-' + ADMIN_UID, { type: "json" })
        const chatActive = currentChat === user.info.id.toString()
        
        const messageOptions = templates.userActions(user.info, user.isBlocked, chatActive)
        if(user.photo) {
          await sendPhoto({
            chat_id: ADMIN_UID,
            photo: user.photo,
            caption: messageOptions.text,
            parse_mode: 'HTML',
            reply_markup: messageOptions.reply_markup
          })
        } else {
          await sendMessage({
            chat_id: ADMIN_UID,
            ...messageOptions,
            parse_mode: 'HTML'
          })
        }
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch(error) {
        console.error(`发送用户信息失败:`, error)
        await sendMessage({
          chat_id: ADMIN_UID,
          text: '❌ 发送用户信息失败',
          parse_mode: 'HTML'
        })
      }
    }

    if(userInfos.length > 1) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: `✅ 已获取 ${userInfos.length} 个用户的信息`,
        parse_mode: 'HTML'
      })
    }

  } catch(error) {
    console.error('获取用户信息错误:', error)
    return handleError(error, ADMIN_UID)
  }
}

async function handleSendAll(message, args) {
  if(!args || args.length === 0) {
    return sendMessage({
      chat_id: ADMIN_UID,
      text: '❌ 请提供要发送的消息内容',
      parse_mode: 'HTML'
    })
  }

  const content = args.join(' ')
  const msgMapKeys = await nfd.list({prefix: 'msg-map-'})
  const userIdSet = new Set()
  const sentUsers = []

  // 从 msg-map 中收集所有不重复的用户ID
  for(const key of msgMapKeys.keys) {
    const userId = await nfd.get(key.name, { type: "json" })
    if(userId && userId !== ADMIN_UID && !userIdSet.has(userId)) {
      userIdSet.add(userId)
      try {
        const userInfo = await getChat(userId)
        if(userInfo.ok) {
          const canAccess = await checkBotAccess(userId)
          if(canAccess) {
            await sendMessage({
              chat_id: userId,
              text: content,
              parse_mode: 'HTML'
            })
            sentUsers.push(userInfo.result)
          }
        }
      } catch (error) {
        console.error(`发送消息失败 ${userId}:`, error)
      }
    }
  }

  return notifyAdmin(templates.messageSent('全部用户', sentUsers))
}

async function handleSend(message, args) {
  if(args.length < 2) {
    return sendMessage({
      chat_id: ADMIN_UID,
      text: '❌ 请提供用户ID和消息内容',
      parse_mode: 'HTML'
    })
  }

  const userIds = args[0].split(',')
  const content = args.slice(1).join(' ')
  const sentUsers = []
  const failedUsers = []

  for(const userId of userIds) {
    try {
      const userInfo = await getChat(userId)
      if(userInfo.ok) {
        const canAccess = await checkBotAccess(userId)
        if(!canAccess) {
          failedUsers.push({
            ...userInfo.result,
            error: '用户已屏蔽机器人'
          })
          continue
        }

        const result = await sendMessage({
          chat_id: userId,
          text: content,
          parse_mode: 'HTML'
        })

        if(result.ok) {
          sentUsers.push(userInfo.result)
        } else {
          failedUsers.push({
            ...userInfo.result,
            error: '发送失败'
          })
        }
      }
    } catch (error) {
      console.error(`发送消息失败 ${userId}:`, error)
      try {
        const userInfo = await getChat(userId)
        if(userInfo.ok) {
          failedUsers.push({
            ...userInfo.result,
            error: error.message.includes('bot was blocked') ? '用户已屏蔽机器人' : '发送失败'
          })
        }
      } catch(e) {
        console.error(`获取用户信息失败 ${userId}:`, e)
      }
    }
  }

  return notifyAdmin(templates.messageSent('指定用户', sentUsers, failedUsers))
}

async function handleSendUnblock(message, args) {
  if(!args || args.length === 0) {
    return sendMessage({
      chat_id: ADMIN_UID,
      text: '❌ 请提供要发送的消息内容',
      parse_mode: 'HTML'
    })
  }

  const content = args.join(' ')
  const msgMapKeys = await nfd.list({prefix: 'msg-map-'})
  const userIdSet = new Set()
  const sentUsers = []

  // 从 msg-map 中收集所有不重复的未被屏蔽用户ID
  for(const key of msgMapKeys.keys) {
    const userId = await nfd.get(key.name, { type: "json" })
    if(userId && userId !== ADMIN_UID && !userIdSet.has(userId)) {
      userIdSet.add(userId)
      try {
        const isBlocked = await nfd.get('isblocked-' + userId, { type: "json" })
        if(!isBlocked) {
          const userInfo = await getChat(userId)
          if(userInfo.ok) {
            const canAccess = await checkBotAccess(userId)
            if(canAccess) {
              await sendMessage({
                chat_id: userId,
                text: content,
                parse_mode: 'HTML'
              })
              sentUsers.push(userInfo.result)
            }
          }
        }
      } catch (error) {
        console.error(`发送消息失败 ${userId}:`, error)
      }
    }
  }

  return notifyAdmin(templates.messageSent('未屏蔽用户', sentUsers))
}

async function sendPlainText (chatId, text) {
  return sendMessage({
    chat_id: chatId,
    text,
    parse_mode: 'Markdown'
  })
}

async function registerWebhook (event, requestUrl, suffix, secret) {
  try {
    const webhookUrl = `${requestUrl.protocol}//${requestUrl.hostname}${suffix}`
    const r = await fetch(apiUrl('setWebhook', { 
      url: webhookUrl, 
      secret_token: secret,
      max_connections: 100
    })).then(r => r.json())
    return new Response('ok' in r && r.ok ? 
      `✅ <b>Webhook设置成功</b>
━━━━━━━━━━━━━━━━
🔗 URL: ${webhookUrl}
⚡️ 状态: 已激活
⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}` 
      : JSON.stringify(r, null, 2), 
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    )
  } catch (error) {
    return new Response(
      `❌ <b>Webhook设置失败</b>
━━━━━━━━━━━━━━━━
⚠️ 错误: ${error.message}
⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`, 
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    )
  }
}

async function unRegisterWebhook(event) {
  try {
    const r = await fetch(apiUrl('setWebhook', { url: '' })).then(r => r.json())
    return new Response('ok' in r && r.ok ? 
      `✅ <b>Webhook已移除</b>
━━━━━━━━━━━━━━━━
⚡️ 状态: 已停用
⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}` 
      : JSON.stringify(r, null, 2),
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    )
  } catch (error) {
    return new Response(
      `❌ <b>Webhook移除失败</b>
━━━━━━━━━━━━━━━━
⚠️ 错误: ${error.message}
⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    )
  }
}

function sendPhoto(msg = {}) {
  if(msg.reply_markup) {
    msg.reply_markup = JSON.stringify(msg.reply_markup)
  }
  return requestTelegram('sendPhoto', makeReqBody(msg))
}

async function checkBotAccess(chatId) {
  try {
    const chatInfo = await getChat(chatId)
    return chatInfo.ok
  } catch(error) {
    if(error.message.includes('bot was blocked') || error.message.includes('chat not found')) {
      return false
    }
    throw error
  }
}

async function checkBotBlockedByMessage(chatId) {
  try {
    const testMsg = await sendMessage({
      chat_id: chatId,
      text: '🔍'
    })
    
    if(testMsg.ok) {
      await requestTelegram('deleteMessage', makeReqBody({
        chat_id: chatId,
        message_id: testMsg.result.message_id
      }))
      return false
    }
    return true
  } catch(error) {
    if(error.message.includes('bot was blocked') || error.message.includes('chat not found')) {
      return true
    }
    throw error
  }
}

async function handleSendGroup(message, args) {
  if(args.length < 2) {
    return sendMessage({
      chat_id: ADMIN_UID,
      text: templates.paramError('/sendgroup', '/sendgroup -123456789 这是要发送的消息\n\n💡 注意: 群组ID需要带负号'),
      parse_mode: 'HTML'
    })
  }

  const groupId = args[0]
  const content = args.slice(1).join(' ')

  try {
    const groupInfo = await getChat(groupId)
    if(!groupInfo.ok) {
      throw new Error('chat not found')
    }

    if(groupInfo.result.type !== 'group' && groupInfo.result.type !== 'supergroup') {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: `❌ <b>类型错误</b>
━━━━━━━━━━━━━━━━
👥 群组: <b>${groupInfo.result.title}</b>
🆔 ID: <code>${groupId}</code>
⚠️ 错误: 指定的ID不是群组

⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,
        parse_mode: 'HTML'
      })
    }

    const botMember = await requestTelegram('getChatMember', makeReqBody({
      chat_id: groupId,
      user_id: (await requestTelegram('getMe', makeReqBody({}))).result.id
    }))

    if(!botMember.ok || botMember.result.status === 'left' || botMember.result.status === 'kicked') {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: `❌ <b>权限错误</b>
━━━━━━━━━━━━━━━━
👥 群组: <b>${groupInfo.result.title}</b>
🆔 ID: <code>${groupId}</code>
⚠️ 错误: Bot不是群组成员

⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,
        parse_mode: 'HTML'
      })
    }

    const result = await sendMessage({
      chat_id: groupId,
      text: content,
      parse_mode: 'HTML'
    })

    return sendMessage({
      chat_id: ADMIN_UID,
      text: templates.groupMessageSent(groupInfo.result, result.ok, result.ok ? null : '发送失败'),
      parse_mode: 'HTML'
    })

  } catch(error) {
    console.error('发送群组消息失败:', error)
    return handleError(error, ADMIN_UID)
  }
}

async function onCallbackQuery(query) {
  try {
    const [action, userId] = query.data.split(':')

    if(action === 'close') {
      return await requestTelegram('deleteMessage', makeReqBody({
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
      }))
    }

    const userInfo = await getChat(userId)
    
    if(!userInfo.ok) {
      return answerCallbackQuery(query.id, '❌ 无法获取用户信息')
    }

    const isBlocked = await nfd.get('isblocked-' + userId, { type: "json" })
    const currentChat = await nfd.get('chat-with-' + ADMIN_UID, { type: "json" })
    const isChatting = currentChat === userId

    const updateMessage = async (text, markup) => {
      return await requestTelegram('editMessageText', makeReqBody({
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        text: text,
        parse_mode: 'HTML',
        reply_markup: markup
      }))
    }

    switch(action) {
      case 'chat':
        if(isChatting) {
          return answerCallbackQuery(query.id, '❌ 已经在对话中', true)
        }
        
        if(currentChat && currentChat !== userId) {
          return answerCallbackQuery(query.id, '❌ 请先结束当前对话', true)
        }

        await nfd.put('chat-with-' + ADMIN_UID, userId)
        
        const chatMessage = templates.userActions(userInfo.result, isBlocked, true)
        await updateMessage(chatMessage.text, chatMessage.reply_markup)

        await sendMessage({
          chat_id: ADMIN_UID,
          text: templates.chatStarted(displayType, displayName, targetUserId),
          parse_mode: 'HTML'
        })
        
        await answerCallbackQuery(query.id, '✅ 对话已开启')
        break

      case 'endchat':
        if(!isChatting) {
          return answerCallbackQuery(query.id, '❌ 不是当前对话', true)
        }

        await nfd.delete('chat-with-' + ADMIN_UID)
        
        const endChatMessage = templates.userActions(userInfo.result, isBlocked, false)
        await updateMessage(endChatMessage.text, endChatMessage.reply_markup)

        await sendMessage({
          chat_id: ADMIN_UID,
          text: templates.chatEnded(userInfo.result, currentChat),
          parse_mode: 'HTML'
        })
        
        await answerCallbackQuery(query.id, '✅ 对话已结束')
        break

      case 'block':
        await nfd.put('isblocked-' + userId, true)
        if(isChatting) {
          await nfd.delete('chat-with-' + ADMIN_UID)
        }
        const blockMessage = templates.userActions(userInfo.result, true, false)
        await updateMessage(blockMessage.text, blockMessage.reply_markup)
        await answerCallbackQuery(query.id, '✅ 用户已被屏蔽')
        break

      case 'unblock':
        await nfd.put('isblocked-' + userId, false)
        const unblockMessage = templates.userActions(userInfo.result, false, isChatting)
        await updateMessage(unblockMessage.text, unblockMessage.reply_markup)
        await answerCallbackQuery(query.id, '✅ 已取消屏蔽')
        break
    }
  } catch(error) {
    console.error('Callback query error:', error)
    await answerCallbackQuery(query.id, '❌ 操作失败')
  }
}

function answerCallbackQuery(callback_query_id, text = null, show_alert = false) {
  return requestTelegram('answerCallbackQuery', makeReqBody({
    callback_query_id,
    text,
    show_alert
  }))
}

function editMessageText(msg) {
  if(msg.reply_markup) {
    msg.reply_markup = JSON.stringify(msg.reply_markup)
  }
  return requestTelegram('editMessageText', makeReqBody(msg))
}

function sendVideo(msg = {}) {
  return requestTelegram('sendVideo', makeReqBody(msg))
}

function sendDocument(msg = {}) {
  return requestTelegram('sendDocument', makeReqBody(msg))
}

function sendVoice(msg = {}) {
  return requestTelegram('sendVoice', makeReqBody(msg))
}

function sendSticker(msg = {}) {
  return requestTelegram('sendSticker', makeReqBody(msg))
}

async function handleChat(message, args = null) {
  try {
    let targetUserId
    
    if(args && args.length > 0) {
      targetUserId = args[0]
    } else if(message?.reply_to_message?.message_id) {
      targetUserId = await nfd.get('msg-map-' + message.reply_to_message.message_id, { type: "json" })
    } else {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 请提供用户ID或回复用户消息',
        parse_mode: 'HTML'
      })
    }

    const currentChat = await nfd.get('chat-with-' + ADMIN_UID, { type: "json" })
    if(currentChat) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 请先使用 /endchat 结束当前对话',
        parse_mode: 'HTML'
      })
    }

    const userInfo = await getChat(targetUserId)
    if(!userInfo.ok) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 无法获取用户信息',
        parse_mode: 'HTML'
      })
    }

    const isBlocked = await nfd.get('isblocked-' + targetUserId, { type: "json" })
    if(isBlocked) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 该用户已被屏蔽',
        parse_mode: 'HTML'
      })
    }

    const canAccess = await checkBotAccess(targetUserId)
    if(!canAccess) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 该用户已屏蔽机器人',
        parse_mode: 'HTML'
      })
    }

    await nfd.put('chat-with-' + ADMIN_UID, targetUserId)

    let displayName = ''
    let displayType = ''
    
    if(userInfo.result.type === 'group' || userInfo.result.type === 'supergroup') {
      displayName = userInfo.result.title
      displayType = '群组'
    } else {
      displayName = userInfo.result.first_name + (userInfo.result.last_name ? ' ' + userInfo.result.last_name : '')
      displayType = '用户'
    }

    return sendMessage({
      chat_id: ADMIN_UID,
      text: templates.chatStarted(displayType, displayName, targetUserId),
      parse_mode: 'HTML'
    })

  } catch(error) {
    console.error('开启对话失败:', error)
    return sendMessage({
      chat_id: ADMIN_UID,
      text: templates.chatError('开启对话失败，请稍后重试'),
      parse_mode: 'HTML'
    })
  }
}

async function handleEndChat(message) {
  try {
    const currentChat = await nfd.get('chat-with-' + ADMIN_UID, { type: "json" })
    if(!currentChat) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: templates.chatError('当前没有进行中的对话'),
        parse_mode: 'HTML'
      })
    }

    const userInfo = await getChat(currentChat)
    if(!userInfo.ok) {
      await nfd.delete('chat-with-' + ADMIN_UID)
      return sendMessage({
        chat_id: ADMIN_UID,
        text: templates.chatError('无法获取用户信息，对话已强制结束'),
        parse_mode: 'HTML'
      })
    }

    await nfd.delete('chat-with-' + ADMIN_UID)

    return sendMessage({
      chat_id: ADMIN_UID,
      text: templates.chatEnded(userInfo.result, currentChat),
      parse_mode: 'HTML'
    })

  } catch(error) {
    console.error('结束对话失败:', error)
    return sendMessage({
      chat_id: ADMIN_UID,
      text: templates.chatError('结束对话失败，请稍后重试'),
      parse_mode: 'HTML'
    })
  }
}

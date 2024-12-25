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
    {command: 'sendgroup', description: '在指定群组发送消息'}
  ],
  guest: [
    {command: 'start', description: '开始使用机器人'},
    {command: 'info', description: '查看个人信息'}
  ]
}

const enable_notification = true

const templates = {
  help: () => `
📝 <b>管理员命令使用说明</b>
━━━━━━━━━━━━━━━━
1️⃣ 回复用户消息并直接输入文字 - 回复用户
2️⃣ /block [用户ID1 用户ID2...] - 屏蔽用户
3️⃣ /unblock [用户ID1 用户ID2...] - 解除屏蔽
4️⃣ /checkblock [用户ID] - 检查用户状态,不带ID显示所有被屏蔽用户
5️⃣ /kk [用户ID1 用户ID2...] - 查看用户详细信息
6️⃣ /sendall [消息内容] - 给所有用户发送消息
7️⃣ /send [用户ID1,用户ID2...] [消息内容] - 给指定用户发送消息
8️⃣ /sendunblock [消息内容] - 给未屏蔽用户发送消息
9️⃣ /help - 显示此帮助信息
🔟 /sendgroup [群组ID] [消息内容] - 在指定群组发送消息

<i>❗️注意: /block、/unblock、/checkblock、/kk 可以回复消息或直接输入用户ID</i>

<i>❗️注意: Bot需要是群组成员且拥有发送消息权限</i>
`,

  userInfo: (user, isBlocked = false, botBlocked = false) => `📌 基本信息
┣ 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
┣ 用户名: ${user.username ? '@' + user.username : '未设置'}
┣ ID: <code>${user.id}</code>
┣ 状态: ${isBlocked ? '🚫 已屏蔽' : '✅ 正常'}
┗ Bot状态: ${botBlocked ? '🚫 已屏蔽Bot' : '✅ 正常'}

⏰ 查询时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  blocked: (users) => `
✅ <b>用户已被屏蔽</b>
━━━━━━━━━━━━━━━━
${users.map(user => `👤 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
🔖 用户名: ${user.username ? '@' + user.username : '未设置'}
🆔 ID: <code>${user.id}</code>`).join('\n\n')}
⏰ 操作时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}
`,

  unblocked: (users) => `
🔓 <b>已解除用户屏蔽</b>
━━━━━━━━━━━━━━━━
${users.map(user => `👤 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
🔖 用户名: ${user.username ? '@' + user.username : '未设置'}
🆔 ID: <code>${user.id}</code>`).join('\n\n')}
⏰ 操作时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}
`,

  blockStatus: (users) => `
ℹ️ <b>用户状态查询</b>
━━━━━━━━━━━━━━━━
${users.map(user => `👤 昵称: <b>${user.info.first_name}${user.info.last_name ? ' ' + user.info.last_name : ''}</b>
🔖 用户名: ${user.info.username ? '@' + user.info.username : '未设置'}
🆔 ID: <code>${user.info.id}</code>
📊 状态: ${user.blocked ? '🚫 已屏蔽' : '✅ 正常'}`).join('\n\n')}
⏰ 查询时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}
`,

  allBlockedUsers: (users) => `
📊 <b>所有被屏蔽用户</b>
━━━━━━━━━━━━━━━━
${users.length ? users.map(user => `👤 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
🔖 用户名: ${user.username ? '@' + user.username : '未设置'}
🆔 ID: <code>${user.id}</code>`).join('\n\n') : '✅ 暂无被屏蔽用户'}
⏰ 查询时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}
`,

  messageSent: (type, users, failed = []) => `
<b>${failed.length > 0 ? '❌ 消息发送失败' : '✅ 消息发送成功'}</b>
━━━━━━━━━━━━━━━━
📨 发送类型: ${type}
📊 发送数量: ${users.length}条

${users.map(user => 
  `👤 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
🔖 用户名: ${user.username ? '@' + user.username : '未设置'}
🆔 ID: <code>${user.id}</code>`).join('\n\n')}

${failed.map(user => 
  `👤 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
🔖 用户名: ${user.username ? '@' + user.username : '未设置'}
🆔 ID: <code>${user.id}</code>
⚠️ 原因: ${user.error}`).join('\n\n')}

⏰ 发送时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}
`,

  startAdmin: () => `
🌸 <b>Akikawa Bot 使用指南</b>
━━━━━━━━━━━━━━━━

📱 <b>主要功能</b>
• 消息转发 - 自动转发用户消息给管理员
• 快速回复 - 管理员可直接回复与用户对话
• 安全监控 - 实时检测可疑用户并通知
• 定时检查 - 每小时自动检查用户状态

⚡️ <b>管理命令</b>
命令支持两种使用方式:
• 回复用户消息使用命令
• 直接输入命令+用户ID (根据命令类型使用不同分隔符)

📋 <b>基础命令</b>
/help - 显示帮助信息
/block - 屏蔽用户
/unblock - 解除屏蔽
/checkblock - 检查屏蔽状态
/kk - 查看用户详情
/info - 查看个人信息

📨 <b>消息命令</b>
/sendall - 群发所有用户
/send - 发送指定用户
/sendunblock - 发送未屏蔽用户

💡 <b>使用示例</b>
• 回复消息: 直接回复转发的消息
• 查看用户: /kk 123456789 987654321
• 屏蔽用户: /block 123456789 987654321
• 群发消息: /send 123456789,987654321 这是群发消息

⚠️ <b>注意事项</b>
• 查看/屏蔽类命令使用空格分隔多ID
  示例: /block 123456 789012
• 发送类命令使用逗号分隔多ID
  示例: /send 123456,789012 消息内容
• 系统自动检测可疑用户
• 所有操作均有详细记录

🔔 <b>使用建议</b>
• 定期检查可疑用户提醒
• 合理使用群发功能
• 保持命令格式规范
• 及时处理用户反馈

🔗 <b>项目地址</b>
• GitHub: <a href="https://github.com/misak10/nfd">misak10/nfd</a>
`,

  startGuest: () => `
🎉 <b>欢迎使用机器人</b>
━━━━━━━━━━━━━━━━
您可以:

1️⃣ 发送任何消息给管理员
2️⃣ 使用 /info 查看个人信息

<i>💡 提示: 管理员会尽快回复您的消息</i>`,

  groupMessageSent: (group, success = true, error = null) => `
${success ? '✅ 群组消息发送成功' : '❌ 群组消息发送失败'}
━━━━━━━━━━━━━━━━
👥 群组名称: <b>${group.title}</b>
🆔 群组ID: <code>${group.id}</code>
${error ? `⚠️ 错误信息: ${error}` : ''}
⏰ 发送时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}
`,
}

const handleError = (error, chatId) => {
  console.error('Error:', error)
  
  const errorMessages = {
    'message not found': '消息未找到',
    'bot was blocked': '❌ 机器人已被用户屏蔽',
    'chat not found': '❌ 找不到该聊天',
    'Too Many Requests': '⚠️ 请求过于频繁,请稍后再试',
    'not enough rights': '❌ Bot没有足够的权限',
    'group chat was upgraded': '❌ 群组已升级为超级群组',
    'need administrator rights': '❌ 需要管理员权限'
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

function makeReqBody(body){
  return {
    method:'POST',
    headers:{
      'content-type':'application/json'
    },
    body:JSON.stringify(body)
  }
}

function sendMessage(msg = {}){
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
    if ('message' in update) {
      await onMessage(update.message)
    }
  } catch (error) {
    console.error('Update handling error:', error)
  }
}

// 添加消息类型常量
const MessageType = {
  COMMAND: 'command',
  MENTION: 'mention',
  REPLY: 'reply',
  NORMAL: 'normal'
}

// 添加消息处理工具函数
const messageUtils = {
  getMessageType(message, botInfo) {
    if(message.text?.startsWith('/')) return MessageType.COMMAND
    
    const isBotMentioned = message.text?.includes('@' + botInfo.username) || 
                          message.entities?.some(entity => 
                            entity.type === 'mention' && 
                            message.text.substring(entity.offset, entity.offset + entity.length) === '@' + botInfo.username
                          )
    if(isBotMentioned) return MessageType.MENTION
    
    if(message.reply_to_message?.from?.id === botInfo.id) return MessageType.REPLY
    
    return MessageType.NORMAL
  },

  isGroupChat(message) {
    return message.chat.type === 'group' || message.chat.type === 'supergroup'
  },

  isAdmin(message) {
    return message.from.id.toString() === ADMIN_UID
  },

  getCommand(message) {
    return message.text?.split('@')[0] // 去掉可能的 @botname
  }
}

// 优化 onMessage 函数
async function onMessage(message) {
  try {
    const botInfo = await requestTelegram('getMe', makeReqBody({}))
    if(!botInfo.ok) return

    const messageType = messageUtils.getMessageType(message, botInfo.result)
    const isGroup = messageUtils.isGroupChat(message)
    const isAdmin = messageUtils.isAdmin(message)

    // 群组消息处理
    if(isGroup) {
      if(messageType === MessageType.NORMAL) return
      return handleGroupMessage(message, messageType, isAdmin)
    }

    // 私聊消息处理
    return handlePrivateMessage(message)
  } catch(error) {
    return handleError(error, message.chat.id)
  }
}

// 添加群组消息处理函数
async function handleGroupMessage(message, messageType, isAdmin) {
  if(messageType === MessageType.COMMAND) {
    const command = messageUtils.getCommand(message)
    
    // 处理基础命令
    if(command === '/start' || command === '/info') {
      return handleBasicCommands(message, command, isAdmin)
    }

    // 处理管理员命令
    if(Object.values(commands.admin).some(cmd => command === '/' + cmd.command)) {
      if(!isAdmin) {
        return sendMessage({
          chat_id: message.chat.id,
          text: '⚠️ 您没有权限使用此命令',
          parse_mode: 'HTML'
        })
      }
      return handleAdminMessage(message)
    }
  }

  // 处理@bot或回复消息
  if(messageType === MessageType.MENTION || messageType === MessageType.REPLY) {
    return handleGuestMessage(message)
  }
}

async function handleBasicCommands(message, command, isAdmin) {
  if(command === '/start') {
    if(isAdmin) {
      await setCommands()
    }
    return sendMessage({
      chat_id: message.chat.id,
      text: isAdmin ? templates.startAdmin() : templates.startGuest(),
      parse_mode: 'HTML'
    })
  }

  if(command === '/info') {
    const userInfo = await getChat(message.from.id)
    if(!userInfo.ok) {
      return sendMessage({
        chat_id: message.chat.id,
        text: '❌ 无法获取用户信息',
        parse_mode: 'HTML'
      })
    }
    return sendMessage({
      chat_id: message.chat.id,
      text: templates.userInfo(userInfo.result),
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
    '/sendgroup': handleSendGroup
  }

  const handler = commandHandlers[command]
  if(handler) {
    if(args.length > 1) {
      return handler(message, args.slice(1))
    } else if(message?.reply_to_message?.chat) {
      return handler(message)
    } else if(command === '/checkblock') {
      return handler(message, [])
    } else {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 请提供必要参数或回复用户消息',
        parse_mode: 'HTML'
      })
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

      if(result.ok) {
        return
      } else {
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
      if(error.message.includes('bot was blocked') || error.message.includes('chat not found')) {
        const userInfo = await getChat(guestChatId)
        if(userInfo.ok) {
          return sendMessage({
            chat_id: ADMIN_UID,
            text: templates.messageSent('回复消息', [], [{
              ...userInfo.result,
              error: '用户已屏蔽机器人'
            }]),
            parse_mode: 'HTML'
          })
        }
      }
      return handleError(error, ADMIN_UID)
    }
  }

  return sendMessage({
    chat_id: ADMIN_UID,
    text: templates.help(),
    parse_mode: 'HTML'
  })
}

async function handleGuestMessage(message) {
  const chatId = message.chat.id
  const fromId = message.from.id
  
  try {
    // 检查用户是否被封禁
    const isblocked = await nfd.get('isblocked-' + fromId, { type: "json" })
    if(isblocked) {
      return sendMessage({
        chat_id: chatId,
        text: '🚫 您已被封禁访问',
        reply_to_message_id: message.message_id
      })
    }

    // 转发消息给管理员
    const forwardReq = await forwardMessage({
      chat_id: ADMIN_UID,
      from_chat_id: chatId,
      message_id: message.message_id
    })

    if(forwardReq.ok) {
      // 存储消息映射
      await nfd.put('msg-map-' + forwardReq.result.message_id, chatId)
      
      // 更新最后活动时间
      if(enable_notification) {
        const lastMsgTime = await nfd.get('lastmsg-' + fromId, { type: "json" })
        const now = Date.now()
        if(!lastMsgTime || now - lastMsgTime > NOTIFY_INTERVAL) {
          await nfd.put('lastmsg-' + fromId, now)
        }
      }

      // 如果是群组消息，发送提示
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

async function handleBlock(message, userIds = null) {
  try {
    let guestChatIds = []
    if(userIds) {
      guestChatIds = userIds
    } else {
      const guestChatId = await nfd.get('msg-map-' + message.reply_to_message.message_id, { type: "json" })
      guestChatIds = [guestChatId]
    }
    
    guestChatIds = guestChatIds.filter(id => id !== ADMIN_UID)
    
    if(guestChatIds.length === 0) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 无效的用户ID',
        parse_mode: 'HTML'
      })
    }

    const results = []
    const alreadyBlocked = []

    for(const id of guestChatIds) {
      try {
        const userInfo = await getChat(id)
        if(!userInfo.ok) continue

        const blockStatus = await nfd.get('isblocked-' + id, { type: "json" })
        if(blockStatus) {
          alreadyBlocked.push(userInfo.result)
        } else {
          await nfd.put('isblocked-' + id, true)
          results.push(userInfo.result)
        }
      } catch(error) {
        console.error(`获取用户 ${id} 信息失败:`, error)
      }
    }

    let responseText = ''
    
    if(results.length > 0) {
      responseText += templates.blocked(results)
    }
    
    if(alreadyBlocked.length > 0) {
      responseText += `\n\n⚠️ <b>以下用户已处于屏蔽状态</b>\n━━━━━━━━━━━━━━━━\n${alreadyBlocked.map(user => 
        `👤 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>\n` +
        `🔖 用户名: ${user.username ? '@' + user.username : '未设置'}\n` +
        `🆔 ID: <code>${user.id}</code>`
      ).join('\n\n')}`
    }

    if(!responseText) {
      responseText = '❌ 操作失败：未找到有效用户'
    }
    
    return notifyAdmin(responseText)
  } catch(error) {
    console.error('屏蔽用户错误:', error)
    return handleError(error, ADMIN_UID)
  }
}

async function handleUnBlock(message, userIds = null) {
  try {
    let guestChatIds = []
    if(userIds) {
      guestChatIds = userIds
    } else {
      const guestChatId = await nfd.get('msg-map-' + message.reply_to_message.message_id, { type: "json" })
      guestChatIds = [guestChatId]
    }
    
    if(guestChatIds.length === 0) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 无效的用户ID',
        parse_mode: 'HTML'
      })
    }

    const results = []

    for(const id of guestChatIds) {
      try {
        const userInfo = await getChat(id)
        if(!userInfo.ok) continue

        await nfd.put('isblocked-' + id, false)
        results.push(userInfo.result)
      } catch(error) {
        console.error(`获取用户 ${id} 信息失败:`, error)
      }
    }

    if(results.length === 0) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 操作失败：未找到有效用户',
        parse_mode: 'HTML'
      })
    }
    
    return notifyAdmin(templates.unblocked(results))
  } catch(error) {
    console.error('解除屏蔽错误:', error)
    return handleError(error, ADMIN_UID)
  }
}

async function checkBlock(message, userIds = null) {
  try {
    if(!userIds || userIds.length === 0) {
      const blockedUsers = await nfd.list({prefix: 'isblocked-'})
      const blockedInfos = []
      const processedIds = new Set()

      for(const key of blockedUsers.keys) {
        const id = key.name.replace('isblocked-', '')
        if(processedIds.has(id)) continue
        
        const isBlocked = await nfd.get(key.name, { type: "json" })
        if(isBlocked) {
          const userInfo = await getChat(id)
          if(userInfo.ok) {
            blockedInfos.push(userInfo.result)
            processedIds.add(id)
          }
        }
      }
      return notifyAdmin(templates.allBlockedUsers(blockedInfos))
    }
    
    const results = []
    const processedIds = new Set()

    for(const id of userIds) {
      if(processedIds.has(id)) continue
      
      try {
        const userInfo = await getChat(id)
        if(userInfo.ok) {
          const isBlocked = await nfd.get('isblocked-' + id, { type: "json" })
          const lastMsgTime = await nfd.get('lastmsg-' + id, { type: "json" })
          
          results.push({
            info: userInfo.result,
            blocked: isBlocked || false,
            lastActive: lastMsgTime ? new Date(lastMsgTime).toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'}) : '未知'
          })
          processedIds.add(id)
        }
      } catch(error) {
        console.error(`获取用户 ${id} 信息失败:`, error)
      }
    }

    if(results.length === 0) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: '❌ 未找到有效用户信息',
        parse_mode: 'HTML'
      })
    }

    const statusText = `
ℹ️ <b>用户状态查询</b>
━━━━━━━━━━━━━━━━
${results.map(user => `👤 昵称: <b>${user.info.first_name}${user.info.last_name ? ' ' + user.info.last_name : ''}</b>
🔖 用户名: ${user.info.username ? '@' + user.info.username : '未设置'}
���� ID: <code>${user.info.id}</code>
📊 状态: ${user.blocked ? '🚫 已屏蔽' : '✅ 正常'}
⏰ 最后活动: ${user.lastActive}`).join('\n\n')}

⏰ 查询时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`
    
    return notifyAdmin(statusText)
  } catch(error) {
    console.error('检查屏蔽状态错误:', error)
    return handleError(error, ADMIN_UID)
  }
}

async function handleKK(message, userIds = null) {
  try {
    let guestChatIds = []
    if(userIds) {
      guestChatIds = userIds
    } else {
      const guestChatId = await nfd.get('msg-map-' + message.reply_to_message.message_id, { type: "json" })
      guestChatIds = [guestChatId]
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
      if(user.photo) {
        await sendPhoto({
          chat_id: ADMIN_UID,
          photo: user.photo,
          caption: templates.userInfo(user.info, user.isBlocked, user.botBlocked),
          parse_mode: 'HTML'
        })
      } else {
        await sendMessage({
          chat_id: ADMIN_UID,
          text: templates.userInfo(user.info, user.isBlocked, user.botBlocked),
          parse_mode: 'HTML'
        })
      }
      await new Promise(resolve => setTimeout(resolve, 100))
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
  const users = await nfd.list({prefix: 'lastmsg-'})
  const sentUsers = []

  for(const key of users.keys) {
    const userId = key.name.replace('lastmsg-', '')
    if(userId !== ADMIN_UID) {
      try {
        const userInfo = await getChat(userId)
        if(userInfo.ok) {
          await sendMessage({
            chat_id: userId,
            text: content,
            parse_mode: 'HTML'
          })
          sentUsers.push(userInfo.result)
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
  const users = await nfd.list({prefix: 'lastmsg-'})
  const sentUsers = []

  for(const key of users.keys) {
    const userId = key.name.replace('lastmsg-', '')
    if(userId !== ADMIN_UID) {
      try {
        const isBlocked = await nfd.get('isblocked-' + userId, { type: "json" })
        if(!isBlocked) {
          const userInfo = await getChat(userId)
          if(userInfo.ok) {
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
    return new Response('ok' in r && r.ok ? '✅ Webhook设置成功' : JSON.stringify(r, null, 2))
  } catch (error) {
    return new Response('❌ Webhook设置失败: ' + error.message)
  }
}

async function unRegisterWebhook (event) {
  try {
    const r = await fetch(apiUrl('setWebhook', { url: '' })).then(r => r.json())
    return new Response('ok' in r && r.ok ? '✅ Webhook已移除' : JSON.stringify(r, null, 2))
  } catch (error) {
    return new Response('❌ Webhook移除失败: ' + error.message)
  }
}

function sendPhoto(msg = {}) {
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
      text: '❌ 请提供群组ID和消息内容\n\n示例: /sendgroup -123456789 这是要发送的消息',
      parse_mode: 'HTML'
    })
  }

  const groupId = args[0]
  const content = args.slice(1).join(' ')

  try {
    // 获取群组信息
    const groupInfo = await getChat(groupId)
    if(!groupInfo.ok) {
      throw new Error('chat not found')
    }

    // 检查是否为群组
    if(groupInfo.result.type !== 'group' && groupInfo.result.type !== 'supergroup') {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: templates.groupMessageSent(groupInfo.result, false, '指定的ID不是群组'),
        parse_mode: 'HTML'
      })
    }

    // 检查bot权限
    const botMember = await requestTelegram('getChatMember', makeReqBody({
      chat_id: groupId,
      user_id: (await requestTelegram('getMe', makeReqBody({}))).result.id
    }))

    if(!botMember.ok || botMember.result.status === 'left' || botMember.result.status === 'kicked') {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: templates.groupMessageSent(groupInfo.result, false, 'Bot不是群组成员'),
        parse_mode: 'HTML'
      })
    }

    // 发送消息
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

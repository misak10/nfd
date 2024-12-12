const TOKEN = ENV_BOT_TOKEN
const WEBHOOK = '/endpoint'
const SECRET = ENV_BOT_SECRET
const ADMIN_UID = ENV_ADMIN_UID

const NOTIFY_INTERVAL = 3600 * 1000;
const startMsgUrl = {
  admin: 'https://raw.githubusercontent.com/misak10/nfd/main/message/startMessage.md',
  guest: 'https://raw.githubusercontent.com/misak10/nfd/main/message/startMessage_guest.md'
}

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
    {command: 'sendunblock', description: '给未屏蔽用户发送消息'}
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

<i>❗️注意: /block、/unblock、/checkblock、/kk 可以回复消息或直接输入用户ID</i>
`,

  userInfo: (user) => `📌 基本信息
┣ 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
┣ 用户名: ${user.username ? '@' + user.username : '未设置'}
┗ ID: <code>${user.id}</code>

⏰ 查询时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,

  fraudDetected: (id) => `
⚠️ <b>检测到可疑用户</b>
━━━━━━━━━━━━━━━
🚫 用户ID: <code>${id}</code>
⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}

<i>❗️建议注意此用户的行为</i>
`,

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

  messageSent: (type, users) => `
✅ <b>消息发送完成</b>
━━━━━━━━━━━━━━━━
📨 发送类型: ${type}
📊 发送数量: ${users.length}条

📝 发送详情:
${users.map(user => `👤 昵称: <b>${user.first_name}${user.last_name ? ' ' + user.last_name : ''}</b>
🔖 用户名: ${user.username ? '@' + user.username : '未设置'}
🆔 ID: <code>${user.id}</code>`).join('\n\n')}

⏰ 发送时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}
`
}

const handleError = (error, chatId) => {
  console.error('Error:', error)
  let errorMsg = '⚠️ 系统错误'
  
  if(error.message.includes('message not found')) {
    errorMsg = '消息未找到'
  } else if(error.message.includes('bot was blocked')) {
    errorMsg = '❌ 机器人已被用户屏蔽'
  } else if(error.message.includes('chat not found')) {
    errorMsg = '❌ 找不到该聊天'
  } else if(error.message.includes('Too Many Requests')) {
    errorMsg = '⚠️ 请求过于频繁,请稍后再试'
  }

  return sendMessage({
    chat_id: chatId,
    text: errorMsg
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

async function onMessage (message) {
  try {
    if(message.text === '/start'){
      let startMsg
      if(message.chat.id.toString() === ADMIN_UID) {
        startMsg = await fetch(startMsgUrl.admin).then(r => r.text())
        await setCommands()
      } else {
        startMsg = await fetch(startMsgUrl.guest).then(r => r.text())
      }
      
      return sendMessage({
        chat_id: message.chat.id,
        text: startMsg,
        parse_mode: 'Markdown'
      })
    }

    if(message.text === '/info'){
      const userInfo = await getChat(message.chat.id)
      if(!userInfo.ok) {
        return sendMessage({
          chat_id: message.chat.id,
          text: '❌ 无法获取用户信息',
          parse_mode: 'HTML'
        })
      }

      const user = userInfo.result
      try {
        const photos = await getUserProfilePhotos(message.chat.id)
        if(photos.ok && photos.result.total_count > 0) {
          return sendPhoto({
            chat_id: message.chat.id,
            photo: photos.result.photos[0][0].file_id,
            caption: templates.userInfo(user),
            parse_mode: 'HTML'
          })
        }
      } catch (error) {
        console.error('Error getting user photo:', error)
      }

      return sendMessage({
        chat_id: message.chat.id,
        text: templates.userInfo(user),
        parse_mode: 'HTML'
      })
    }

    if(message.chat.id.toString() === ADMIN_UID){
      return handleAdminMessage(message)
    }

    return handleGuestMessage(message)
  } catch (error) {
    return handleError(error, message.chat.id)
  }
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
    '/sendunblock': handleSendUnblock
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
    let guestChantId = await nfd.get('msg-map-' + message?.reply_to_message.message_id, { type: "json" })
    return copyMessage({
      chat_id: guestChantId,
      from_chat_id: message.chat.id,
      message_id: message.message_id,
    })
  }

  return sendMessage({
    chat_id: ADMIN_UID,
    text: templates.help(),
    parse_mode: 'HTML'
  })
}

async function handleGuestMessage(message) {
  const chatId = message.chat.id
  
  try {
    const isblocked = await nfd.get('isblocked-' + chatId, { type: "json" })
    if(isblocked) {
      return sendMessage({
        chat_id: chatId,
        text: '🚫 您已被封禁访问'
      })
    }

    const forwardReq = await forwardMessage({
      chat_id: ADMIN_UID,
      from_chat_id: chatId,
      message_id: message.message_id
    })

    if(forwardReq.ok) {
      await nfd.put('msg-map-' + forwardReq.result.message_id, chatId)
      
      if(enable_notification) {
        const lastMsgTime = await nfd.get('lastmsg-' + chatId, { type: "json" })
        if(!lastMsgTime || Date.now() - lastMsgTime > NOTIFY_INTERVAL) {
          await nfd.put('lastmsg-' + chatId, Date.now())
        }
      }
    }
  } catch (error) {
    return handleError(error, chatId)
  }
}

async function handleNotify(message){
  let chatId = message.chat.id;
  
  if(await isFraud(chatId)){
    return notifyAdmin(templates.fraudDetected(chatId))
  }
  
  if(enable_notification){
    let lastMsgTime = await nfd.get('lastmsg-' + chatId, { type: "json" })
    if(!lastMsgTime || Date.now() - lastMsgTime > NOTIFY_INTERVAL){
      await nfd.put('lastmsg-' + chatId, Date.now())
    }
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

        // 直接设置 KV 状态为 false
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
${results.map(user => `👤 昵称: <b>${user.info.first_name}${user.info.last_name ? ' ' + user.last_name : ''}</b>
🔖 用户名: ${user.info.username ? '@' + user.info.username : '未设置'}
🆔 ID: <code>${user.info.id}</code>
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
          userInfos.push({
            info: userInfo.result,
            photo: photos.ok && photos.result.total_count > 0 ? photos.result.photos[0][0].file_id : null
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
          caption: templates.userInfo(user.info),
          parse_mode: 'HTML'
        })
      } else {
        await sendMessage({
          chat_id: ADMIN_UID,
          text: templates.userInfo(user.info),
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
      text: '❌ 请提供要发送的消��内容',
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

  for(const userId of userIds) {
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

  return notifyAdmin(templates.messageSent('指定用户', sentUsers))
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

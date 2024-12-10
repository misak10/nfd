const TOKEN = ENV_BOT_TOKEN // Get it from @BotFather
const WEBHOOK = '/endpoint'
const SECRET = ENV_BOT_SECRET // A-Z, a-z, 0-9, _ and -
const ADMIN_UID = ENV_ADMIN_UID // your user id, get it from https://t.me/username_to_id_bot

const NOTIFY_INTERVAL = 3600 * 1000;
const fraudDb = 'https://raw.githubusercontent.com/misak10/nfd/main/data/fraud.db';
const notificationUrl = 'https://raw.githubusercontent.com/misak10/nfd/main/data/notification.txt'
const startMsgUrl = 'https://raw.githubusercontent.com/misak10/nfd/main/data/startMessage.md';

const enable_notification = true

// 美化消息模板
const templates = {
  newUser: (user) => `
🎉 <b>新用户开始使用机器人</b>

👤 <b>用户信息</b>
├ 姓名: <b>${user.first_name}</b>
├ 用户名: ${user.username ? '@' + user.username : '未设置'}
├ ID: <code>${user.id}</code>
└ 语言: ${user.language_code || '未知'}

⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}
`,

  userInfo: (user) => `
👤 <b>您的用户信息</b>

📌 基本信息
├ 姓名: <b>${user.first_name}</b>
├ 用户名: ${user.username ? '@' + user.username : '未设置'}
├ ID: <code>${user.id}</code>
└ 语言: ${user.language_code || '未知'}

⏰ 查询时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}
`,

  fraudDetected: (id) => `
⚠️ <b>检测到可疑用户</b>

🚫 用户ID: <code>${id}</code>
⏰ 时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}

<i>建议注意此用户的行为</i>
`,

  blocked: (id) => `
✅ <b>用户已被屏蔽</b>

🚫 用户ID: <code>${id}</code>
⏰ 操作时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}
`,

  unblocked: (id) => `
🔓 <b>已解除用户屏蔽</b>

👤 用户ID: <code>${id}</code>
⏰ 操作时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}
`,

  blockStatus: (id, blocked) => `
ℹ️ <b>用户状态查询</b>

👤 用户ID: <code>${id}</code>
📊 状态: ${blocked ? '🚫 已屏蔽' : '✅ 正常'}
⏰ 查询时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}
`
}

// 统一错误处理
const handleError = (error, chatId) => {
  console.error('Error:', error)
  return sendMessage({
    chat_id: chatId,
    text: '⚠️ 抱歉,发生了一些错误,请稍后重试'
  })
}

// 统一管理员通知
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

/**
 * Return url to telegram api, optionally with parameters added
 */
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

// 获取用户信息
async function getChat(chatId) {
  return requestTelegram('getChat', makeReqBody({
    chat_id: chatId
  }))
}

/**
 * Wait for requests to the worker
 */
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

/**
 * Handle requests to WEBHOOK
 */
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

/**
 * Handle incoming Update
 */
async function onUpdate (update) {
  try {
    if ('message' in update) {
      await onMessage(update.message)
    }
  } catch (error) {
    console.error('Update handling error:', error)
  }
}

/**
 * Handle incoming Message
 */
async function onMessage (message) {
  try {
    if(message.text === '/start'){
      let startMsg = await fetch(startMsgUrl).then(r => r.text())
      
      // 发送更详细的通知给管理员
      await notifyAdmin(templates.newUser(message.from))
      
      return sendMessage({
        chat_id: message.chat.id,
        text: startMsg,
        parse_mode: 'Markdown'
      })
    }

    if(message.text === '/info'){
      return sendMessage({
        chat_id: message.chat.id,
        text: templates.userInfo(message.from),
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
  if(!message?.reply_to_message?.chat){
    return sendMessage({
      chat_id: ADMIN_UID,
      text: `
📝 <b>管理员命令使用说明</b>

1️⃣ 回复用户消息并直接输入文字 - 回复用户
2️⃣ /block - 屏蔽用户
3️⃣ /unblock - 解除屏蔽
4️⃣ /checkblock - 检查用户状态
5️⃣ /kk - 查看用户详细信息

<i>注意: 所有命令都需要回复用户消息才能生效</i>
`,
      parse_mode: 'HTML'
    })
  }

  // 处理/kk命令
  if(message.text === '/kk') {
    let guestChatId = await nfd.get('msg-map-' + message.reply_to_message.message_id, { type: "json" })
    let userInfo = await getChat(guestChatId)
    
    if(userInfo.ok) {
      return sendMessage({
        chat_id: ADMIN_UID,
        text: templates.userInfo(userInfo.result),
        parse_mode: 'HTML'
      })
    }
  }

  const commands = {
    '/block': handleBlock,
    '/unblock': handleUnBlock,
    '/checkblock': checkBlock
  }

  const command = commands[message.text]
  if(command) {
    return command(message)
  }

  let guestChantId = await nfd.get('msg-map-' + message?.reply_to_message.message_id, { type: "json" })
  return copyMessage({
    chat_id: guestChantId,
    from_chat_id: message.chat.id,
    message_id: message.message_id,
  })
}

async function handleGuestMessage(message){
  let chatId = message.chat.id;
  let isblocked = await nfd.get('isblocked-' + chatId, { type: "json" })
  
  if(isblocked){
    return sendMessage({
      chat_id: chatId,
      text: '🚫 您已被封禁访问'
    })
  }

  let forwardReq = await forwardMessage({
    chat_id: ADMIN_UID,
    from_chat_id: message.chat.id,
    message_id: message.message_id
  })

  if(forwardReq.ok){
    await nfd.put('msg-map-' + forwardReq.result.message_id, chatId)
  }
  
  return handleNotify(message)
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
      const notification = await fetch(notificationUrl).then(r => r.text())
      return sendMessage({
        chat_id: chatId,
        text: notification,
        parse_mode: 'Markdown'
      })
    }
  }
}

async function handleBlock(message){
  let guestChantId = await nfd.get('msg-map-' + message.reply_to_message.message_id, { type: "json" })
  
  if(guestChantId === ADMIN_UID){
    return sendMessage({
      chat_id: ADMIN_UID,
      text: '❌ 不能屏蔽自己',
      parse_mode: 'HTML'
    })
  }
  
  await nfd.put('isblocked-' + guestChantId, true)
  return notifyAdmin(templates.blocked(guestChantId))
}

async function handleUnBlock(message){
  let guestChantId = await nfd.get('msg-map-' + message.reply_to_message.message_id, { type: "json" })
  await nfd.put('isblocked-' + guestChantId, false)
  return notifyAdmin(templates.unblocked(guestChantId))
}

async function checkBlock(message){
  let guestChantId = await nfd.get('msg-map-' + message.reply_to_message.message_id, { type: "json" })
  let blocked = await nfd.get('isblocked-' + guestChantId, { type: "json" })
  return notifyAdmin(templates.blockStatus(guestChantId, blocked))
}

/**
 * Send plain text message
 */
async function sendPlainText (chatId, text) {
  return sendMessage({
    chat_id: chatId,
    text,
    parse_mode: 'Markdown'
  })
}

/**
 * Set webhook to this worker's url
 */
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

/**
 * Remove webhook
 */
async function unRegisterWebhook (event) {
  try {
    const r = await fetch(apiUrl('setWebhook', { url: '' })).then(r => r.json())
    return new Response('ok' in r && r.ok ? '✅ Webhook已移除' : JSON.stringify(r, null, 2))
  } catch (error) {
    return new Response('❌ Webhook移除失败: ' + error.message)
  }
}

async function isFraud(id){
  try {
    id = id.toString()
    let db = await fetch(fraudDb).then(r => r.text())
    let arr = db.split('\n').filter(v => v)
    return arr.includes(id)
  } catch (error) {
    console.error('Fraud check error:', error)
    return false
  }
}

/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2018 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */

// tslint:disable:no-console

import { PuppetWeChat } from '../src/mod'

import {
  EventLogoutPayload,
  EventLoginPayload,
  EventScanPayload,
  EventErrorPayload,
  EventMessagePayload,
}                       from 'wechaty-puppet'

/**
 *
 * 1. Declare your Bot!
 *
 */
const puppet = new PuppetWeChat()
let loginerId= '';

/**
 *
 * 2. Register event handlers for Bot
 *
 */
puppet
  .on('logout', onLogout)
  .on('login',  onLogin)
  .on('scan',   onScan)
  .on('error',  onError)
  .on('message', onMessage)

/**
 *
 * 3. Start the bot!
 *
 */
puppet.start()
  .catch(async e => {
    console.error('Bot start() fail:', e)
    await puppet.stop()
    process.exit(-1)
  })

/**
 *
 * 4. You are all set. ;-]
 *
 */

/**
 *
 * 5. Define Event Handler Functions for:
 *  `scan`, `login`, `logout`, `error`, and `message`
 *
 */
function onScan (payload =   EventScanPayload) {
  if (payload.qrcode) {
    // Generate a QR Code online via
    // http://goqr.me/api/doc/create-qr-code/
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(payload.qrcode),
    ].join('')

    console.info(`[${payload.status}] ${qrcodeImageUrl}\nScan QR Code above to log in: `)
  } else {
    console.info(`[${payload.status}]`)
  }
}

function onLogin (payload =   EventLoginPayload) {
  console.info(`${payload.contactId} login`)
  // 发送给指定formId的人
  // 这里指自己contactId
  puppet.messageSendText(payload.contactId, '机器人启动').catch(console.error)
  loginerId = payload.contactId
}

function onLogout (payload =   EventLogoutPayload) {
  console.info(`${payload.contactId} logouted`)
}

function onError (payload =   EventErrorPayload) {
  console.error('Bot error:', payload.data)
  /*
  if (bot.logonoff()) {
    bot.say('Wechaty error: ' + e.message).catch(console.error)
  }
  */
}

/**
 *
 * 6. The most important handler is for:
 *    dealing with Messages.
 *
 */
async function onMessage (payload =  EventMessagePayload) {
  const messagePayload = await puppet.messagePayload(payload.messageId)
  const { fromId } = messagePayload
  // 判断不是群里来的，群里的消息都带有roomId
  if (messagePayload.roomId == null) {
    console.info(JSON.stringify(messagePayload))
    // 自己发的消息得排除开来 不然会死循环
    if (loginerId !== fromId && fromId) {
      puppet.messageSendText(fromId, '十一在洗澡').catch(console.error)
    }
  } else {
    console.info('这是群消息，不接收')
  }
}

/**
 *
 * 7. Output the Welcome Message
 *
 */
const welcome = `
Puppet Version: ${puppet.version()}

Please wait... I'm trying to login in...

`
console.info(welcome)

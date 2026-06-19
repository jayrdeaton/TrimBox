import { google } from 'googleapis'

const BATCH_SIZE = 1000

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'access_token')
  if (!token) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  const body = await readBody<{ messageIds?: unknown }>(event)
  if (!Array.isArray(body?.messageIds) || body.messageIds.length === 0) {
    throw createError({ statusCode: 400, message: 'messageIds must be a non-empty array' })
  }

  const messageIds = body.messageIds.filter((id): id is string => typeof id === 'string')
  if (messageIds.length === 0) {
    throw createError({ statusCode: 400, message: 'messageIds must contain strings' })
  }

  const config = useRuntimeConfig()
  const auth = new google.auth.OAuth2(config.googleClientId, config.googleClientSecret)
  auth.setCredentials({ access_token: token })
  const gmail = google.gmail({ version: 'v1', auth })

  for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
    const batch = messageIds.slice(i, i + BATCH_SIZE)
    await gmail.users.messages.batchModify({
      userId: 'me',
      requestBody: {
        ids: batch,
        removeLabelIds: ['INBOX']
      }
    })
  }

  return { archived: messageIds.length }
})

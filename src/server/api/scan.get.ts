import { google } from 'googleapis'

interface SenderInfo {
  name: string
  email: string
  count: number
  latestSeen: number
  unsubscribeUrls: string[]
  messageIds: string[]
}

interface SenderAggregate {
  name: string
  email: string
  count: number
  latestSeen: number
  hasUnsubscribeHeader: boolean
  unsubscribeStats: Map<string, { count: number; lastSeen: number }>
  messageIds: string[]
}

type MailboxScope = 'primary' | 'spam' | 'trash'
type GroupByMode = 'domain' | 'exact'
// type SortByMode = 'count' | 'newest'

const MAX_MESSAGES = 10000
const BATCH_SIZE = 100

const formatNumber = (value: number): string => value.toLocaleString()

const COMMON_SECOND_LEVEL_SUFFIXES = new Set(['co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'com.au', 'net.au', 'org.au', 'co.nz', 'com.br', 'com.mx', 'co.jp', 'co.kr', 'com.sg', 'co.in'])

const parseBooleanQuery = (value: string | string[] | undefined, defaultValue: boolean): boolean => {
  if (Array.isArray(value)) value = value[0]
  if (typeof value !== 'string') return defaultValue
  return value.toLowerCase() === 'true'
}

const parseNumberQuery = (value: string | string[] | undefined, defaultValue: number, min = 1): number => {
  if (Array.isArray(value)) value = value[0]
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(min, parsed) : defaultValue
}

const parseEnumQuery = <T extends string>(value: string | string[] | undefined, allowed: readonly T[], defaultValue: T): T => {
  if (Array.isArray(value)) value = value[0]
  return typeof value === 'string' && allowed.includes(value as T) ? (value as T) : defaultValue
}

const normalizeSenderDomain = (email: string): string => {
  const domain = email.split('@')[1]?.trim().toLowerCase() ?? ''
  if (!domain) return email

  const parts = domain.split('.').filter(Boolean)
  if (parts.length <= 2) return domain

  const lastTwo = `${parts.at(-2)}.${parts.at(-1)}`
  if (COMMON_SECOND_LEVEL_SUFFIXES.has(lastTwo) && parts.length >= 3) {
    return `${parts.at(-3)}.${lastTwo}`
  }

  return lastTwo
}

const resolveSenderKey = (email: string, groupBy: GroupByMode): string => {
  return groupBy === 'exact' ? email : normalizeSenderDomain(email)
}

const canonicalizeUnsubscribeUrl = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (trimmed.toLowerCase().startsWith('mailto:')) {
    const address = trimmed.slice('mailto:'.length).split('?')[0]?.trim().toLowerCase()
    return address ? `mailto:${address}` : trimmed.toLowerCase()
  }

  try {
    const parsed = new URL(trimmed)
    const protocol = parsed.protocol.toLowerCase()
    if (protocol !== 'http:' && protocol !== 'https:') return trimmed.toLowerCase()

    const hostname = parsed.hostname.toLowerCase()
    const path = parsed.pathname.toLowerCase().replace(/\/+$/, '') || '/'
    const firstSegment = path.split('/').filter(Boolean)[0] ?? ''

    const family = path.includes('unsubscribe') || path.includes('optout') ? 'unsubscribe' : path.includes('settings') || path.includes('preferences') ? 'preferences' : firstSegment || 'root'

    return `${protocol}//${hostname}#${family}`
  } catch {
    return trimmed.toLowerCase()
  }
}

const sortUnsubscribeUrls = (unsubscribeStats: Map<string, { count: number; lastSeen: number }>): string[] => {
  const isHttp = (url: string) => url.startsWith('http://') || url.startsWith('https://')

  interface DedupedLink {
    representative: string
    totalCount: number
    strongestVariantCount: number
    latestSeen: number
  }

  const deduped = new Map<string, DedupedLink>()

  for (const [rawUrl, stats] of unsubscribeStats.entries()) {
    const { count, lastSeen } = stats
    const key = canonicalizeUnsubscribeUrl(rawUrl)
    const existing = deduped.get(key)

    if (!existing) {
      deduped.set(key, {
        representative: rawUrl,
        totalCount: count,
        strongestVariantCount: count,
        latestSeen: lastSeen
      })
      continue
    }

    existing.totalCount += count
    const previousLatestSeen = existing.latestSeen
    existing.latestSeen = Math.max(existing.latestSeen, lastSeen)

    if (lastSeen > previousLatestSeen || (lastSeen === previousLatestSeen && (count > existing.strongestVariantCount || (count === existing.strongestVariantCount && rawUrl.length < existing.representative.length)))) {
      existing.representative = rawUrl
      existing.strongestVariantCount = count
    }
  }

  return Array.from(deduped.values())
    .sort((a, b) => {
      const recentDiff = b.latestSeen - a.latestSeen
      if (recentDiff !== 0) return recentDiff

      const countDiff = b.totalCount - a.totalCount
      if (countDiff !== 0) return countDiff

      const httpA = isHttp(a.representative)
      const httpB = isHttp(b.representative)
      if (httpA !== httpB) return httpA ? -1 : 1

      return a.representative.localeCompare(b.representative)
    })
    .map((entry) => entry.representative)
}

const buildScopeLabel = (scope: MailboxScope, includeInbox: boolean, includeArchived: boolean): string => {
  if (scope === 'spam') return 'Spam'
  if (scope === 'trash') return 'Trash'
  if (includeInbox && includeArchived) return 'Inbox + archived'
  if (includeInbox) return 'Inbox'
  return 'Archived'
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'access_token')
  const query = getQuery(event)
  const includeInbox = parseBooleanQuery(query.includeInbox as string | string[] | undefined, true)
  const includeArchived = parseBooleanQuery(query.includeArchived as string | string[] | undefined, false)
  const includeSpam = parseBooleanQuery(query.includeSpam as string | string[] | undefined, false)
  const includeTrash = parseBooleanQuery(query.includeTrash as string | string[] | undefined, false)
  const VALID_CATEGORIES = new Set(['primary', 'promotions', 'social', 'updates', 'forums'])
  const rawCategories = Array.isArray(query.categories) ? query.categories[0] : (query.categories as string | undefined)
  const categories = (rawCategories ?? '')
    .split(',')
    .map((c: string) => c.trim())
    .filter((c: string) => VALID_CATEGORIES.has(c))
  const readFilter = parseEnumQuery(query.readFilter as string | string[] | undefined, ['all', 'unread', 'read'] as const, 'all')
  const dateRange = parseEnumQuery(query.dateRange as string | string[] | undefined, ['all', '1y', '3m'] as const, 'all')
  const minCount = parseNumberQuery(query.minCount as string | string[] | undefined, 1, 1)
  const groupBy = parseEnumQuery(query.groupBy as string | string[] | undefined, ['domain', 'exact'] as const, 'domain')
  const sortBy = parseEnumQuery(query.sortBy as string | string[] | undefined, ['count', 'newest'] as const, 'count')

  if (!token) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'X-Accel-Buffering', 'no')

  const res = event.node.res
  const send = (data: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  try {
    const config = useRuntimeConfig()
    const auth = new google.auth.OAuth2(config.googleClientId, config.googleClientSecret)
    auth.setCredentials({ access_token: token })

    const gmail = google.gmail({ version: 'v1', auth })
    const queryParts: string[] = []
    if (categories.length === 1) {
      queryParts.push(`category:${categories[0]}`)
    } else if (categories.length > 1) {
      queryParts.push(`{${categories.map((c: string) => `category:${c}`).join(' ')}}`)
    }
    if (readFilter === 'unread') queryParts.push('is:unread')
    else if (readFilter === 'read') queryParts.push('is:read')
    if (dateRange !== 'all') {
      const cutoff = new Date()
      if (dateRange === '1y') cutoff.setFullYear(cutoff.getFullYear() - 1)
      else if (dateRange === '3m') cutoff.setMonth(cutoff.getMonth() - 3)
      const yyyy = cutoff.getFullYear()
      const mm = String(cutoff.getMonth() + 1).padStart(2, '0')
      const dd = String(cutoff.getDate()).padStart(2, '0')
      queryParts.push(`after:${yyyy}/${mm}/${dd}`)
    }
    const queryFilter = queryParts.length > 0 ? queryParts.join(' ') : undefined

    send({ type: 'progress', message: 'Connecting to Gmail...' })

    const messageIds = new Set<string>()
    const collectMessageIds = async (scope: MailboxScope, params: { labelIds?: string[]; q?: string } = {}) => {
      let pageToken: string | undefined

      while (messageIds.size < MAX_MESSAGES) {
        const response = await gmail.users.messages.list({
          userId: 'me',
          maxResults: 500,
          pageToken,
          ...params
        })

        const messages = response.data.messages || []
        for (const message of messages) {
          if (!message.id || messageIds.size >= MAX_MESSAGES) continue
          messageIds.add(message.id)
        }

        pageToken = response.data.nextPageToken ?? undefined
        send({ type: 'progress', message: `Found ${formatNumber(messageIds.size)} messages (${buildScopeLabel(scope, includeInbox, includeArchived)})...`, found: messageIds.size })

        if (!pageToken) break
      }
    }

    if (includeInbox || includeArchived) {
      let primaryParams: { labelIds?: string[]; q?: string }
      if (includeInbox && includeArchived) {
        primaryParams = { q: queryFilter }
      } else if (includeInbox) {
        primaryParams = { labelIds: ['INBOX'], q: queryFilter }
      } else {
        const archivedQ = queryFilter ? `${queryFilter} -in:inbox` : '-in:inbox'
        primaryParams = { q: archivedQ }
      }
      await collectMessageIds('primary', primaryParams)
    }
    if (includeSpam && messageIds.size < MAX_MESSAGES) {
      await collectMessageIds('spam', { labelIds: ['SPAM'], q: queryFilter })
    }
    if (includeTrash && messageIds.size < MAX_MESSAGES) {
      await collectMessageIds('trash', { labelIds: ['TRASH'], q: queryFilter })
    }

    const messageIdList = Array.from(messageIds)

    send({ type: 'progress', message: `Scanning ${formatNumber(messageIdList.length)} messages for mailing lists...` })

    const senderMap = new Map<string, SenderAggregate>()

    for (let i = 0; i < messageIdList.length; i += BATCH_SIZE) {
      const batch = messageIdList.slice(i, i + BATCH_SIZE)

      const results = await Promise.allSettled(
        batch.map((id) =>
          gmail.users.messages.get({
            userId: 'me',
            id,
            format: 'metadata',
            metadataHeaders: ['From', 'List-Unsubscribe']
          })
        )
      )

      for (let j = 0; j < results.length; j++) {
        const result = results[j]
        const msgId = batch[j]!
        if (!result || result.status !== 'fulfilled') continue
        const headers = result.value.data.payload?.headers || []

        const fromHeader = headers.find((h) => h.name?.toLowerCase() === 'from')?.value || ''
        const unsubHeader = headers.find((h) => h.name?.toLowerCase() === 'list-unsubscribe')?.value || ''
        const messageTimestamp = Number(result.value.data.internalDate ?? Date.now())

        if (!fromHeader) continue

        const angleMatch = fromHeader.match(/<([^>]+)>/)
        const email = (angleMatch?.[1] ?? fromHeader).trim().toLowerCase()
        const nameMatch = fromHeader.match(/^"?([^"<]+?)"?\s*</)
        const name = nameMatch?.[1]?.trim() || email

        const unsubscribeUrls: string[] = []
        if (unsubHeader) {
          const bracketedUrls = [...unsubHeader.matchAll(/<([^>]+)>/g)].map((m) => m[1]?.trim()).filter(Boolean) as string[]
          const fallbackUrls =
            bracketedUrls.length > 0
              ? []
              : unsubHeader
                  .split(',')
                  .map((value) => value.trim().replace(/^<|>$/g, ''))
                  .filter(Boolean)
          unsubscribeUrls.push(...new Set([...bracketedUrls, ...fallbackUrls]))
        }

        const senderKey = resolveSenderKey(email, groupBy)
        const existing = senderMap.get(senderKey)
        if (existing) {
          existing.count++
          existing.messageIds.push(msgId)
          if (messageTimestamp >= existing.latestSeen) {
            existing.latestSeen = messageTimestamp
            existing.name = name
          }
          if (unsubHeader) existing.hasUnsubscribeHeader = true

          for (const unsubscribeUrl of unsubscribeUrls) {
            const current = existing.unsubscribeStats.get(unsubscribeUrl)
            if (current) {
              current.count += 1
              current.lastSeen = Math.max(current.lastSeen, messageTimestamp)
            } else {
              existing.unsubscribeStats.set(unsubscribeUrl, { count: 1, lastSeen: messageTimestamp })
            }
          }
        } else {
          const unsubscribeStats = new Map<string, { count: number; lastSeen: number }>()
          for (const unsubscribeUrl of unsubscribeUrls) {
            unsubscribeStats.set(unsubscribeUrl, { count: 1, lastSeen: messageTimestamp })
          }

          senderMap.set(senderKey, {
            name,
            email: senderKey,
            count: 1,
            latestSeen: messageTimestamp,
            hasUnsubscribeHeader: !!unsubHeader,
            unsubscribeStats,
            messageIds: [msgId]
          })
        }
      }

      const processed = Math.min(i + BATCH_SIZE, messageIdList.length)
      send({ type: 'progress', message: `Processed ${formatNumber(processed)} / ${formatNumber(messageIdList.length)}...` })
    }

    const sortSenders = (senders: SenderInfo[]) =>
      senders.sort((a, b) => {
        if (sortBy === 'newest') {
          const newestDiff = b.latestSeen - a.latestSeen
          if (newestDiff !== 0) return newestDiff
        }

        const countDiff = b.count - a.count
        if (countDiff !== 0) return countDiff

        if (sortBy === 'count') {
          const newestDiff = b.latestSeen - a.latestSeen
          if (newestDiff !== 0) return newestDiff
        }

        return a.email.localeCompare(b.email)
      })

    const allSenders = Array.from(senderMap.values()).filter((sender) => sender.count >= minCount)

    const mailingListResults = sortSenders(
      allSenders
        .filter((sender) => sender.hasUnsubscribeHeader)
        .map((sender) => ({
          name: sender.name,
          email: sender.email,
          count: sender.count,
          latestSeen: sender.latestSeen,
          unsubscribeUrls: sortUnsubscribeUrls(sender.unsubscribeStats),
          messageIds: sender.messageIds
        }))
    )

    const frequentSenderResults = sortSenders(
      allSenders
        .filter((sender) => !sender.hasUnsubscribeHeader)
        .map((sender) => ({
          name: sender.name,
          email: sender.email,
          count: sender.count,
          latestSeen: sender.latestSeen,
          unsubscribeUrls: [],
          messageIds: sender.messageIds
        }))
    )

    send({ type: 'complete', results: mailingListResults, frequentSenderResults, totalScanned: messageIdList.length })
  } catch (err) {
    send({ type: 'error', message: err instanceof Error ? err.message : 'Scan failed' })
  }

  res.end()
})

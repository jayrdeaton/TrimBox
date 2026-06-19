<template>
  <main class="flex-1 max-w-3xl mx-auto w-full px-6 py-14">
    <!-- Hero -->
    <div class="mb-10 text-center">
      <h1 class="text-4xl font-bold tracking-tight mb-3">Find every mailing list in your inbox.</h1>
      <p v-if="status === 'idle'" class="text-gray-500 dark:text-zinc-400 text-lg leading-relaxed">Sign in with Google to scan your inbox, find every mailing list, and clean it up in bulk.</p>
    </div>

    <!-- Landing: not signed in -->
    <div v-if="!isSignedIn && status === 'idle'">
      <div class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 text-center shadow-sm dark:shadow-none">
        <div v-if="authError" class="mb-5 text-sm text-red-500">{{ authErrorMessage }}</div>
        <a href="/api/auth/google" class="inline-flex items-center gap-2.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg px-6 py-3 text-sm transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ffffff" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ffffff" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#ffffff" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ffffff" />
          </svg>
          Connect Gmail
        </a>
        <p class="mt-4 text-sm text-gray-400 dark:text-zinc-500">Your email content is never read or stored. Archive and trash actions only run when you ask.</p>
      </div>

      <!-- How it works -->
      <div class="mt-8 space-y-6">
        <h2 class="text-lg font-semibold text-center text-gray-700 dark:text-zinc-200">How TrimBox works</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500" aria-hidden="true">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800 dark:text-zinc-100 mb-1">Scans your inbox</h3>
            <p class="text-sm text-gray-500 dark:text-zinc-400">TrimBox reads the sender and header fields of up to 10,000 of your messages to identify mailing lists and bulk senders. Email body content is never read or stored.</p>
          </div>
          <div class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500" aria-hidden="true">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800 dark:text-zinc-100 mb-1">Surfaces every sender</h3>
            <p class="text-sm text-gray-500 dark:text-zinc-400">Results are grouped by sender domain or exact address and sorted by volume, so you can quickly see who's filling your inbox most.</p>
          </div>
          <div class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800 dark:text-zinc-100 mb-1">One-click unsubscribe links</h3>
            <p class="text-sm text-gray-500 dark:text-zinc-400">Unsubscribe links are extracted directly from email headers and displayed alongside each sender, so you can opt out without digging through your inbox.</p>
          </div>
          <div class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500" aria-hidden="true">
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800 dark:text-zinc-100 mb-1">Clean up in bulk</h3>
            <p class="text-sm text-gray-500 dark:text-zinc-400">Select senders from the results and archive or move their emails to trash with one click, without leaving the app.</p>
          </div>
        </div>

        <!-- Privacy callout -->
        <div class="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl px-5 py-4 text-sm text-gray-500 dark:text-zinc-400 space-y-1">
          <p><span class="font-medium text-gray-700 dark:text-zinc-200">Gmail permission used:</span> <code class="text-xs bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded">https://www.googleapis.com/auth/gmail.modify</code> to read message metadata and headers during the scan, and to archive or trash emails only when you explicitly request it.</p>
          <p><span class="font-medium text-gray-700 dark:text-zinc-200">What TrimBox stores:</span> Nothing. No email content, attachments, or personal data are stored on TrimBox servers. All processing happens in memory during the scan and is discarded when you close the tab.</p>
          <p>
            See our
            <NuxtLink to="/privacy" class="text-orange-500 hover:text-orange-400 underline underline-offset-2 transition-colors">Privacy Policy</NuxtLink>
            for full details.
          </p>
        </div>
      </div>
    </div>

    <!-- Signed in: ready to scan -->
    <div v-else-if="isSignedIn && status === 'idle'">
      <div class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Signed in as <span class="font-medium text-gray-700 dark:text-zinc-200">{{ userEmail }}</span>
          </div>
          <button class="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors" @click="signOut">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
        <div class="mb-5 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 px-4 py-3 space-y-4">
          <!-- Also scan + min count -->
          <div class="flex items-start justify-between gap-6">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-zinc-300 mb-2">Also scan</p>
              <div class="flex flex-wrap gap-x-5 gap-y-2">
                <label class="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 dark:text-zinc-300">
                  <input v-model="scanOptions.includeArchived" type="checkbox" class="w-4 h-4 accent-orange-500" />
                  Archived
                </label>
                <label class="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 dark:text-zinc-300">
                  <input v-model="scanOptions.includeSpam" type="checkbox" class="w-4 h-4 accent-orange-500" />
                  Spam
                </label>
                <label class="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 dark:text-zinc-300">
                  <input v-model="scanOptions.includeTrash" type="checkbox" class="w-4 h-4 accent-orange-500" />
                  Trash
                </label>
              </div>
            </div>
            <div class="shrink-0">
              <p class="text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Min email count</p>
              <input v-model.number="scanOptions.minCount" type="number" min="1" max="9999" class="w-24 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-orange-500 text-center" />
            </div>
          </div>

          <!-- Date range -->
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Date range</p>
            <div class="flex rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700 text-sm">
              <button type="button" class="flex-1 px-3 py-2 transition-colors whitespace-nowrap" :class="scanOptions.dateRange === 'all' ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400 font-medium' : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'" @click="scanOptions.dateRange = 'all'">All time</button>
              <button type="button" class="flex-1 px-3 py-2 transition-colors border-l border-gray-200 dark:border-zinc-700 whitespace-nowrap" :class="scanOptions.dateRange === '1y' ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400 font-medium' : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'" @click="scanOptions.dateRange = '1y'">Last year</button>
              <button type="button" class="flex-1 px-3 py-2 transition-colors border-l border-gray-200 dark:border-zinc-700 whitespace-nowrap" :class="scanOptions.dateRange === '3m' ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400 font-medium' : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'" @click="scanOptions.dateRange = '3m'">Last 3 months</button>
            </div>
          </div>

          <!-- Narrow filters -->
          <div class="flex flex-wrap gap-x-5 gap-y-2">
            <label class="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 dark:text-zinc-300">
              <input v-model="scanOptions.promotionsOnly" type="checkbox" class="w-4 h-4 accent-orange-500" />
              Promotions tab only
            </label>
            <label class="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 dark:text-zinc-300">
              <input v-model="scanOptions.unreadOnly" type="checkbox" class="w-4 h-4 accent-orange-500" />
              Unread only
            </label>
          </div>

          <div class="border-t border-gray-200 dark:border-zinc-800 -mx-4" />

          <!-- Binary toggles -->
          <div class="grid gap-3 sm:grid-cols-3">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Group results by</p>
              <div class="flex rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700 text-sm">
                <button type="button" class="flex-1 px-3 py-2 transition-colors whitespace-nowrap" :class="scanOptions.groupBy === 'domain' ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400 font-medium' : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'" @click="scanOptions.groupBy = 'domain'">Domain</button>
                <button type="button" class="flex-1 px-3 py-2 transition-colors border-l border-gray-200 dark:border-zinc-700 whitespace-nowrap" :class="scanOptions.groupBy === 'exact' ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400 font-medium' : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'" @click="scanOptions.groupBy = 'exact'">Exact</button>
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Unsubscribe links</p>
              <div class="flex rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700 text-sm">
                <button type="button" class="flex-1 px-3 py-2 transition-colors whitespace-nowrap" :class="scanOptions.linkMode === 'primary' ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400 font-medium' : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'" @click="scanOptions.linkMode = 'primary'">Primary only</button>
                <button type="button" class="flex-1 px-3 py-2 transition-colors border-l border-gray-200 dark:border-zinc-700 whitespace-nowrap" :class="scanOptions.linkMode === 'all' ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400 font-medium' : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'" @click="scanOptions.linkMode = 'all'">All</button>
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">CSV export format</p>
              <div class="flex rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700 text-sm">
                <button type="button" class="flex-1 px-3 py-2 transition-colors whitespace-nowrap" :class="scanOptions.exportFormat === 'sender' ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400 font-medium' : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'" @click="scanOptions.exportFormat = 'sender'">Per sender</button>
                <button type="button" class="flex-1 px-3 py-2 transition-colors border-l border-gray-200 dark:border-zinc-700 whitespace-nowrap" :class="scanOptions.exportFormat === 'link' ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400 font-medium' : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'" @click="scanOptions.exportFormat = 'link'">Per link</button>
              </div>
            </div>
          </div>
        </div>
        <button class="w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg py-3 text-sm transition-colors" @click="startScan">Scan Inbox</button>
        <p class="mt-3 text-center text-xs text-gray-400 dark:text-zinc-500">Scans up to 10,000 messages across the selected mailbox areas.</p>
      </div>
    </div>

    <!-- Scanning: SSE progress -->
    <div v-else-if="status === 'scanning'">
      <div ref="progressContainer" class="bg-black border border-zinc-800 rounded-2xl p-5 font-mono text-sm leading-relaxed overflow-auto max-h-72">
        <p v-for="(msg, i) in progress" :key="i" class="text-orange-400"><span class="text-zinc-600 select-none">› </span>{{ msg }}</p>
        <span class="text-zinc-500 animate-pulse">▌</span>
      </div>
    </div>

    <!-- Results -->
    <div v-else-if="status === 'done'">
      <!-- Stats summary -->
      <div class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 mb-4 shadow-sm dark:shadow-none">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <p class="text-3xl font-bold text-orange-500">{{ formatNumber(results.length) }}</p>
            <p class="text-gray-500 dark:text-zinc-400 text-sm mt-0.5">mailing lists · {{ formatNumber(mailingListMessageCount) }} of {{ formatNumber(totalScanned) }} messages</p>
          </div>
          <button class="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors shrink-0" @click="downloadCsv">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download CSV
          </button>
        </div>
        <div class="flex items-center justify-between">
          <button class="text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors" @click="reset">← Scan again</button>
          <button class="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors" @click="signOut">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </div>

      <!-- Bulk action bar -->
      <div class="flex items-center gap-2 mb-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 shadow-sm dark:shadow-none">
        <span class="text-sm font-medium text-gray-700 dark:text-zinc-200 flex-1">{{ selectedKeys.size }} selected</span>
        <p v-if="actionError" class="text-xs text-red-500 mr-2">{{ actionError }}</p>
        <button class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-zinc-100 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" :disabled="selectedKeys.size === 0 || actionStatus !== 'idle'" @click="archiveSelected">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
          {{ actionStatus === 'archiving' ? 'Archiving…' : 'Archive' }}
        </button>
        <button class="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" :disabled="selectedKeys.size === 0 || actionStatus !== 'idle'" @click="trashSelected">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
          {{ actionStatus === 'trashing' ? 'Moving to trash…' : 'Move to trash' }}
        </button>
      </div>

      <!-- Sender list -->
      <div v-if="results.length > 0" class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none mb-4">
        <!-- List header -->
        <div class="grid grid-cols-[2rem_1fr_auto_minmax(8rem,18rem)] gap-4 px-5 py-3 border-b border-gray-100 dark:border-zinc-800 text-xs font-semibold text-gray-400 dark:text-zinc-500 items-center">
          <input type="checkbox" :checked="allSelected" :indeterminate="!allSelected && selectedKeys.size > 0" class="w-4 h-4 accent-orange-500 cursor-pointer" @change="toggleAll" />
          <button class="flex items-center gap-1 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors text-left" @click="toggleSort('name')">
            Sender
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :class="sortColumn === 'name' ? 'text-orange-500' : 'opacity-30'" aria-hidden="true">
              <polyline v-if="sortColumn === 'name' && sortDir === 'asc'" points="18 15 12 9 6 15" />
              <polyline v-else-if="sortColumn === 'name' && sortDir === 'desc'" points="6 9 12 15 18 9" />
              <template v-else>
                <polyline points="18 15 12 9 6 15" class="opacity-50" />
                <polyline points="6 17 12 23 18 17" class="opacity-50" />
              </template>
            </svg>
          </button>
          <button class="flex items-center justify-end gap-1 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors" @click="toggleSort('count')">
            Emails
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :class="sortColumn === 'count' ? 'text-orange-500' : 'opacity-30'" aria-hidden="true">
              <polyline v-if="sortColumn === 'count' && sortDir === 'asc'" points="18 15 12 9 6 15" />
              <polyline v-else-if="sortColumn === 'count' && sortDir === 'desc'" points="6 9 12 15 18 9" />
              <template v-else>
                <polyline points="18 15 12 9 6 15" class="opacity-50" />
                <polyline points="6 17 12 23 18 17" class="opacity-50" />
              </template>
            </svg>
          </button>
          <span class="text-right">Unsubscribe Links</span>
        </div>
        <!-- Rows -->
        <div v-for="(sender, i) in sortedResults" :key="sender.email" :class="[i > 0 ? 'border-t border-gray-100 dark:border-zinc-800' : '', selectedKeys.has(sender.email) ? 'bg-orange-50/50 dark:bg-orange-950/20' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50']" class="grid grid-cols-[2rem_1fr_auto_minmax(8rem,18rem)] gap-4 px-5 py-3.5 items-center transition-colors">
          <input type="checkbox" :checked="selectedKeys.has(sender.email)" class="w-4 h-4 accent-orange-500 cursor-pointer mt-0.5" @change="toggleSender(sender.email)" />
          <div class="min-w-0">
            <p class="font-medium text-sm truncate">{{ sender.name }}</p>
            <p class="text-xs text-gray-400 dark:text-zinc-500 truncate">{{ sender.email }}</p>
          </div>
          <span class="text-sm font-semibold text-gray-600 dark:text-zinc-300 tabular-nums text-right">{{ formatNumber(sender.count) }}</span>
          <div class="text-right">
            <div v-if="getVisibleUnsubscribeUrls(sender).length > 0" class="flex flex-col items-end gap-1">
              <a v-for="(url, idx) in getVisibleUnsubscribeUrls(sender)" :key="`${sender.email}-${idx}`" :href="url" :title="url" target="_blank" rel="noopener noreferrer" class="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-500 font-medium transition-colors break-all"> {{ formatUnsubscribeLabel(url, idx) }} → </a>
            </div>
            <span v-else class="text-xs text-gray-300 dark:text-zinc-600">—</span>
          </div>
        </div>
      </div>

      <div v-else class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 text-center shadow-sm dark:shadow-none mb-4">
        <p class="text-gray-500 dark:text-zinc-400">No mailing lists found. Your inbox is already clean!</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="status === 'error'">
      <div class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
        <p class="text-red-500 text-sm mb-4">{{ errorMessage }}</p>
        <button class="text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors" @click="reset">← Try again</button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
interface SenderInfo {
  name: string
  email: string
  count: number
  latestSeen: number
  unsubscribeUrls: string[]
  messageIds: string[]
}

interface AuthStatus {
  signedIn: boolean
  email: string | null
}

interface ScanOptions {
  includeArchived: boolean
  includeSpam: boolean
  includeTrash: boolean
  promotionsOnly: boolean
  unreadOnly: boolean
  dateRange: 'all' | '1y' | '3m'
  minCount: number
  groupBy: 'domain' | 'exact'
  linkMode: 'primary' | 'all'
  exportFormat: 'sender' | 'link'
}

type Status = 'idle' | 'scanning' | 'done' | 'error'
type ActionStatus = 'idle' | 'archiving' | 'trashing'
const AUTO_SCROLL_THRESHOLD_PX = 24

const { data: initialAuth } = await useFetch<AuthStatus>('/api/auth/me', {
  key: 'auth-status-initial',
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  default: () => ({ signedIn: false, email: null })
})

const status = ref<Status>('idle')
const isSignedIn = ref(initialAuth.value?.signedIn ?? false)
const userEmail = ref<string | null>(initialAuth.value?.email ?? null)
const scanOptions = ref<ScanOptions>({
  includeArchived: false,
  includeSpam: false,
  includeTrash: false,
  promotionsOnly: false,
  unreadOnly: false,
  dateRange: 'all',
  minCount: 1,
  groupBy: 'domain',
  linkMode: 'primary',
  exportFormat: 'sender'
})
const progress = ref<string[]>([])
const progressContainer = ref<HTMLElement | null>(null)
const results = ref<SenderInfo[]>([])
const totalScanned = ref(0)
const errorMessage = ref('')
const selectedKeys = ref(new Set<string>())
const actionStatus = ref<ActionStatus>('idle')
const actionError = ref('')
const sortColumn = ref<'name' | 'count'>('count')
const sortDir = ref<'asc' | 'desc'>('desc')
const allSelected = computed(() => results.value.length > 0 && selectedKeys.value.size === results.value.length)
const mailingListMessageCount = computed(() => results.value.reduce((sum, s) => sum + s.count, 0))
const sortedResults = computed(() => {
  return [...results.value].sort((a, b) => {
    const dir = sortDir.value === 'asc' ? 1 : -1
    if (sortColumn.value === 'name') return a.name.localeCompare(b.name) * dir
    const diff = a.count - b.count
    return (diff !== 0 ? diff : a.name.localeCompare(b.name)) * dir
  })
})

const route = useRoute()
const authError = computed(() => !!route.query.error)
const authErrorMessages: Record<string, string> = {
  no_code: 'Google sign-in was cancelled.',
  auth_denied: 'Google sign-in was denied or cancelled.',
  no_token: 'Failed to retrieve access token.',
  auth_failed: 'Authentication failed. Please try again.'
}
const authErrorMessage = computed(() => authErrorMessages[route.query.error as string] ?? 'Something went wrong. Please try again.')

onMounted(async () => {
  const fetchAuthStatus = async () => {
    const auth = await $fetch<{ signedIn: boolean; email: string | null }>(`/api/auth/me?t=${Date.now()}`, {
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })

    isSignedIn.value = auth.signedIn
    userEmail.value = auth.email
    return auth.signedIn
  }

  try {
    const signedIn = await fetchAuthStatus()
    if (!signedIn) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      await fetchAuthStatus()
    }
  } catch {
    isSignedIn.value = false
    userEmail.value = null
  }
})

const signOut = async () => {
  await $fetch('/api/auth/signout', { method: 'POST', credentials: 'include' })
  isSignedIn.value = false
  userEmail.value = null
  status.value = 'idle'
  results.value = []
  progress.value = []
  selectedKeys.value.clear()
}

const reset = () => {
  status.value = 'idle'
  results.value = []
  progress.value = []
  errorMessage.value = ''
  selectedKeys.value.clear()
  sortColumn.value = 'count'
  sortDir.value = 'desc'
}

const toggleSort = (col: 'name' | 'count') => {
  if (sortColumn.value === col) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = col
    sortDir.value = col === 'count' ? 'desc' : 'asc'
  }
}

const toggleSender = (email: string) => {
  if (selectedKeys.value.has(email)) {
    selectedKeys.value.delete(email)
  } else {
    selectedKeys.value.add(email)
  }
}

const toggleAll = () => {
  if (allSelected.value) {
    selectedKeys.value.clear()
  } else {
    for (const sender of results.value) {
      selectedKeys.value.add(sender.email)
    }
  }
}

const archiveSelected = async () => {
  const messageIds = results.value.filter((s) => selectedKeys.value.has(s.email)).flatMap((s) => s.messageIds)
  if (messageIds.length === 0) return
  actionStatus.value = 'archiving'
  actionError.value = ''
  try {
    await $fetch('/api/messages/archive', { method: 'POST', body: { messageIds }, credentials: 'include' })
    results.value = results.value.filter((s) => !selectedKeys.value.has(s.email))
    selectedKeys.value.clear()
  } catch {
    actionError.value = 'Archive failed. Please try again.'
  } finally {
    actionStatus.value = 'idle'
  }
}

const trashSelected = async () => {
  const messageIds = results.value.filter((s) => selectedKeys.value.has(s.email)).flatMap((s) => s.messageIds)
  if (messageIds.length === 0) return
  actionStatus.value = 'trashing'
  actionError.value = ''
  try {
    await $fetch('/api/messages/trash', { method: 'POST', body: { messageIds }, credentials: 'include' })
    results.value = results.value.filter((s) => !selectedKeys.value.has(s.email))
    selectedKeys.value.clear()
  } catch {
    actionError.value = 'Move to trash failed. Please try again.'
  } finally {
    actionStatus.value = 'idle'
  }
}

watch(
  () => progress.value.length,
  async () => {
    if (status.value !== 'scanning') return
    if (!progressContainer.value) return

    const distanceFromBottom = progressContainer.value.scrollHeight - progressContainer.value.scrollTop - progressContainer.value.clientHeight
    const shouldAutoScroll = distanceFromBottom <= AUTO_SCROLL_THRESHOLD_PX

    await nextTick()
    if (!progressContainer.value || !shouldAutoScroll) return
    progressContainer.value.scrollTop = progressContainer.value.scrollHeight
  }
)

let eventSource: EventSource | null = null

const startScan = () => {
  status.value = 'scanning'
  progress.value = []
  results.value = []
  errorMessage.value = ''

  type ScanEvent = { type: 'progress'; message: string } | { type: 'complete'; results: SenderInfo[]; totalScanned: number } | { type: 'error'; message: string }

  const params = new URLSearchParams({
    includeArchived: String(scanOptions.value.includeArchived),
    includeSpam: String(scanOptions.value.includeSpam),
    includeTrash: String(scanOptions.value.includeTrash),
    promotionsOnly: String(scanOptions.value.promotionsOnly),
    unreadOnly: String(scanOptions.value.unreadOnly),
    dateRange: scanOptions.value.dateRange,
    minCount: String(scanOptions.value.minCount),
    groupBy: scanOptions.value.groupBy
  })

  eventSource?.close()
  eventSource = new EventSource(`/api/scan?${params.toString()}`)

  eventSource.onmessage = (event) => {
    const msg = JSON.parse(event.data as string) as ScanEvent

    if (msg.type === 'progress') {
      progress.value.push(msg.message)
    } else if (msg.type === 'complete') {
      results.value = msg.results
      totalScanned.value = msg.totalScanned
      status.value = 'done'
      eventSource?.close()
    } else if (msg.type === 'error') {
      errorMessage.value = msg.message
      status.value = 'error'
      eventSource?.close()
    }
  }

  eventSource.onerror = () => {
    if (status.value === 'scanning') {
      errorMessage.value = 'Connection lost. Please try again.'
      status.value = 'error'
    }
    eventSource?.close()
  }
}

const getVisibleUnsubscribeUrls = (sender: SenderInfo): string[] => {
  return scanOptions.value.linkMode === 'all' ? sender.unsubscribeUrls : sender.unsubscribeUrls.slice(0, 1)
}

const formatNumber = (value: number): string => value.toLocaleString()

const downloadCsv = () => {
  const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`
  const newestSeenLabel = 'Newest Seen (Unix ms)'

  const rows =
    scanOptions.value.exportFormat === 'link'
      ? results.value.flatMap((sender) => {
          const visibleUrls = getVisibleUnsubscribeUrls(sender)
          if (visibleUrls.length === 0) {
            return [[escapeCsv(sender.name), escapeCsv(sender.email), sender.count, escapeCsv(sender.latestSeen), '']]
          }

          return visibleUrls.map((url) => [escapeCsv(sender.name), escapeCsv(sender.email), sender.count, escapeCsv(sender.latestSeen), escapeCsv(url)])
        })
      : results.value.map((sender) => {
          const unsubscribeUrls = getVisibleUnsubscribeUrls(sender).join(' | ')
          return [escapeCsv(sender.name), escapeCsv(sender.email), sender.count, escapeCsv(sender.latestSeen), escapeCsv(unsubscribeUrls)]
        })

  const header = scanOptions.value.exportFormat === 'link' ? ['Sender Name', 'Email', 'Email Count', newestSeenLabel, 'Unsubscribe URL'] : ['Sender Name', 'Email', 'Email Count', newestSeenLabel, 'Unsubscribe URLs']
  const csv = [header.join(','), ...rows.map((row) => row.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'inbox-mailing-lists.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const formatUnsubscribeLabel = (url: string, index: number): string => {
  if (url.startsWith('mailto:')) return `Email ${index + 1}`

  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    return hostname || `Link ${index + 1}`
  } catch {
    return `Link ${index + 1}`
  }
}

onUnmounted(() => {
  eventSource?.close()
})
</script>

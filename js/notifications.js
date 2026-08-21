/**
 * ==========================================================================
 * Koksh Workspace OS — Smart In-App Notification Center Module
 * Phase 8: Contextual Alerts, Priority Queue, Read/Unread & 1-Click Action
 * ==========================================================================
 */

function getSystemNotifications() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const notifs = [];
    const readIds = AppState.readNotifications || [];

    // 1. Critical / Overdue Urgent Tasks
    const pendingTasks = (AppState.tasks || []).filter(t => t.status !== 'completed' && t.status !== 'waiting');
    pendingTasks.forEach(t => {
        const notifId = `notif-task-${t.id}`;
        const client = t.clientId ? AppState.clients.find(c => c.id === t.clientId) : null;
        notifs.push({
            id: notifId,
            priority: 1, // Critical
            category: 'task',
            title: 'مهمة عاجلة بانتظار الإنجاز',
            message: t.title || t.text,
            timeLabel: 'مطلوب إنجازها الآن',
            clientName: client ? client.name : null,
            clientId: t.clientId || null,
            icon: 'fa-solid fa-triangle-exclamation text-amber-600 bg-amber-50',
            badge: 'عاجل',
            badgeColor: 'bg-amber-100 text-amber-800',
            isRead: readIds.includes(notifId),
            handler: () => {
                closeNotificationCenter();
                if (t.clientId) {
                    navigateToClientWorkspace(t.clientId);
                } else if (t.contentId) {
                    navigateToContent(t.contentId);
                } else {
                    switchTab('today');
                }
            }
        });
    });

    // 2. Overdue Client Retainers / Dues
    const overdueClients = (AppState.clients || []).filter(c => !c.archived && (Number(c.retainer) || 0) > (Number(c.paid) || 0));
    overdueClients.forEach(c => {
        const notifId = `notif-client-due-${c.id}`;
        const due = (Number(c.retainer) || 0) - (Number(c.paid) || 0);
        notifs.push({
            id: notifId,
            priority: 1,
            category: 'finance',
            title: `مستحقات معلقة: ${c.name}`,
            message: `متبقي للتحصيل مبلغ ${due.toLocaleString()} ج.م من اشتراك الشهر`,
            timeLabel: 'واجب السداد',
            clientName: c.name,
            clientId: c.id,
            icon: 'fa-solid fa-hand-holding-dollar text-rose-600 bg-rose-50',
            badge: 'مالية',
            badgeColor: 'bg-rose-100 text-rose-800',
            isRead: readIds.includes(notifId),
            handler: () => {
                closeNotificationCenter();
                openPaymentForClient(c.id);
            }
        });
    });

    // 3. Shoots Scheduled for Today
    const todayShoots = AppState.shootSessions.filter(s => s.date === todayStr);
    todayShoots.forEach(s => {
        const notifId = `notif-shoot-today-${s.id}`;
        const client = AppState.clients.find(c => c.id === s.clientId) || { name: 'عميل' };
        notifs.push({
            id: notifId,
            priority: 2, // Today
            category: 'shoot',
            title: `جلسة تصوير اليوم: ${client.name}`,
            message: `الساعة ${s.time} في موقع: ${s.location}`,
            timeLabel: 'اليوم',
            clientName: client.name,
            clientId: s.clientId,
            icon: 'fa-solid fa-video text-rose-600 bg-rose-50',
            badge: 'تصوير اليوم',
            badgeColor: 'bg-rose-100 text-rose-800',
            isRead: readIds.includes(notifId),
            handler: () => {
                closeNotificationCenter();
                navigateToShootSession(s.id);
            }
        });
    });

    // 4. Content Scheduled for Today (in production)
    const todayContent = (AppState.contentItems || []).filter(i => !i.archived && i.date === todayStr && i.stage !== '✅ تم النشر' && i.stage !== 'تم النشر');
    todayContent.forEach(item => {
        const notifId = `notif-cnt-today-${item.id}`;
        const client = AppState.clients.find(c => c.id === item.clientId) || { name: 'عميل' };
        notifs.push({
            id: notifId,
            priority: 2,
            category: 'content',
            title: `محتوى مجدول للنشر اليوم`,
            message: `${item.title} (${client.name} • ${item.platform})`,
            timeLabel: 'تاريخ اليوم',
            clientName: client.name,
            clientId: item.clientId,
            icon: 'fa-solid fa-calendar-day text-indigo-600 bg-indigo-50',
            badge: item.stage,
            badgeColor: 'bg-indigo-100 text-indigo-800',
            isRead: readIds.includes(notifId),
            handler: () => {
                closeNotificationCenter();
                editContentItem(item.id);
            }
        });
    });

    // 5. Content Needing Script / Decision (Unscheduled or in early stages)
    const pendingIdeas = (AppState.contentItems || []).filter(i => !i.archived && (i.stage === 'فكرة' || i.stage === 'سكريبت') && i.date !== todayStr);
    if (pendingIdeas.length > 0) {
        const notifId = `notif-cnt-pending-decision`;
        notifs.push({
            id: notifId,
            priority: 3, // Review
            category: 'content',
            title: `${pendingIdeas.length} أفكار واسكريبتات بانتظار الاعتماد`,
            message: `أحدث فكرة: ${pendingIdeas[0].title}`,
            timeLabel: 'تحتاج مراجعة',
            clientName: null,
            clientId: null,
            icon: 'fa-solid fa-pen-fancy text-purple-600 bg-purple-50',
            badge: 'مراجعة',
            badgeColor: 'bg-purple-100 text-purple-800',
            isRead: readIds.includes(notifId),
            handler: () => {
                closeNotificationCenter();
                editContentItem(pendingIdeas[0].id);
            }
        });
    }

    // 6. Upcoming Shoots in Next 3 Days
    const futureShoots = AppState.shootSessions.filter(s => s.date > todayStr).sort((a,b) => new Date(a.date) - new Date(b.date));
    if (futureShoots.length > 0) {
        const nextShoot = futureShoots[0];
        const notifId = `notif-shoot-upcoming-${nextShoot.id}`;
        const client = AppState.clients.find(c => c.id === nextShoot.clientId) || { name: 'عميل' };
        notifs.push({
            id: notifId,
            priority: 3,
            category: 'shoot',
            title: `جلسة تصوير قادمة: ${client.name}`,
            message: `تاريخ: ${nextShoot.date} (${nextShoot.time}) - ${nextShoot.location}`,
            timeLabel: nextShoot.date,
            clientName: client.name,
            clientId: nextShoot.clientId,
            icon: 'fa-solid fa-video text-rose-600 bg-rose-50',
            badge: 'قريباً',
            badgeColor: 'bg-amber-100 text-amber-800',
            isRead: readIds.includes(notifId),
            handler: () => {
                closeNotificationCenter();
                navigateToShootSession(nextShoot.id);
            }
        });
    }

    // Sort: unread first, then by priority ascending (1 = Critical, 2 = Today, 3 = Review)
    return notifs.sort((a, b) => {
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        return a.priority - b.priority;
    });
}

function updateNotificationBadge() {
    const notifs = getSystemNotifications();
    const unreadCount = notifs.filter(n => !n.isRead).length;

    const badgeEl = document.getElementById('notif-badge-count');
    if (!badgeEl) return;

    if (unreadCount === 0) {
        badgeEl.classList.add('hidden');
        badgeEl.textContent = '0';
    } else {
        badgeEl.classList.remove('hidden');
        badgeEl.textContent = unreadCount > 9 ? '9+' : unreadCount;
    }
}

function toggleNotificationCenter(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('notification-center-dropdown');
    if (!dropdown) return;

    const isHidden = dropdown.classList.contains('hidden');
    if (isHidden) {
        // Close global add menu if open
        if (typeof closeGlobalAddMenu === 'function') closeGlobalAddMenu();
        dropdown.classList.remove('hidden');
        dropdown.classList.add('dropdown-pop');
        renderNotificationCenter();
    } else {
        dropdown.classList.add('hidden');
        dropdown.classList.remove('dropdown-pop');
    }
}

function closeNotificationCenter() {
    const dropdown = document.getElementById('notification-center-dropdown');
    if (dropdown) {
        dropdown.classList.add('hidden');
        dropdown.classList.remove('dropdown-pop');
    }
}

function renderNotificationCenter() {
    const container = document.getElementById('notif-items-list');
    if (!container) return;

    const allNotifs = getSystemNotifications();
    const filter = AppState.notificationFilter || 'all';

    let displayNotifs = allNotifs;
    if (filter === 'unread') {
        displayNotifs = allNotifs.filter(n => !n.isRead);
    }

    const unreadCount = allNotifs.filter(n => !n.isRead).length;

    // Update filter tabs active style
    const tabAll = document.getElementById('notif-filter-all');
    const tabUnread = document.getElementById('notif-filter-unread');
    if (tabAll && tabUnread) {
        if (filter === 'all') {
            tabAll.className = "px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-2xs cursor-pointer";
            tabUnread.className = "px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer";
        } else {
            tabAll.className = "px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer";
            tabUnread.className = "px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-2xs cursor-pointer";
        }
    }

    // Empty State
    if (displayNotifs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-10 px-4 space-y-2">
                <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mx-auto">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <h4 class="font-bold text-slate-800 text-sm">كل شيء تحت السيطرة ✓</h4>
                <p class="text-xs text-slate-400 max-w-xs mx-auto">لا توجد تنبيهات جديدة أو مهام عاجلة تتطلب تدخلك الآن.</p>
            </div>
        `;
        updateNotificationBadge();
        return;
    }

    container.innerHTML = displayNotifs.map(n => `
        <div onclick="handleNotificationClick('${n.id}')" class="p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative group ${n.isRead ? 'bg-white hover:bg-slate-50 border-slate-100 opacity-75' : 'bg-slate-50/80 hover:bg-indigo-50/50 border-slate-200/90 shadow-2xs'}">
            <!-- Icon -->
            <div class="w-8 h-8 rounded-xl ${n.icon.split(' ').slice(2).join(' ')} flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">
                <i class="${n.icon.split(' ').slice(0, 2).join(' ')}"></i>
            </div>

            <!-- Content -->
            <div class="min-w-0 flex-1 space-y-1">
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                        <span class="font-extrabold text-xs text-slate-900 truncate">${n.title}</span>
                        ${!n.isRead ? '<span class="w-2 h-2 rounded-full bg-brand-600 shrink-0"></span>' : ''}
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.2 rounded-md ${n.badgeColor} shrink-0">${n.badge}</span>
                </div>
                <p class="text-[11px] text-slate-600 font-medium line-clamp-2 leading-relaxed">${n.message}</p>
                <div class="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-0.5">
                    <span><i class="fa-solid fa-clock ml-1 text-slate-300"></i> ${n.timeLabel}</span>
                    <span class="text-brand-600 font-bold group-hover:underline">فتح الإجراء ↗</span>
                </div>
            </div>

            <!-- Mark single read/unread button -->
            <button onclick="event.stopPropagation(); toggleSingleNotificationRead('${n.id}')" class="text-slate-300 hover:text-slate-600 p-1 rounded-md text-xs shrink-0" title="${n.isRead ? 'تعليم كغير مقروء' : 'تعليم كمقروء'}">
                <i class="${n.isRead ? 'fa-regular fa-envelope' : 'fa-regular fa-envelope-open'}"></i>
            </button>
        </div>
    `).join('');

    updateNotificationBadge();
}

function handleNotificationClick(notifId) {
    if (!AppState.readNotifications) AppState.readNotifications = [];
    if (!AppState.readNotifications.includes(notifId)) {
        AppState.readNotifications.push(notifId);
        saveState();
    }

    const notifs = getSystemNotifications();
    const target = notifs.find(n => n.id === notifId);
    if (target && target.handler) {
        target.handler();
    }
}

function toggleSingleNotificationRead(notifId) {
    if (!AppState.readNotifications) AppState.readNotifications = [];
    const idx = AppState.readNotifications.indexOf(notifId);
    if (idx > -1) {
        AppState.readNotifications.splice(idx, 1);
    } else {
        AppState.readNotifications.push(notifId);
    }
    saveState();
    renderNotificationCenter();
}

function markAllNotificationsRead() {
    const notifs = getSystemNotifications();
    AppState.readNotifications = notifs.map(n => n.id);
    saveState();
    renderNotificationCenter();
    showToast('success', 'تم التحديث', 'تم تحديد جميع التنبيهات كمقروءة ✓');
}

function setNotificationFilter(filterKey) {
    AppState.notificationFilter = filterKey;
    renderNotificationCenter();
}

// Window click listener to close Notification Dropdown when clicking outside
window.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notification-center-dropdown');
    const btn = document.getElementById('notification-center-btn');
    if (dropdown && !dropdown.classList.contains('hidden')) {
        if (!dropdown.contains(e.target) && (!btn || !btn.contains(e.target))) {
            closeNotificationCenter();
        }
    }
});
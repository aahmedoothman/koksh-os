/**
 * ==========================================================================
 * Koksh Workspace OS — Dashboard (الرئيسية) Module
 * Phase 4: Full Interconnected Navigation (Dashboard ↔ Task ↔ Content ↔ Shoot ↔ Client ↔ Finance)
 * ==========================================================================
 */

function toggleFocusMode() {
    AppState.focusMode = !AppState.focusMode;
    saveState();
    renderDashboard();
    if (AppState.focusMode) {
        showToast('info', 'وضع التركيز 🎯', 'تم تفعيل وضع التركيز، وتم إخفاء الإحصائيات والمشتتات.');
    } else {
        showToast('info', 'الوضع القياسي', 'تم الخروج من وضع التركيز والعودة للعرض الكامل.');
    }
}

function renderDashboard() {
    const now = new Date();
    const hour = now.getHours();
    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Time-based Greeting & Date
    const greetingEl = document.getElementById('banner-greeting-text');
    if (greetingEl) {
        if (hour >= 5 && hour < 12) {
            greetingEl.innerHTML = "صباح الخير يا Koksh ☀️";
        } else {
            greetingEl.innerHTML = "مساء الخير يا Koksh 🌙";
        }
    }

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('ar-EG', options);
    const dateEl = document.getElementById('banner-date-text');
    if (dateEl) dateEl.textContent = dateStr;

    // 2. Focus Mode UI State
    const focusBanner = document.getElementById('focus-mode-banner');
    const normalBanner = document.getElementById('normal-greeting-banner');
    const analyticsSec = document.getElementById('dash-analytics-section');
    const focusToggleBtn = document.getElementById('focus-mode-toggle-btn');

    if (AppState.focusMode) {
        if (focusBanner) focusBanner.classList.remove('hidden');
        if (normalBanner) normalBanner.classList.add('hidden');
        if (analyticsSec) analyticsSec.classList.add('hidden');
        if (focusToggleBtn) {
            focusToggleBtn.classList.add('bg-amber-500', 'text-white');
            focusToggleBtn.classList.remove('bg-white/20', 'text-white');
            focusToggleBtn.innerHTML = '<i class="fa-solid fa-bullseye text-xs"></i> <span>وضع التركيز نشط</span>';
        }
    } else {
        if (focusBanner) focusBanner.classList.add('hidden');
        if (normalBanner) normalBanner.classList.remove('hidden');
        if (analyticsSec) analyticsSec.classList.remove('hidden');
        if (focusToggleBtn) {
            focusToggleBtn.classList.remove('bg-amber-500');
            focusToggleBtn.classList.add('bg-white/20', 'text-white');
            focusToggleBtn.innerHTML = '<i class="fa-solid fa-bullseye text-xs"></i> <span>وضع التركيز (Focus Mode)</span>';
        }
    }

    // 3. Priority Queue Algorithm (Determines #1 Today's Focus & Up Next)
    const priorityQueue = buildPriorityQueue(todayStr);

    renderTodaysFocus(priorityQueue[0]);
    renderUpNext(priorityQueue.slice(1, 5));
    renderNeedsAttention(todayStr);
    renderAnalytics();
}

/**
 * Smart Priority Queue Algorithm with Cross-Entity Relations:
 */
function buildPriorityQueue(todayStr) {
    const queue = [];

    // Priority 1: Uncompleted Urgent Tasks
    const urgentTasks = AppState.urgentTasks.filter(t => !t.done);
    urgentTasks.forEach(t => {
        const client = t.clientId ? AppState.clients.find(c => c.id === t.clientId) : null;
        queue.push({
            type: 'task',
            id: t.id,
            title: t.text,
            clientName: client ? client.name : '',
            clientId: t.clientId || null,
            contentId: t.contentId || null,
            shootId: t.shootId || null,
            statusBadge: 'عاجل',
            statusColor: 'bg-rose-100 text-rose-800 border-rose-200',
            dateText: 'مطلوب إنجازها الآن',
            rawItem: t
        });
    });

    // Priority 2: Shoots Scheduled for Today
    const todayShoots = AppState.shootSessions.filter(s => s.date === todayStr);
    todayShoots.forEach(s => {
        const client = AppState.clients.find(c => c.id === s.clientId) || { name: 'عميل غير محدد' };
        queue.push({
            type: 'shoot',
            id: s.id,
            title: `جلسة تصوير: ${client.name}`,
            clientName: client.name,
            clientId: s.clientId,
            contentId: null,
            shootId: s.id,
            statusBadge: `الساعة ${s.time}`,
            statusColor: 'bg-rose-100 text-rose-800 border-rose-200',
            dateText: `${s.location}`,
            rawItem: s
        });
    });

    // Priority 3: Today's Active Content Items
    const todayContent = AppState.contentItems.filter(i => i.date === todayStr && i.stage !== 'تم النشر');
    todayContent.forEach(item => {
        const client = AppState.clients.find(c => c.id === item.clientId) || { name: 'عميل' };
        queue.push({
            type: 'content',
            id: item.id,
            title: item.title,
            clientName: client.name,
            clientId: item.clientId,
            contentId: item.id,
            shootId: null,
            statusBadge: item.stage,
            statusColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            dateText: `${item.platform} • ${item.type}`,
            rawItem: item
        });
    });

    // Priority 4: Content needing Decision/Script
    const pendingDecisions = AppState.contentItems.filter(i => (i.stage === 'فكرة' || i.stage === 'سكريبت') && i.date !== todayStr);
    pendingDecisions.forEach(item => {
        const client = AppState.clients.find(c => c.id === item.clientId) || { name: 'عميل' };
        queue.push({
            type: 'content',
            id: item.id,
            title: item.title,
            clientName: client.name,
            clientId: item.clientId,
            contentId: item.id,
            shootId: null,
            statusBadge: item.stage,
            statusColor: 'bg-purple-100 text-purple-800 border-purple-200',
            dateText: `مجدول: ${item.date} (${item.platform})`,
            rawItem: item
        });
    });

    // Priority 5: Upcoming Shoots in next days
    const futureShoots = AppState.shootSessions.filter(s => s.date > todayStr).sort((a,b) => new Date(a.date) - new Date(b.date));
    futureShoots.forEach(s => {
        const client = AppState.clients.find(c => c.id === s.clientId) || { name: 'عميل' };
        queue.push({
            type: 'shoot',
            id: s.id,
            title: `جلسة تصوير: ${client.name}`,
            clientName: client.name,
            clientId: s.clientId,
            contentId: null,
            shootId: s.id,
            statusBadge: s.date,
            statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
            dateText: `الساعة ${s.time} - ${s.location}`,
            rawItem: s
        });
    });

    return queue;
}

/**
 * Render Section 1: TODAY'S FOCUS (Hero Spotlight Card)
 */
function renderTodaysFocus(heroItem) {
    const container = document.getElementById('todays-focus-container');
    if (!container) return;

    if (!heroItem) {
        // Zero-Inbox / All Done Celebration State
        container.innerHTML = `
            <div class="bg-gradient-to-l from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-emerald-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div class="space-y-2 text-center md:text-right">
                    <div class="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                        <i class="fa-solid fa-circle-check text-amber-300"></i>
                        <span>كل شيء تحت السيطرة ✓</span>
                    </div>
                    <h3 class="text-xl md:text-2xl font-black">أنت منجز كل مهامك الحالية يا Koksh! 🎉</h3>
                    <p class="text-emerald-100 text-xs font-medium max-w-lg">
                        لا توجد مهام متأخرة أو تسليمات معلقة الآن. يمكنك أخذ استراحة أو التخطيط للمحتوى القادم.
                    </p>
                </div>
                <div class="flex items-center gap-2.5">
                    <button onclick="openQuickIdeaModal()" class="bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-lightbulb text-amber-500"></i>
                        <span>+ تدوين فكرة جديدة</span>
                    </button>
                    <button onclick="switchTab('content')" class="bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2.5 rounded-2xl text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-calendar-days"></i>
                        <span>فتح التقويم</span>
                    </button>
                </div>
            </div>
        `;
        return;
    }

    let actionBtnHtml = '';
    let clientLinkHtml = '';

    if (heroItem.clientId && heroItem.clientName) {
        clientLinkHtml = `
            <button onclick="navigateToClientWorkspace('${heroItem.clientId}')" class="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200/80 px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer" title="فتح مساحة عمل ${heroItem.clientName}">
                <i class="fa-solid fa-user text-[9px] text-slate-400"></i>
                <span>${heroItem.clientName} ↗</span>
            </button>
        `;
    }

    if (heroItem.type === 'task') {
        actionBtnHtml = `
            <div class="flex items-center gap-2">
                ${heroItem.contentId ? `
                    <button onclick="navigateToContent('${heroItem.contentId}')" class="bg-slate-100 hover:bg-indigo-50 text-slate-700 font-bold px-3.5 py-2.5 rounded-2xl text-xs transition-all flex items-center gap-1 cursor-pointer">
                        <i class="fa-solid fa-file-lines text-indigo-600"></i> المحتوى ↗
                    </button>
                ` : ''}
                ${heroItem.shootId ? `
                    <button onclick="navigateToShootSession('${heroItem.shootId}')" class="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3.5 py-2.5 rounded-2xl text-xs transition-all flex items-center gap-1 cursor-pointer">
                        <i class="fa-solid fa-video text-rose-600"></i> الجلسة ↗
                    </button>
                ` : ''}
                <button onclick="toggleUrgentTask('${heroItem.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer">
                    <i class="fa-solid fa-check"></i>
                    <span>تحديد كمكتملة</span>
                </button>
            </div>
        `;
    } else if (heroItem.type === 'content') {
        actionBtnHtml = `
            <div class="flex items-center gap-2">
                <button onclick="viewFullScript('${heroItem.id}')" class="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2.5 rounded-2xl text-xs transition-all flex items-center gap-1.5 cursor-pointer">
                    <i class="fa-solid fa-file-lines text-indigo-600"></i>
                    <span>الاسكريبت</span>
                </button>
                <button onclick="editContentItem('${heroItem.id}')" class="bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer">
                    <i class="fa-solid fa-play"></i>
                    <span>ابدأ العمل / تعديل</span>
                </button>
            </div>
        `;
    } else if (heroItem.type === 'shoot') {
        actionBtnHtml = `
            <button onclick="navigateToShootSession('${heroItem.id}')" class="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer">
                <i class="fa-solid fa-video"></i>
                <span>فتح جلسة التصوير ↗</span>
            </button>
        `;
    }

    const typeIcons = {
        task: 'fa-solid fa-triangle-exclamation text-rose-600 bg-rose-50',
        content: 'fa-solid fa-layer-group text-indigo-600 bg-indigo-50',
        shoot: 'fa-solid fa-video text-rose-600 bg-rose-50'
    };

    container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 md:p-7 border-2 border-brand-500/80 shadow-card relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div class="flex items-start gap-4 flex-1 min-w-0">
                <div class="w-12 h-12 rounded-2xl ${typeIcons[heroItem.type] || 'bg-slate-100 text-slate-600'} flex items-center justify-center text-lg font-black shrink-0 shadow-xs mt-0.5">
                    <i class="${typeIcons[heroItem.type]?.split(' ') || 'fa-solid fa-bolt'}"></i>
                </div>
                <div class="space-y-1.5 flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse"></span> تركيزك الحالي (Focus Now)
                        </span>
                        <span class="${heroItem.statusColor} border text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ${heroItem.statusBadge}
                        </span>
                        ${clientLinkHtml}
                    </div>
                    <h3 class="text-base md:text-lg font-black text-slate-900 leading-snug truncate">${heroItem.title}</h3>
                    <p class="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                        <i class="fa-solid fa-clock text-slate-400"></i> ${heroItem.dateText}
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                ${actionBtnHtml}
            </div>
        </div>
    `;
}

/**
 * Render Section 2: UP NEXT (2 to 4 queued items with deep links)
 */
function renderUpNext(items) {
    const container = document.getElementById('up-next-list');
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400 font-semibold">
                لا توجد عناصر إضافية في قائمة الانتظار التالية ✓
            </div>
        `;
        return;
    }

    const typeIcons = {
        task: 'fa-solid fa-check text-slate-400',
        content: 'fa-solid fa-file-lines text-indigo-500',
        shoot: 'fa-solid fa-video text-rose-500'
    };

    container.innerHTML = items.map(item => `
        <div class="p-3.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/90 shadow-soft transition-all flex items-center justify-between gap-3 group">
            <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-indigo-50 text-slate-500 group-hover:text-indigo-600 flex items-center justify-center text-xs shrink-0 transition-colors">
                    <i class="${typeIcons[item.type] || 'fa-solid fa-circle-dot'}"></i>
                </div>
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                        <h4 class="font-bold text-xs text-slate-800 truncate">${item.title}</h4>
                        <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-md ${item.statusColor} shrink-0">${item.statusBadge}</span>
                    </div>
                    <div class="flex items-center gap-2 text-[11px] text-slate-400 font-medium truncate mt-0.5">
                        ${item.clientId ? `
                            <span onclick="event.stopPropagation(); navigateToClientWorkspace('${item.clientId}')" class="hover:text-brand-600 hover:underline cursor-pointer font-bold">
                                ${item.clientName} ↗
                            </span>
                            <span>•</span>
                        ` : ''}
                        <span>${item.dateText}</span>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
                ${item.type === 'task' ? `
                    <button onclick="toggleUrgentTask('${item.id}')" class="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                        إنجاز ✓
                    </button>
                ` : item.type === 'content' ? `
                    <button onclick="editContentItem('${item.id}')" class="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                        فتح ↗
                    </button>
                ` : `
                    <button onclick="navigateToShootSession('${item.id}')" class="bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                        جلسة التصوير ↗
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

/**
 * Render Section 3: NEEDS ATTENTION (Direct 1-Click Action Hub)
 */
function renderNeedsAttention(todayStr) {
    const container = document.getElementById('needs-attention-container');
    const wrapper = document.getElementById('needs-attention-section');
    if (!container || !wrapper) return;

    const urgentPending = AppState.urgentTasks.filter(t => !t.done);
    const contentNeedingScript = AppState.contentItems.filter(i => i.stage === 'فكرة' || i.stage === 'سكريبت');
    const upcomingShoots = AppState.shootSessions.filter(s => s.date >= todayStr);
    const overdueClients = AppState.clients.filter(c => (Number(c.retainer) || 0) > (Number(c.paid) || 0));

    const totalIssues = urgentPending.length + (contentNeedingScript.length > 0 ? 1 : 0) + (overdueClients.length > 0 ? 1 : 0);

    if (totalIssues === 0 && upcomingShoots.length === 0) {
        wrapper.classList.add('hidden');
        return;
    }

    wrapper.classList.remove('hidden');

    let html = '';

    // 1. Overdue Tasks Card
    if (urgentPending.length > 0) {
        html += `
            <div class="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-100/60 transition-colors" onclick="switchTab('today')">
                <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs shrink-0">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <div class="min-w-0">
                        <span class="font-bold text-slate-900 text-xs block truncate">${urgentPending.length} مهام عاجلة</span>
                        <span class="text-[10px] text-amber-800 font-semibold truncate block">${urgentPending[0]?.text || ''}</span>
                    </div>
                </div>
                <button class="text-xs font-bold text-amber-800 hover:underline shrink-0">متابعة ↗</button>
            </div>
        `;
    }

    // 2. Scripts Needing Decision
    if (contentNeedingScript.length > 0) {
        const firstItem = contentNeedingScript[0];
        html += `
            <div class="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:bg-purple-100/60 transition-colors" onclick="editContentItem('${firstItem.id}')">
                <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs shrink-0">
                        <i class="fa-solid fa-pen-fancy"></i>
                    </div>
                    <div class="min-w-0">
                        <span class="font-bold text-slate-900 text-xs block truncate">${contentNeedingScript.length} أفكار بانتظار الاعتماد</span>
                        <span class="text-[10px] text-purple-800 font-semibold truncate block">${firstItem.title}</span>
                    </div>
                </div>
                <button class="text-xs font-bold text-purple-800 hover:underline shrink-0">مراجعة ↗</button>
            </div>
        `;
    }

    // 3. Unpaid Retainers / Dues
    if (overdueClients.length > 0) {
        const totalDue = overdueClients.reduce((s,c) => s + (Number(c.retainer) - Number(c.paid)), 0);
        const targetClient = overdueClients[0];
        html += `
            <div class="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:bg-rose-100/60 transition-colors" onclick="openPaymentForClient('${targetClient.id}')">
                <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xs shrink-0">
                        <i class="fa-solid fa-hand-holding-dollar"></i>
                    </div>
                    <div class="min-w-0">
                        <span class="font-bold text-slate-900 text-xs block truncate">${overdueClients.length} عملاء عليهم متبقيات (${totalDue.toLocaleString()} ج.م)</span>
                        <span class="text-[10px] text-rose-800 font-semibold truncate block">${overdueClients.map(c => c.name).join('، ')}</span>
                    </div>
                </div>
                <button class="text-xs font-bold text-rose-800 hover:underline shrink-0">+ تحصيل</button>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Render Section 4: BOTTOM ANALYTICS & KPIs
 */
function renderAnalytics() {
    const activeCount = AppState.clients.filter(c => c.status === 'active').length;
    const clientKpiEl = document.getElementById('dash-kpi-clients');
    if (clientKpiEl) clientKpiEl.textContent = activeCount;

    const total = AppState.contentItems.length;
    const published = AppState.contentItems.filter(i => i.stage === 'تم النشر').length;
    const rate = total > 0 ? Math.round((published / total) * 100) : 0;
    const prodRateEl = document.getElementById('dash-kpi-prod-rate');
    if (prodRateEl) prodRateEl.textContent = `${rate}%`;
    const prodRatioEl = document.getElementById('dash-kpi-prod-ratio');
    if (prodRatioEl) prodRatioEl.textContent = `(${published}/${total} تم النشر)`;

    const shootsKpiEl = document.getElementById('dash-kpi-shoots');
    if (shootsKpiEl) shootsKpiEl.textContent = AppState.shootSessions.length;

    const totalMRR = AppState.clients.reduce((s,c) => s + (Number(c.retainer) || 0), 0);
    const totalPaid = AppState.clients.reduce((s,c) => s + (Number(c.paid) || 0), 0);
    const colRate = totalMRR > 0 ? Math.round((totalPaid / totalMRR) * 100) : 0;
    const mrrEl = document.getElementById('dash-kpi-mrr');
    if (mrrEl) mrrEl.textContent = `${totalMRR.toLocaleString()} ج.م`;
    const colRateEl = document.getElementById('dash-kpi-collected-rate');
    if (colRateEl) colRateEl.textContent = `${colRate}% محصل`;
}

function toggleUrgentTask(id) {
    const t = AppState.urgentTasks.find(x => x.id === id);
    if (t) {
        t.done = !t.done;
        saveState();
        renderAll();
        showToast("success", "إنجاز ممتاز! 🎉", "تم تحديث حالة المهمة بنجاح.");
    }
}
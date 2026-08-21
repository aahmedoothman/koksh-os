/**
 * ==========================================================================
 * Koksh Workspace OS — Action-First Dashboard & Top 3 Focus Engine
 * Phase 11: Top 3 Focus ("ركز على ده الآن"), Up Next, Attention & Bottom Analytics
 * ==========================================================================
 */

function toggleFocusMode() {
    AppState.focusMode = !AppState.focusMode;
    const body = document.body;
    const btn = document.getElementById('focus-mode-toggle-btn') || document.getElementById('btn-toggle-focus');
    const analyticsSec = document.getElementById('dash-analytics-section');

    if (AppState.focusMode) {
        if (btn) {
            btn.classList.add('bg-brand-600', 'text-white');
            btn.classList.remove('bg-slate-100', 'text-slate-700');
            btn.innerHTML = '<i class="fa-solid fa-eye-slash text-xs"></i> <span>وضع التركيز (مفعل)</span>';
        }
        if (analyticsSec) analyticsSec.classList.add('hidden');
        showToast("info", "وضع التركيز 🎯", "تم إخفاء التحليلات للتركيز الكامل على إنجاز مهام اليوم.");
    } else {
        if (btn) {
            btn.classList.remove('bg-brand-600', 'text-white');
            btn.classList.add('bg-slate-100', 'text-slate-700');
            btn.innerHTML = '<i class="fa-solid fa-crosshairs text-xs"></i> <span>وضع التركيز (Focus Mode)</span>';
        }
        if (analyticsSec) analyticsSec.classList.remove('hidden');
    }
}

function renderDashboard() {
    renderTop3Focus();
    renderTodaysFocus();
    renderUpNext();
    renderNeedsAttention();
    renderAnalytics();
}

// 1. TOP 3 FOCUS: "ركز على ده الآن" (Phase 11)
function renderTop3Focus() {
    const container = document.getElementById('top-3-focus-container');
    if (!container) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const allTasks = typeof collectAllSystemTasks === 'function' ? collectAllSystemTasks() : [];
    
    // Filter strictly actionable items (non-completed and non-waiting)
    const actionable = allTasks.filter(t => t.status !== 'completed' && t.status !== 'waiting');

    // Priority Sort: 1. Overdue, 2. Due Today, 3. Priority
    actionable.sort((a, b) => {
        const isOverdueA = a.dueDate && a.dueDate < todayStr;
        const isOverdueB = b.dueDate && b.dueDate < todayStr;
        if (isOverdueA && !isOverdueB) return -1;
        if (!isOverdueA && isOverdueB) return 1;

        const isTodayA = a.dueDate === todayStr;
        const isTodayB = b.dueDate === todayStr;
        if (isTodayA && !isTodayB) return -1;
        if (!isTodayA && isTodayB) return 1;

        const pWeight = { 'high': 3, 'medium': 2, 'low': 1 };
        const weightA = pWeight[a.priority] || 2;
        const weightB = pWeight[b.priority] || 2;
        if (weightA !== weightB) return weightB - weightA;

        return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
    });

    const top3 = actionable.slice(0, 3);

    if (top3.length === 0) {
        container.innerHTML = `
            <div class="bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-6 rounded-3xl border-2 border-emerald-200 shadow-soft flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-xs">
                        <i class="fa-solid fa-trophy"></i>
                    </div>
                    <div>
                        <h3 class="font-black text-slate-900 text-sm">كل الأعمال ذات الأولوية منجزة ✓</h3>
                        <p class="text-xs text-slate-500 mt-0.5">لا توجد مهام متأخرة أو أعمال حرجة تتطلب تدخلك الآن.</p>
                    </div>
                </div>
                <button onclick="switchTab('tasks')" class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs cursor-pointer">
                    فتح كل المهام ↗
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                        <i class="fa-solid fa-bullseye"></i>
                    </div>
                    <div>
                        <h3 class="font-black text-sm text-white">ركز على ده الآن (Top 3 Focus)</h3>
                        <p class="text-[11px] text-slate-300">أهم 3 مهام مطلوب إنجازها فوراً مرتبة بالأولوية</p>
                    </div>
                </div>
                <button onclick="switchTab('tasks')" class="text-xs text-indigo-300 hover:text-white font-bold cursor-pointer transition-colors">
                    إدارة المهام (${actionable.length}) ↗
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                ${top3.map((item, idx) => {
                    const client = (AppState.clients || []).find(c => c.id === item.clientId) || { name: 'عام' };
                    const isOverdue = item.dueDate && item.dueDate < todayStr;
                    return `
                        <div class="p-4 bg-white/10 hover:bg-white/15 rounded-2xl border ${isOverdue ? 'border-rose-400/60 bg-rose-950/30' : 'border-white/10'} backdrop-blur-md flex flex-col justify-between space-y-3 transition-all">
                            <div class="space-y-1.5">
                                <div class="flex items-center justify-between">
                                    <span class="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">${idx + 1}</span>
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${isOverdue ? 'bg-rose-500/80 text-white' : 'bg-white/20 text-slate-200'}">
                                        ${isOverdue ? 'متأخر ⚠️' : (item.dueDate === todayStr ? 'مطلوب اليوم' : item.dueDate)}
                                    </span>
                                </div>
                                <h4 class="font-bold text-white text-xs break-words leading-relaxed">${item.title}</h4>
                                <span class="text-[11px] text-indigo-200 block">${client.name}</span>
                            </div>

                            <button onclick="toggleUnifiedTaskDone('${item.id}')" class="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all">
                                <i class="fa-solid fa-check"></i>
                                <span>تم الإنجاز ✓</span>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// 2. Action Priority Queue Builder
function buildPriorityQueue() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const queue = [];

    // Shoots today
    AppState.shootSessions.filter(s => s.date === todayStr).forEach(s => {
        const client = AppState.clients.find(c => c.id === s.clientId) || { name: 'عميل' };
        queue.push({
            type: 'shoot',
            id: s.id,
            clientId: s.clientId,
            priority: 1,
            title: `جلسة تصوير: ${client.name}`,
            subtitle: `الساعة ${s.time} • ${s.location}`,
            actionLabel: 'فتح استوديو التصوير 🎬',
            actionHandler: () => navigateToShootSession(s.id),
            icon: 'fa-solid fa-video',
            iconBg: 'bg-rose-500 text-white'
        });
    });

    // Content scheduled today
    (AppState.contentItems || []).filter(i => !i.archived && i.date === todayStr && i.stage !== '✅ تم النشر' && i.stage !== 'تم النشر').forEach(i => {
        const client = AppState.clients.find(c => c.id === i.clientId) || { name: 'عميل' };
        queue.push({
            type: 'content',
            id: i.id,
            clientId: i.clientId,
            priority: 2,
            title: `نشر محتوى: ${i.title}`,
            subtitle: `${client.name} • ${i.platform} • ${i.stage}`,
            actionLabel: 'فتح المحتوى ↗',
            actionHandler: () => editContentItem(i.id),
            icon: 'fa-solid fa-layer-group',
            iconBg: 'bg-indigo-600 text-white'
        });
    });

    // Urgent Tasks
    AppState.urgentTasks.filter(t => !t.done).forEach(t => {
        const client = t.clientId ? AppState.clients.find(c => c.id === t.clientId) : null;
        queue.push({
            type: 'task',
            id: t.id,
            clientId: t.clientId || null,
            priority: 3,
            title: t.text,
            subtitle: client ? `عميل: ${client.name}` : 'مهمة عاجلة اليوم',
            actionLabel: 'تم الإنجاز ✓',
            actionHandler: () => toggleUrgentTask(t.id),
            icon: 'fa-solid fa-check',
            iconBg: 'bg-purple-600 text-white'
        });
    });

    return queue.sort((a, b) => a.priority - b.priority);
}

function renderTodaysFocus() {
    const container = document.getElementById('todays-focus-container');
    if (!container) return;

    const queue = buildPriorityQueue();
    const heroItem = queue[0];

    if (!heroItem) {
        container.innerHTML = `
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-3.5">
                    <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold shadow-xs">
                        <i class="fa-solid fa-check-double"></i>
                    </div>
                    <div>
                        <span class="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-0.5">ماذا أفعل الآن؟ (Current Priority)</span>
                        <h3 class="text-base font-black text-slate-900 leading-snug">جميع مهام اليوم ذات الأولوية منجزة بنجاح! 🎉</h3>
                        <p class="text-xs text-slate-400 mt-0.5">لا توجد جلسات تصوير أو منشورات مستعجلة الآن. يمكنك جدولة محتوى جديد أو مراجعة الأداء.</p>
                    </div>
                </div>
                <button onclick="openNewContentModal()" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs cursor-pointer whitespace-nowrap">
                    + جدولة محتوى جديد
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-start gap-3.5 min-w-0 flex-1">
                <div class="w-12 h-12 rounded-2xl ${heroItem.iconBg} flex items-center justify-center text-lg font-bold shadow-xs shrink-0 mt-0.5">
                    <i class="${heroItem.icon}"></i>
                </div>
                <div class="min-w-0 flex-1 space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                            التركيز الحالي (Top Priority)
                        </span>
                        ${heroItem.clientId ? `<button onclick="navigateToClientWorkspace('${heroItem.clientId}')" class="text-[10px] font-bold text-slate-500 hover:text-brand-600 hover:underline">مساحة العميل ↗</button>` : ''}
                    </div>
                    <h3 class="text-base md:text-lg font-black text-slate-900 leading-snug break-words">${heroItem.title}</h3>
                    <p class="text-xs text-slate-500 font-medium break-words">${heroItem.subtitle}</p>
                </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button id="hero-action-btn" class="bg-brand-600 hover:bg-brand-700 text-white font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer">
                    <span>${heroItem.actionLabel}</span>
                </button>
            </div>
        </div>
    `;

    const btn = document.getElementById('hero-action-btn');
    if (btn) btn.onclick = heroItem.actionHandler;
}

function renderUpNext() {
    const container = document.getElementById('up-next-list');
    if (!container) return;

    const queue = buildPriorityQueue();
    const nextItems = queue.slice(1, 4);

    if (nextItems.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs font-semibold">لا توجد عناصر إضافية في قائمة الانتظار لليوم.</div>`;
        return;
    }

    container.innerHTML = nextItems.map(item => `
        <div class="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 transition-colors cursor-pointer" onclick="handleUpNextClick('${item.type}', '${item.id}')">
            <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center text-xs font-bold shrink-0">
                    <i class="${item.icon}"></i>
                </div>
                <div class="min-w-0 flex-1">
                    <h4 class="font-bold text-xs text-slate-800 break-words leading-tight">${item.title}</h4>
                    <span class="text-[11px] text-slate-400 block break-words mt-0.5">${item.subtitle}</span>
                </div>
            </div>
            <button class="text-xs text-slate-400 hover:text-brand-600 font-bold shrink-0">
                إجراء ↗
            </button>
        </div>
    `).join('');
}

function handleUpNextClick(type, id) {
    if (type === 'shoot') navigateToShootSession(id);
    else if (type === 'content') editContentItem(id);
    else if (type === 'task') toggleUrgentTask(id);
}

function renderNeedsAttention() {
    const container = document.getElementById('needs-attention-container');
    if (!container) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const attentionItems = [];

    // 1. Unpaid Client Dues
    const overdueClients = (AppState.clients || []).filter(c => !c.archived && (Number(c.retainer) || 0) > (Number(c.paid) || 0));
    if (overdueClients.length > 0) {
        const topClient = overdueClients[0];
        const due = (Number(topClient.retainer) || 0) - (Number(topClient.paid) || 0);
        attentionItems.push({
            icon: 'fa-solid fa-hand-holding-dollar text-rose-600 bg-rose-50',
            title: `مستحقات معلقة: ${topClient.name}`,
            desc: `متبقي ${due.toLocaleString()} ج.م من اشتراك الشهر`,
            btnText: 'تسجيل دفعة 💰',
            btnColor: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
            handler: () => openPaymentForClient(topClient.id)
        });
    }

    // 2. Pending Content Decisions
    const pendingDecisions = (AppState.contentItems || []).filter(i => !i.archived && (i.stage === '💡 فكرة' || i.stage === 'فكرة' || i.stage === '📋 تخطيط') && i.date !== todayStr);
    if (pendingDecisions.length > 0) {
        attentionItems.push({
            icon: 'fa-solid fa-pen-fancy text-indigo-600 bg-indigo-50',
            title: `${pendingDecisions.length} أفكار واسكريبتات بانتظار الاعتماد`,
            desc: `أحدث فكرة: ${pendingDecisions[0].title.slice(0, 25)}...`,
            btnText: 'مراجعة الاسكريبت 📝',
            btnColor: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
            handler: () => editContentItem(pendingDecisions[0].id)
        });
    }

    // 3. Urgent Pending Tasks
    const pendingTasks = AppState.urgentTasks.filter(t => !t.done);
    if (pendingTasks.length > 0) {
        attentionItems.push({
            icon: 'fa-solid fa-check-double text-purple-600 bg-purple-50',
            title: `${pendingTasks.length} مهام عاجلة بانتظار الإنجاز`,
            desc: pendingTasks[0].text,
            btnText: 'فتح المهام ✓',
            btnColor: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
            handler: () => switchTab('tasks')
        });
    }

    if (attentionItems.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-4 px-6 bg-slate-50 rounded-2xl border border-slate-200/80 text-center text-slate-500 text-xs font-semibold flex items-center justify-center gap-2">
                <i class="fa-solid fa-shield-check text-emerald-600"></i>
                <span>لا توجد تنبيهات عاجلة تتطلب تدخلك الآن. جميع الحسابات منتظمة!</span>
            </div>
        `;
        return;
    }

    container.innerHTML = attentionItems.map(item => `
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-soft flex flex-col justify-between space-y-3">
            <div class="flex items-start gap-3 min-w-0">
                <div class="w-9 h-9 rounded-xl ${item.icon.split(' ').slice(2).join(' ')} flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <i class="${item.icon.split(' ').slice(0, 2).join(' ')}"></i>
                </div>
                <div class="min-w-0 flex-1">
                    <h4 class="font-bold text-slate-900 text-xs break-words">${item.title}</h4>
                    <p class="text-[11px] text-slate-400 font-medium break-words mt-0.5">${item.desc}</p>
                </div>
            </div>
            <button onclick="(${item.handler.toString()})()" class="w-full ${item.btnColor} font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer">
                ${item.btnText}
            </button>
        </div>
    `).join('');
}

function renderAnalytics() {
    const activeCount = (AppState.clients || []).filter(c => !c.archived && c.status === 'active').length;
    const clEl = document.getElementById('dash-kpi-clients');
    if (clEl) clEl.textContent = activeCount;

    const activeContent = (AppState.contentItems || []).filter(i => !i.archived);
    const total = activeContent.length;
    const published = activeContent.filter(i => i.stage === '✅ تم النشر' || i.stage === 'تم النشر').length;
    const rate = total > 0 ? Math.round((published / total) * 100) : 0;
    
    const rateEl = document.getElementById('dash-kpi-prod-rate');
    const rateSub = document.getElementById('dash-kpi-prod-ratio');
    if (rateEl) rateEl.textContent = `${rate}%`;
    if (rateSub) rateSub.textContent = `${published} من ${total} محتوى`;

    const activeClients = (AppState.clients || []).filter(c => !c.archived);
    const totalMRR = activeClients.reduce((s,c) => s + (Number(c.retainer) || 0), 0);
    const totalPaid = activeClients.reduce((s,c) => s + (Number(c.paid) || 0), 0);
    const finRate = totalMRR > 0 ? Math.round((totalPaid / totalMRR) * 100) : 0;

    const colEl = document.getElementById('dash-kpi-mrr');
    const colSub = document.getElementById('dash-kpi-collected-rate');
    if (colEl) colEl.textContent = `${finRate}%`;
    if (colSub) colSub.textContent = `${totalPaid.toLocaleString()} / ${totalMRR.toLocaleString()} ج.م`;
}

function toggleUrgentTask(taskId) {
    const task = AppState.urgentTasks.find(t => t.id === taskId);
    if (task) {
        task.done = !task.done;
        saveState();
        renderAll();
        showToast("success", "تحديث المهمة", task.done ? "تم إنجاز المهمة بنجاح! ✓" : "تمت إعادة فتح المهمة.");
    }
}
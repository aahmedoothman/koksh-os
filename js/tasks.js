/**
 * ==========================================================================
 * Koksh Workspace OS — Unified Tasks, Productivity & Review Queue Engine
 * Phase 11: Automatic Task Aggregation, Manual Tasks, Waiting & Review Queue
 * ==========================================================================
 */

function renderTasksTab() {
    const activeCategory = AppState.tasksCategoryFilter || 'ALL';
    const clientFilter = AppState.tasksClientFilter || 'ALL';
    const statusFilter = AppState.tasksStatusFilter || 'ALL';
    const priorityFilter = AppState.tasksPriorityFilter || 'ALL';

    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Gather all tasks (Manual + System Aggregated)
    const allCollectedTasks = collectAllSystemTasks();

    // 2. Compute Summary Metrics
    const overdueCount = allCollectedTasks.filter(t => t.status !== 'completed' && t.status !== 'waiting' && t.dueDate && t.dueDate < todayStr).length;
    const todayCount = allCollectedTasks.filter(t => t.status !== 'completed' && t.status !== 'waiting' && t.dueDate === todayStr).length;
    const upcomingCount = allCollectedTasks.filter(t => t.status !== 'completed' && t.status !== 'waiting' && t.dueDate && t.dueDate > todayStr).length;
    const completedCount = allCollectedTasks.filter(t => t.status === 'completed').length;
    const waitingCount = allCollectedTasks.filter(t => t.status === 'waiting').length;

    const elOverdue = document.getElementById('task-metric-overdue');
    const elToday = document.getElementById('task-metric-today');
    const elUpcoming = document.getElementById('task-metric-upcoming');
    const elCompleted = document.getElementById('task-metric-completed');
    const elWaiting = document.getElementById('task-metric-waiting');

    if (elOverdue) elOverdue.textContent = overdueCount;
    if (elToday) elToday.textContent = todayCount;
    if (elUpcoming) elUpcoming.textContent = upcomingCount;
    if (elCompleted) elCompleted.textContent = completedCount;
    if (elWaiting) elWaiting.textContent = waitingCount;

    // 3. Filter Tasks List
    let displayTasks = allCollectedTasks;

    if (activeCategory !== 'ALL') {
        displayTasks = displayTasks.filter(t => t.categoryKey === activeCategory);
    }
    if (clientFilter !== 'ALL') {
        displayTasks = displayTasks.filter(t => t.clientId === clientFilter);
    }
    if (statusFilter !== 'ALL') {
        displayTasks = displayTasks.filter(t => t.status === statusFilter);
    }
    if (priorityFilter !== 'ALL') {
        displayTasks = displayTasks.filter(t => t.priority === priorityFilter);
    }

    // Sort: Overdue first, then by Due Date ascending, then high priority
    displayTasks.sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        if (a.status === 'waiting' && b.status !== 'waiting') return 1;
        if (a.status !== 'waiting' && b.status === 'waiting') return -1;
        
        const dateA = a.dueDate || '9999-99-99';
        const dateB = b.dueDate || '9999-99-99';
        return dateA.localeCompare(dateB);
    });

    // 4. Render Tasks Category Buttons
    const catKeys = [
        { key: 'ALL', label: 'الكل', icon: 'fa-list-check' },
        { key: 'editing', label: 'مونتاج', icon: 'fa-scissors' },
        { key: 'design', label: 'تصميم', icon: 'fa-palette' },
        { key: 'ads', label: 'إعلانات', icon: 'fa-bullhorn' },
        { key: 'planning', label: 'تخطيط', icon: 'fa-compass-drafting' },
        { key: 'scheduling', label: 'جدولة', icon: 'fa-clock' },
        { key: 'manual', label: 'مهام يدوية', icon: 'fa-check-double' }
    ];

    const navContainer = document.getElementById('tasks-category-nav');
    if (navContainer) {
        navContainer.innerHTML = catKeys.map(cat => {
            const count = cat.key === 'ALL' 
                ? allCollectedTasks.filter(t => t.status !== 'completed').length 
                : allCollectedTasks.filter(t => t.categoryKey === cat.key && t.status !== 'completed').length;
            const isActive = activeCategory === cat.key;
            return `
                <button onclick="setTasksCategoryFilter('${cat.key}')" class="px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${isActive ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                    <i class="fa-solid ${cat.icon} text-[10px]"></i>
                    <span>${cat.label}</span>
                    <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'} font-black">${count}</span>
                </button>
            `;
        }).join('');
    }

    // 5. Render Review Queue if any items exist
    renderReviewQueue();

    // 6. Render Main Tasks List
    const taskContainer = document.getElementById('tasks-list-container');
    if (!taskContainer) return;

    if (displayTasks.length === 0) {
        taskContainer.innerHTML = `
            <div class="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-soft space-y-3">
                <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mx-auto">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <h3 class="font-bold text-slate-800 text-sm">لا توجد مهام في هذا التصنيف حالياً ✓</h3>
                <p class="text-xs text-slate-400 max-w-sm mx-auto">جميع الأعمال والمهام منجزة ومحدثة تماماً.</p>
                <button onclick="openNewTaskModal()" class="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-xs">
                    + إضافة مهمة يدوية
                </button>
            </div>
        `;
        return;
    }

    taskContainer.innerHTML = displayTasks.map(t => {
        const client = (AppState.clients || []).find(c => c.id === t.clientId) || { name: 'عام' };
        const isCompleted = t.status === 'completed';
        const isWaiting = t.status === 'waiting';
        const isOverdue = !isCompleted && !isWaiting && t.dueDate && t.dueDate < todayStr;
        const isToday = !isCompleted && !isWaiting && t.dueDate === todayStr;

        let statusBadge = '';
        if (isCompleted) {
            statusBadge = '<span class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">مكتملة ✓</span>';
        } else if (isWaiting) {
            statusBadge = `<span class="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full"><i class="fa-solid fa-hourglass-half ml-1"></i>${t.waitingReason || 'معلق'}</span>`;
        } else if (isOverdue) {
            statusBadge = '<span class="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">متأخرة ⚠️</span>';
        } else if (isToday) {
            statusBadge = '<span class="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full">اليوم 🔥</span>';
        }

        const priorityColors = {
            'high': 'bg-rose-100 text-rose-800',
            'medium': 'bg-amber-100 text-amber-800',
            'low': 'bg-slate-100 text-slate-600'
        }[t.priority] || 'bg-slate-100 text-slate-600';

        const categoryIcons = {
            'editing': 'fa-scissors text-purple-600 bg-purple-50',
            'design': 'fa-palette text-blue-600 bg-blue-50',
            'ads': 'fa-bullhorn text-emerald-600 bg-emerald-50',
            'planning': 'fa-compass-drafting text-amber-600 bg-amber-50',
            'scheduling': 'fa-clock text-indigo-600 bg-indigo-50',
            'manual': 'fa-check-double text-slate-700 bg-slate-100'
        }[t.categoryKey] || 'fa-check-double text-slate-700 bg-slate-100';

        return `
            <div class="p-4 bg-white hover:bg-slate-50/80 rounded-2xl border ${isOverdue ? 'border-rose-300 bg-rose-50/10' : (isCompleted ? 'border-slate-200 opacity-60' : 'border-slate-200')} shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 transition-all">
                <div class="flex items-start gap-3 min-w-0 flex-1">
                    <button onclick="toggleUnifiedTaskDone('${t.id}')" class="w-6 h-6 rounded-lg border flex items-center justify-center text-xs mt-0.5 transition-colors cursor-pointer shrink-0 ${isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 hover:border-brand-500 bg-white'}">
                        ${isCompleted ? '<i class="fa-solid fa-check"></i>' : ''}
                    </button>
                    <div class="space-y-1 min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="font-bold text-slate-900 text-xs break-words ${isCompleted ? 'line-through text-slate-400' : ''}">${t.title}</span>
                            ${statusBadge}
                            <span class="text-[10px] font-bold px-2 py-0.2 rounded-md ${priorityColors} shrink-0">${t.priority === 'high' ? 'أولوية قصوى' : (t.priority === 'medium' ? 'أولوية متوسطة' : 'عادية')}</span>
                        </div>
                        <div class="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-semibold pt-0.5">
                            ${t.clientId ? `<span class="text-slate-600 cursor-pointer hover:underline" onclick="navigateToClientWorkspace('${t.clientId}')"><i class="fa-solid fa-user ml-1 text-slate-400"></i>${client.name}</span>` : ''}
                            ${t.dueDate ? `<span><i class="fa-solid fa-calendar-day ml-1 text-slate-400"></i>تاريخ التسليم: ${t.dueDate}</span>` : ''}
                            ${t.sourceType === 'content' ? `<span class="text-brand-600 cursor-pointer hover:underline" onclick="editContentItem('${t.sourceId}')">فتح المحتوى ↗</span>` : ''}
                            ${t.sourceType === 'shoot' ? `<span class="text-rose-600 cursor-pointer hover:underline" onclick="navigateToShootSession('${t.sourceId}')">استوديو التصوير ↗</span>` : ''}
                        </div>
                        ${t.notes ? `<p class="text-[11px] text-slate-500 break-words mt-1 bg-slate-50 p-2 rounded-xl border border-slate-100">${t.notes}</p>` : ''}
                    </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                    ${!isCompleted ? `
                        <div class="relative group">
                            <button onclick="promptTaskWaiting('${t.id}')" class="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-amber-50 text-slate-600 hover:text-amber-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors" title="تعليق المهمة (Waiting)">
                                <i class="fa-solid fa-hourglass-half text-[10px]"></i>
                                <span>${isWaiting ? 'تحديث التعليق' : 'في الانتظار'}</span>
                            </button>
                        </div>
                    ` : ''}
                    ${t.isManual ? `
                        <button onclick="deleteManualTask('${t.id}')" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center text-xs cursor-pointer transition-colors" title="حذف المهمة">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Automatically Collect and Synthesize Tasks across all modules
function collectAllSystemTasks() {
    const tasks = [];
    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Manual Tasks from AppState.tasks
    (AppState.tasks || []).forEach(t => {
        tasks.push({
            id: t.id,
            title: t.title,
            clientId: t.clientId || null,
            categoryKey: t.type || 'manual',
            priority: t.priority || 'medium',
            dueDate: t.dueDate || todayStr,
            status: t.status || 'pending',
            waitingReason: t.waitingReason || null,
            notes: t.notes || '',
            isManual: true,
            sourceType: 'manual',
            sourceId: t.id
        });
    });

    // 2. Urgent Tasks (Legacy compatibility)
    (AppState.urgentTasks || []).forEach(u => {
        if (!tasks.some(t => t.id === u.id || t.title === u.text)) {
            tasks.push({
                id: u.id,
                title: u.text,
                clientId: u.clientId || null,
                categoryKey: 'manual',
                priority: 'high',
                dueDate: todayStr,
                status: u.done ? 'completed' : 'pending',
                waitingReason: null,
                notes: '',
                isManual: true,
                sourceType: u.contentId ? 'content' : (u.shootId ? 'shoot' : 'manual'),
                sourceId: u.contentId || u.shootId || u.id
            });
        }
    });

    // 3. Content in Editing / Design stage
    (AppState.contentItems || []).filter(i => !i.archived).forEach(i => {
        const isVideo = i.type === 'Reels / Short' || i.type === 'Video' || i.platform === 'TikTok' || i.platform === 'YouTube' || i.platform === 'YouTube Shorts';
        const isEditingStage = i.stage === '✂️ مونتاج / تصميم' || i.stage === 'مونتاج' || i.stage === '🎥 تم التصوير';
        const isPlanningStage = i.stage === '💡 فكرة' || i.stage === 'فكرة' || i.stage === '📋 تخطيط' || i.stage === 'سكريبت';
        const isSchedulingStage = i.stage === '📦 جاهز للجدولة' || i.stage === 'جاهز للنشر';

        if (isEditingStage) {
            tasks.push({
                id: 'sys-edit-' + i.id,
                title: `${isVideo ? 'مونتاج فيديو' : 'تنفيذ تصميم'}: ${i.title}`,
                clientId: i.clientId,
                categoryKey: isVideo ? 'editing' : 'design',
                priority: 'high',
                dueDate: i.date || todayStr,
                status: 'pending',
                waitingReason: null,
                notes: isVideo ? (i.hook ? `الهوك: ${i.hook}` : '') : (i.designBrief || ''),
                isManual: false,
                sourceType: 'content',
                sourceId: i.id
            });
        } else if (isPlanningStage) {
            tasks.push({
                id: 'sys-plan-' + i.id,
                title: `كتابة واعتماد اسكريبت: ${i.title}`,
                clientId: i.clientId,
                categoryKey: 'planning',
                priority: 'medium',
                dueDate: i.date || todayStr,
                status: 'pending',
                waitingReason: null,
                notes: i.body || '',
                isManual: false,
                sourceType: 'content',
                sourceId: i.id
            });
        } else if (isSchedulingStage) {
            tasks.push({
                id: 'sys-sched-' + i.id,
                title: `جدولة ونشر محتوى: ${i.title} (${i.platform})`,
                clientId: i.clientId,
                categoryKey: 'scheduling',
                priority: 'high',
                dueDate: i.date || todayStr,
                status: 'pending',
                waitingReason: null,
                notes: 'جاهز للنشر على المنصة المحددة',
                isManual: false,
                sourceType: 'content',
                sourceId: i.id
            });
        }
    });

    // 4. Clients without a Content Plan
    (AppState.clients || []).filter(c => !c.archived).forEach(c => {
        if (!c.contentPlan) {
            tasks.push({
                id: 'sys-client-plan-' + c.id,
                title: `إعداد خطة المحتوى الشهرية لعميل: ${c.name}`,
                clientId: c.id,
                categoryKey: 'planning',
                priority: 'high',
                dueDate: todayStr,
                status: 'pending',
                waitingReason: null,
                notes: 'العميل بانتظار إعداد خطة المنصات والتسليمات',
                isManual: false,
                sourceType: 'client',
                sourceId: c.id
            });
        }
    });

    // 5. Active Ad Campaigns
    (AppState.adsCampaigns || []).filter(a => a.status === 'active').forEach(a => {
        tasks.push({
            id: 'sys-ad-' + a.id,
            title: `متابعة وتحسين إعلانات: ${a.name} (${a.platform})`,
            clientId: a.clientId,
            categoryKey: 'ads',
            priority: 'medium',
            dueDate: todayStr,
            status: 'pending',
            waitingReason: null,
            notes: `الميزانية: ${(Number(a.budget)||0).toLocaleString()} ج.م - تم صرف: ${(Number(a.spend)||0).toLocaleString()} ج.م`,
            isManual: false,
            sourceType: 'ad',
            sourceId: a.id
        });
    });

    return tasks;
}

// Review Queue Rendering & Workflow Transition
function renderReviewQueue() {
    const queueContainer = document.getElementById('review-queue-container');
    if (!queueContainer) return;

    const reviewItems = (AppState.contentItems || []).filter(i => !i.archived && (i.stage === '🔍 مراجعة' || i.stage === 'مراجعة'));

    if (reviewItems.length === 0) {
        queueContainer.innerHTML = '';
        queueContainer.classList.add('hidden');
        return;
    }

    queueContainer.classList.remove('hidden');
    queueContainer.innerHTML = `
        <div class="bg-gradient-to-tr from-amber-50 to-orange-50/40 p-5 rounded-3xl border-2 border-amber-200/90 shadow-soft space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-amber-200/60">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                        <i class="fa-solid fa-clipboard-check"></i>
                    </div>
                    <div>
                        <h3 class="font-black text-slate-900 text-sm">طابور المراجعة والاعتماد (Review Queue)</h3>
                        <p class="text-[11px] text-slate-500">العناصر الجاهزة بانتظار موافقتك أو إعادتها للتعديل</p>
                    </div>
                </div>
                <span class="bg-amber-200 text-amber-900 font-extrabold text-xs px-2.5 py-1 rounded-full">${reviewItems.length} بانتظار الاعتماد</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                ${reviewItems.map(item => {
                    const client = (AppState.clients || []).find(c => c.id === item.clientId) || { name: 'عميل' };
                    return `
                        <div class="p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between space-y-3">
                            <div class="space-y-1.5">
                                <div class="flex items-center justify-between gap-2">
                                    <span class="font-bold text-slate-900 text-xs break-words">${item.title}</span>
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">${item.platform}</span>
                                </div>
                                <div class="text-[11px] text-slate-500">${client.name} • ${item.type} • تاريخ: ${item.date}</div>
                                ${item.hook ? `<div class="p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600 break-words border border-slate-100"><span class="font-bold text-amber-700">الهوك:</span> ${item.hook}</div>` : ''}
                                ${item.designBrief ? `<div class="p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600 break-words border border-slate-100"><span class="font-bold text-indigo-700">بريف التصميم:</span> ${item.designBrief}</div>` : ''}
                            </div>

                            <div class="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                                <button onclick="viewFullScript('${item.id}')" class="text-slate-500 hover:text-slate-800 text-[11px] font-bold cursor-pointer">
                                    <i class="fa-solid fa-eye ml-1"></i> معاينة كاملة
                                </button>
                                <div class="flex items-center gap-1.5">
                                    <button onclick="handleReviewNeedsChanges('${item.id}')" class="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer transition-colors">
                                        <i class="fa-solid fa-rotate-left ml-1"></i> طلب تعديلات
                                    </button>
                                    <button onclick="handleReviewApprove('${item.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors">
                                        <i class="fa-solid fa-check ml-1"></i> اعتماد ✓
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function handleReviewApprove(contentId) {
    const item = (AppState.contentItems || []).find(i => i.id === contentId);
    if (!item) return;

    item.stage = '📦 جاهز للجدولة';
    saveState();
    renderAll();
    showToast("success", "تم الاعتماد بنجاح! 🚀", `أصبح "${item.title.slice(0, 25)}..." جاهزاً للجدولة.`);
}

function handleReviewNeedsChanges(contentId) {
    const item = (AppState.contentItems || []).find(i => i.id === contentId);
    if (!item) return;

    const note = prompt("اكتب الملاحظات أو التعديلات المطلوبة لإعادتها للمونتير / المصمم:", item.revisionNote || "");
    if (note === null) return;

    item.stage = '✂️ مونتاج / تصميم';
    item.revisionNote = note;
    saveState();
    renderAll();
    showToast("info", "تمت الإعادة للتعديل", `تم نقل المحتوى إلى مرحلة المونتاج/التصميم مع الملاحظات.`);
}

// Unified Task Actions
function toggleUnifiedTaskDone(taskId) {
    // Check manual tasks
    const manualTask = (AppState.tasks || []).find(t => t.id === taskId);
    if (manualTask) {
        manualTask.status = manualTask.status === 'completed' ? 'pending' : 'completed';
        saveState();
        renderAll();
        return;
    }

    // Check urgent tasks legacy
    const urgentTask = (AppState.urgentTasks || []).find(u => u.id === taskId);
    if (urgentTask) {
        urgentTask.done = !urgentTask.done;
        saveState();
        renderAll();
        return;
    }

    // System tasks
    if (taskId.startsWith('sys-edit-')) {
        const cId = taskId.replace('sys-edit-', '');
        const item = (AppState.contentItems || []).find(i => i.id === cId);
        if (item) {
            item.stage = '🔍 مراجعة';
            saveState();
            renderAll();
            showToast("success", "تم إرسال المحتوى للمراجعة 🔍", `انتقل "${item.title.slice(0,25)}..." إلى طابور المراجعة.`);
        }
    } else if (taskId.startsWith('sys-sched-')) {
        const cId = taskId.replace('sys-sched-', '');
        const item = (AppState.contentItems || []).find(i => i.id === cId);
        if (item) {
            item.stage = '✅ تم النشر';
            saveState();
            renderAll();
            showToast("success", "تم تأكيد النشر! 🎉", `تم تحديث حالة المحتوى إلى تم النشر.`);
        }
    } else if (taskId.startsWith('sys-plan-')) {
        const cId = taskId.replace('sys-plan-', '');
        const item = (AppState.contentItems || []).find(i => i.id === cId);
        if (item) {
            item.stage = '🎬 جاهز للتصوير';
            saveState();
            renderAll();
            showToast("success", "تم تجهيز الاسكريبت", `المحتوى جاهز الآن للتصوير.`);
        }
    }
}

function promptTaskWaiting(taskId) {
    const reasons = [
        "Waiting for Client (بانتظار العميل)",
        "Waiting for Assets (بانتظار الماتريال/الصور)",
        "Waiting for Approval (بانتظار الاعتماد)",
        "Waiting for Payment (بانتظار الدفعة)",
        "Other (أخرى)"
    ];

    const selectedReason = prompt("اختر سبب التعليق أو اكتبه:\n1. Waiting for Client\n2. Waiting for Assets\n3. Waiting for Approval\n4. Waiting for Payment\n5. إلغاء التعليق والعودة للنشط", "Waiting for Client");
    if (selectedReason === null) return;

    let targetTask = (AppState.tasks || []).find(t => t.id === taskId);
    if (!targetTask) {
        // If it's a legacy or dynamic task, convert to manual state item
        const collected = collectAllSystemTasks().find(t => t.id === taskId);
        if (collected) {
            targetTask = {
                id: 'tsk-' + Date.now(),
                title: collected.title,
                clientId: collected.clientId,
                type: collected.categoryKey,
                priority: collected.priority,
                dueDate: collected.dueDate,
                status: 'pending',
                waitingReason: null,
                notes: collected.notes
            };
            if (!AppState.tasks) AppState.tasks = [];
            AppState.tasks.push(targetTask);
        }
    }

    if (targetTask) {
        if (selectedReason === '5' || selectedReason === 'active' || selectedReason === '') {
            targetTask.status = 'pending';
            targetTask.waitingReason = null;
            showToast("success", "تم تفعيل المهمة", "أصبحت المهمة نشطة وفي جدول العمل.");
        } else {
            targetTask.status = 'waiting';
            targetTask.waitingReason = selectedReason.includes('(') ? selectedReason.split('(')[0].trim() : selectedReason;
            showToast("info", "تم تعليق المهمة ⏳", `تم وضع المهمة في حالة الانتظار (${targetTask.waitingReason}).`);
        }
        saveState();
        renderAll();
    }
}

function deleteManualTask(taskId) {
    if (confirm("هل تريد حذف هذه المهمة؟")) {
        AppState.tasks = (AppState.tasks || []).filter(t => t.id !== taskId);
        AppState.urgentTasks = (AppState.urgentTasks || []).filter(u => u.id !== taskId);
        saveState();
        renderAll();
        showToast("info", "تم الحذف", "تمت إزالة المهمة بنجاح.");
    }
}

function setTasksCategoryFilter(catKey) {
    AppState.tasksCategoryFilter = catKey;
    renderTasksTab();
}

function setTasksClientFilter(clientId) {
    AppState.tasksClientFilter = clientId;
    renderTasksTab();
}

function setTasksStatusFilter(statusVal) {
    AppState.tasksStatusFilter = statusVal;
    renderTasksTab();
}

function setTasksPriorityFilter(priorityVal) {
    AppState.tasksPriorityFilter = priorityVal;
    renderTasksTab();
}
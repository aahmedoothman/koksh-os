/**
 * ==========================================================================
 * Koksh Workspace OS — Unified Tasks & Productivity Engine (js/tasks.js)
 * Clean Row-Based Workflow, Waiting Statuses, Review Queue & Categories
 * ==========================================================================
 */

const TASK_CATEGORIES = [
    { key: "all", label: "الكل", icon: "fa-solid fa-list-check" },
    { key: "editing", label: "المونتاج", icon: "fa-solid fa-scissors" },
    { key: "design", label: "التصميم", icon: "fa-solid fa-pen-nib" },
    { key: "ads", label: "إدارة الإعلانات", icon: "fa-solid fa-bullhorn" },
    { key: "planning", label: "التخطيط", icon: "fa-solid fa-lightbulb" },
    { key: "scheduling", label: "جدولة المحتوى", icon: "fa-solid fa-calendar-check" },
    { key: "manual", label: "مهام يدوية", icon: "fa-solid fa-check-double" }
];

function renderTasksTab() {
    renderTaskMetrics();
    renderCategoryNav();
    renderReviewQueue();
    renderTasksList();
    populateTasksClientFilter();
}

// 1. Task Metrics Header Counters
function renderTaskMetrics() {
    const allTasks = collectAllSystemTasks();
    const todayStr = new Date().toISOString().slice(0, 10);

    const overdueCount = allTasks.filter(t => t.status !== 'completed' && t.status !== 'waiting' && t.dueDate && t.dueDate < todayStr).length;
    const todayCount = allTasks.filter(t => t.status !== 'completed' && t.status !== 'waiting' && t.dueDate === todayStr).length;
    const upcomingCount = allTasks.filter(t => t.status !== 'completed' && t.status !== 'waiting' && t.dueDate && t.dueDate > todayStr).length;
    const waitingCount = allTasks.filter(t => t.status === 'waiting').length;
    const completedCount = allTasks.filter(t => t.status === 'completed').length;

    const elOverdue = document.getElementById('task-metric-overdue');
    const elToday = document.getElementById('task-metric-today');
    const elUpcoming = document.getElementById('task-metric-upcoming');
    const elWaiting = document.getElementById('task-metric-waiting');
    const elCompleted = document.getElementById('task-metric-completed');
    const elNavBadge = document.getElementById('tasks-badge-count');

    if (elOverdue) elOverdue.textContent = overdueCount;
    if (elToday) elToday.textContent = todayCount;
    if (elUpcoming) elUpcoming.textContent = upcomingCount;
    if (elWaiting) elWaiting.textContent = waitingCount;
    if (elCompleted) elCompleted.textContent = completedCount;

    const activeTotal = overdueCount + todayCount + upcomingCount;
    if (elNavBadge) elNavBadge.textContent = activeTotal;
}

// 2. Category Nav Filter Tabs
function renderCategoryNav() {
    const container = document.getElementById('tasks-category-nav');
    if (!container) return;

    const currentCat = AppState.tasksActiveCategory || 'all';
    const allTasks = collectAllSystemTasks();

    container.innerHTML = TASK_CATEGORIES.map(cat => {
        let count = 0;
        if (cat.key === 'all') {
            count = allTasks.filter(t => t.status !== 'completed').length;
        } else {
            count = allTasks.filter(t => t.categoryKey === cat.key && t.status !== 'completed').length;
        }

        const isActive = currentCat === cat.key;
        return `
            <button onclick="setTasksCategory('${cat.key}')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive 
                    ? 'bg-slate-900 text-white shadow-2xs' 
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
            }">
                <i class="${cat.icon} text-[11px] ${isActive ? 'text-indigo-400' : 'text-slate-400'}"></i>
                <span>${cat.label}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}">${count}</span>
            </button>
        `;
    }).join('');
}

function setTasksCategory(catKey) {
    AppState.tasksActiveCategory = catKey;
    renderTasksTab();
}

function setTasksClientFilter(clientId) {
    AppState.tasksClientFilter = clientId;
    renderTasksTab();
}

function setTasksStatusFilter(status) {
    AppState.tasksStatusFilter = status;
    renderTasksTab();
}

function populateTasksClientFilter() {
    const select = document.getElementById('tasks-client-filter');
    if (!select) return;
    const currentVal = select.value || AppState.tasksClientFilter || 'ALL';

    const activeClients = (AppState.clients || []).filter(c => !c.archived);
    select.innerHTML = '<option value="ALL">جميع العملاء</option>' + 
        activeClients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    select.value = currentVal;
}

// 3. System Task Auto-Aggregation Engine
function collectAllSystemTasks() {
    const tasks = [];
    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Manual User Tasks
    (AppState.tasks || []).forEach(t => {
        tasks.push({
            id: t.id,
            source: 'manual',
            title: t.title,
            clientId: t.clientId || null,
            categoryKey: t.type === 'editing' ? 'editing' : 
                         t.type === 'design' ? 'design' : 
                         t.type === 'ads' ? 'ads' : 
                         t.type === 'planning' ? 'planning' : 
                         t.type === 'scheduling' ? 'scheduling' : 'manual',
            categoryLabel: t.type === 'editing' ? 'مونتاج' : 
                           t.type === 'design' ? 'تصميم' : 
                           t.type === 'ads' ? 'إعلانات' : 
                           t.type === 'planning' ? 'تخطيط' : 
                           t.type === 'scheduling' ? 'جدولة' : 'مهمة يدوية',
            priority: t.priority || 'medium',
            dueDate: t.dueDate || todayStr,
            status: t.status || 'pending',
            waitingReason: t.waitingReason || null,
            notes: t.notes || '',
            raw: t
        });
    });

    // 2. Urgent Dashboard Tasks
    (AppState.urgentTasks || []).forEach(ut => {
        tasks.push({
            id: ut.id,
            source: 'urgent',
            title: ut.text,
            clientId: ut.clientId || null,
            categoryKey: 'manual',
            categoryLabel: 'مهمة عاجلة',
            priority: 'high',
            dueDate: todayStr,
            status: ut.done ? 'completed' : 'pending',
            waitingReason: null,
            notes: '',
            raw: ut
        });
    });

    // 3. Automated Video Editing Tasks from Content items in editing stage
    (AppState.contentItems || []).filter(i => !i.archived).forEach(i => {
        const isEditingStage = i.stage.includes('مونتاج') || i.stage.includes('تصميم') || i.stage.includes('تم التصوير');
        const isReviewStage = i.stage.includes('مراجعة');
        const isPlanningStage = i.stage.includes('فكرة') || i.stage.includes('تخطيط');
        const isReadyToSchedule = i.stage.includes('جاهز للجدولة') || i.stage.includes('جاهز للنشر');
        const isDone = i.stage.includes('تم النشر');

        const isVideo = i.type === 'Reels / Short' || i.type === 'Video';
        const isDesign = i.type === 'Single Post / تصميم' || i.type === 'Carousel / ألبوم';

        if (isVideo && isEditingStage && !isDone) {
            tasks.push({
                id: 'auto-edit-' + i.id,
                source: 'content',
                contentId: i.id,
                title: `مونتاج: ${i.title}`,
                clientId: i.clientId,
                categoryKey: 'editing',
                categoryLabel: 'مونتاج فيديو',
                priority: i.date === todayStr ? 'high' : 'medium',
                dueDate: i.date || todayStr,
                status: isDone ? 'completed' : (i.status === 'waiting' ? 'waiting' : 'pending'),
                waitingReason: i.waitingReason || null,
                notes: `المنصة: ${i.platform} • المرحلة: ${i.stage}`,
                raw: i
            });
        } else if (isDesign && isEditingStage && !isDone) {
            tasks.push({
                id: 'auto-design-' + i.id,
                source: 'content',
                contentId: i.id,
                title: `تصميم: ${i.title}`,
                clientId: i.clientId,
                categoryKey: 'design',
                categoryLabel: 'تصميم جرافيك',
                priority: i.date === todayStr ? 'high' : 'medium',
                dueDate: i.date || todayStr,
                status: isDone ? 'completed' : (i.status === 'waiting' ? 'waiting' : 'pending'),
                waitingReason: i.waitingReason || null,
                notes: `المنصة: ${i.platform} • المرحلة: ${i.stage}`,
                raw: i
            });
        } else if (isPlanningStage && !isDone) {
            tasks.push({
                id: 'auto-plan-' + i.id,
                source: 'content',
                contentId: i.id,
                title: `كتابة وتخطيط: ${i.title}`,
                clientId: i.clientId,
                categoryKey: 'planning',
                categoryLabel: 'تخطيط واسكريبت',
                priority: 'medium',
                dueDate: i.date || todayStr,
                status: isDone ? 'completed' : (i.status === 'waiting' ? 'waiting' : 'pending'),
                waitingReason: i.waitingReason || null,
                notes: `الهدف: ${i.goal || 'Awareness'} • ${i.platform}`,
                raw: i
            });
        } else if (isReadyToSchedule && !isDone) {
            tasks.push({
                id: 'auto-sched-' + i.id,
                source: 'content',
                contentId: i.id,
                title: `جدولة ونشر: ${i.title}`,
                clientId: i.clientId,
                categoryKey: 'scheduling',
                categoryLabel: 'جدولة ونشر',
                priority: 'high',
                dueDate: i.date || todayStr,
                status: isDone ? 'completed' : 'pending',
                waitingReason: null,
                notes: `جاهز للنشر على ${i.platform}`,
                raw: i
            });
        }
    });

    // 4. Automated Ads Tasks from Active Campaigns
    (AppState.adsCampaigns || []).forEach(ad => {
        if (ad.status === 'active' || ad.status === 'optimizing') {
            tasks.push({
                id: 'auto-ad-' + ad.id,
                source: 'ads',
                title: `متابعة إعلان: ${ad.name} (${ad.platform})`,
                clientId: ad.clientId,
                categoryKey: 'ads',
                categoryLabel: 'إدارة إعلانات',
                priority: 'medium',
                dueDate: todayStr,
                status: 'pending',
                waitingReason: null,
                notes: `الميزانية: ${ad.budget.toLocaleString('ar-EG')} ج.م • النتائج: ${ad.results || 'لا توجد نتائج مسجلة'}`,
                raw: ad
            });
        }
    });

    return tasks;
}

// 4. Review Queue (Phase 11 - Content Waiting for Approval)
function renderReviewQueue() {
    const container = document.getElementById('review-queue-container');
    if (!container) return;

    const reviewItems = (AppState.contentItems || []).filter(i => !i.archived && (i.stage === '🔍 مراجعة' || i.stage.includes('مراجعة')));
    
    if (reviewItems.length === 0) {
        container.classList.add('hidden');
        container.innerHTML = '';
        return;
    }

    container.classList.remove('hidden');
    container.innerHTML = `
        <div class="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-3 shadow-soft">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </div>
                    <h3 class="font-extrabold text-xs text-amber-950">طابور المراجعة والاعتماد (Review Queue)</h3>
                    <span class="bg-amber-200/80 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">${reviewItems.length} بانتظار قرارك</span>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${reviewItems.map(item => {
                    const client = (AppState.clients || []).find(c => c.id === item.clientId) || { name: 'عميل' };
                    return `
                        <div class="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs flex flex-col justify-between space-y-2.5">
                            <div class="space-y-1">
                                <div class="flex items-center justify-between text-[10px]">
                                    <span class="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">${client.name}</span>
                                    <span class="font-semibold text-slate-500">${item.platform} • ${item.type}</span>
                                </div>
                                <h4 class="font-bold text-xs text-slate-900 break-words">${item.title}</h4>
                            </div>

                            <div class="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-xs">
                                <button onclick="handleReviewApprove('${item.id}')" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1">
                                    <i class="fa-solid fa-check text-[10px]"></i> اعتماد ✓
                                </button>
                                <button onclick="handleReviewNeedsChanges('${item.id}')" class="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1">
                                    <i class="fa-solid fa-rotate-left text-[10px]"></i> طلب تعديل ✏️
                                </button>
                                <button onclick="editContentItem('${item.id}')" class="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs cursor-pointer" title="معاينة وتعديل">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function handleReviewApprove(itemId) {
    const item = (AppState.contentItems || []).find(i => i.id === itemId);
    if (item) {
        item.stage = '📦 جاهز للجدولة';
        saveState();
        renderAll();
        showToast("success", "تم الاعتماد بنجاح! 🚀", `أصبح "${item.title}" في مرحلة (جاهز للجدولة).`);
    }
}

function handleReviewNeedsChanges(itemId) {
    const note = prompt("يرجى كتابة ملاحظات التعديل المطلوبة:", "يرجى تعديل ألوان الفيديو وضبط الصوت");
    if (note !== null) {
        const item = (AppState.contentItems || []).find(i => i.id === itemId);
        if (item) {
            item.stage = '✂️ مونتاج / تصميم';
            item.shootNotes = (item.shootNotes ? item.shootNotes + " | " : "") + `ملاحظات المراجعة: ${note}`;
            saveState();
            renderAll();
            showToast("info", "تم إرجاع المحتوى للتعديل", "تمت إعادة المحتوى لمرحلة المونتاج/التصميم مع الملاحظات.");
        }
    }
}

// 5. Clean Row-Based Tasks List Render
function renderTasksList() {
    const container = document.getElementById('tasks-list-container');
    if (!container) return;

    const allTasks = collectAllSystemTasks();
    const categoryFilter = AppState.tasksActiveCategory || 'all';
    const clientFilter = AppState.tasksClientFilter || 'ALL';
    const statusFilter = AppState.tasksStatusFilter || 'ALL';
    const todayStr = new Date().toISOString().slice(0, 10);

    let filtered = allTasks;

    if (categoryFilter !== 'all') {
        filtered = filtered.filter(t => t.categoryKey === categoryFilter);
    }

    if (clientFilter !== 'ALL') {
        filtered = filtered.filter(t => t.clientId === clientFilter);
    }

    if (statusFilter === 'pending') {
        filtered = filtered.filter(t => t.status === 'pending');
    } else if (statusFilter === 'waiting') {
        filtered = filtered.filter(t => t.status === 'waiting');
    } else if (statusFilter === 'completed') {
        filtered = filtered.filter(t => t.status === 'completed');
    }

    // Sort: 1. Overdue first, 2. Today, 3. Upcoming, 4. Waiting, 5. Completed
    filtered.sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        if (a.status === 'waiting' && b.status !== 'waiting') return 1;
        if (a.status !== 'waiting' && b.status === 'waiting') return -1;

        const isOverdueA = a.dueDate && a.dueDate < todayStr;
        const isOverdueB = b.dueDate && b.dueDate < todayStr;
        if (isOverdueA && !isOverdueB) return -1;
        if (!isOverdueA && isOverdueB) return 1;

        return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-2xl p-10 border border-slate-200/80 text-center space-y-3 shadow-soft">
                <div class="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto">
                    <i class="fa-solid fa-list-check"></i>
                </div>
                <h4 class="font-bold text-sm text-slate-800">لا توجد مهام مطابقة للفلاتر</h4>
                <p class="text-xs text-slate-400">جميع المهام في هذا القسم منجزة أو لا توجد أعمال مسجلة حالياً.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
            <div class="divide-y divide-slate-100">
                ${filtered.map(task => {
                    const client = (AppState.clients || []).find(c => c.id === task.clientId) || { name: 'عام' };
                    const isDone = task.status === 'completed';
                    const isWaiting = task.status === 'waiting';
                    const isOverdue = !isDone && !isWaiting && task.dueDate && task.dueDate < todayStr;
                    const isToday = !isDone && !isWaiting && task.dueDate === todayStr;

                    let statusBadge = '';
                    if (isDone) {
                        statusBadge = '<span class="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200/60">مكتملة ✓</span>';
                    } else if (isWaiting) {
                        statusBadge = `<span class="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200/60 flex items-center gap-1"><i class="fa-solid fa-hourglass-half text-[9px]"></i> ${task.waitingReason || 'في الانتظار'}</span>`;
                    } else if (isOverdue) {
                        statusBadge = '<span class="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-rose-200/60">متأخرة ⚠️</span>';
                    } else if (isToday) {
                        statusBadge = '<span class="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-200/60">اليوم 🔥</span>';
                    } else {
                        statusBadge = `<span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">${task.dueDate || '-'}</span>`;
                    }

                    return `
                        <div class="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors ${isDone ? 'opacity-60 bg-slate-50/50' : ''}">
                            <!-- Left: Checkbox & Title Details -->
                            <div class="flex items-center gap-3 min-w-0 flex-1">
                                <button onclick="toggleUnifiedTaskDone('${task.id}')" class="w-5 h-5 rounded-lg border ${isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 hover:border-brand-500 bg-white'} flex items-center justify-center text-xs shrink-0 cursor-pointer transition-colors" title="${isDone ? 'إعادة فتح' : 'إنجاز المهمة'}">
                                    ${isDone ? '<i class="fa-solid fa-check text-[10px]"></i>' : ''}
                                </button>

                                <div class="min-w-0 flex-1 space-y-0.5">
                                    <div class="flex flex-wrap items-center gap-2">
                                        <h4 class="font-bold text-xs text-slate-900 truncate ${isDone ? 'line-through text-slate-400' : ''}">${task.title}</h4>
                                        <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200/60">${task.categoryLabel}</span>
                                    </div>
                                    <div class="flex items-center gap-2 text-[11px] text-slate-400">
                                        ${task.clientId ? `<span class="font-semibold text-brand-600 hover:underline cursor-pointer" onclick="navigateToClientWorkspace('${task.clientId}')">${client.name}</span>` : '<span>بدون عميل</span>'}
                                        ${task.notes ? `<span>• ${task.notes}</span>` : ''}
                                    </div>
                                </div>
                            </div>

                            <!-- Right: Status Badge, Waiting toggle, Actions -->
                            <div class="flex items-center gap-2 shrink-0">
                                ${statusBadge}
                                
                                ${!isDone ? `
                                    <button onclick="promptTaskWaiting('${task.id}')" class="p-1 text-slate-400 hover:text-amber-600 rounded text-xs transition-colors cursor-pointer" title="${isWaiting ? 'إلغاء وضع الانتظار' : 'تحويل لوضع الانتظار (Waiting)'}">
                                        <i class="fa-solid ${isWaiting ? 'fa-play text-emerald-600' : 'fa-pause'}"></i>
                                    </button>
                                ` : ''}

                                ${task.contentId ? `
                                    <button onclick="editContentItem('${task.contentId}')" class="p-1 text-slate-400 hover:text-brand-600 rounded text-xs transition-colors cursor-pointer" title="فتح قطعة المحتوى">
                                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                    </button>
                                ` : ''}

                                ${task.source === 'manual' ? `
                                    <button onclick="deleteManualTask('${task.id}')" class="p-1 text-slate-400 hover:text-rose-600 rounded text-xs transition-colors cursor-pointer" title="حذف المهمة">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// 6. Unified Task Actions & State Handlers
function toggleUnifiedTaskDone(taskId) {
    if (taskId.startsWith('auto-edit-') || taskId.startsWith('auto-design-') || taskId.startsWith('auto-plan-') || taskId.startsWith('auto-sched-')) {
        const contentId = taskId.replace(/^auto-[a-z]+-/, '');
        const item = (AppState.contentItems || []).find(i => i.id === contentId);
        if (item) {
            item.stage = item.stage === '✅ تم النشر' ? '💡 فكرة' : '✅ تم النشر';
            saveState();
            renderAll();
            showToast("success", "تم تحديث المهمة", `تم تحديث حالة محتوى "${item.title.slice(0, 20)}..."`);
        }
    } else if (taskId.startsWith('tsk-')) {
        const task = (AppState.tasks || []).find(t => t.id === taskId);
        if (task) {
            task.status = task.status === 'completed' ? 'pending' : 'completed';
            saveState();
            renderAll();
            showToast("success", "تم تحديث المهمة", task.status === 'completed' ? "تم إنجاز المهمة بنجاح ✓" : "تمت إعادة فتح المهمة.");
        }
    } else {
        toggleUrgentTask(taskId);
    }
}

function promptTaskWaiting(taskId) {
    const task = (AppState.tasks || []).find(t => t.id === taskId);
    if (task) {
        if (task.status === 'waiting') {
            task.status = 'pending';
            task.waitingReason = null;
            saveState();
            renderAll();
            showToast("info", "تم استئناف المهمة", "تمت إعادة المهمة للحالة النشطة.");
        } else {
            const reason = prompt("ما هو سبب الانتظار / التعليق؟", "Waiting for Client");
            if (reason) {
                task.status = 'waiting';
                task.waitingReason = reason;
                saveState();
                renderAll();
                showToast("info", "في الانتظار ⏳", `تم نقل المهمة لوضع الانتظار (${reason}).`);
            }
        }
        return;
    }

    if (taskId.startsWith('auto-')) {
        const contentId = taskId.replace(/^auto-[a-z]+-/, '');
        const item = (AppState.contentItems || []).find(i => i.id === contentId);
        if (item) {
            if (item.status === 'waiting') {
                item.status = 'pending';
                item.waitingReason = null;
                saveState();
                renderAll();
                showToast("info", "تم استئناف العمل", "تمت إزالة وضع الانتظار عن المحتوى.");
            } else {
                const reason = prompt("ما هو سبب تعليق هذا المحتوى؟", "Waiting for Client Approval");
                if (reason) {
                    item.status = 'waiting';
                    item.waitingReason = reason;
                    saveState();
                    renderAll();
                    showToast("info", "تم التعليق ⏳", `تم تعليق المحتوى بسبب: ${reason}`);
                }
            }
        }
    }
}

function deleteManualTask(taskId) {
    if (confirm("هل أنت متأكد من حذف هذه المهمة اليدوية؟")) {
        AppState.tasks = (AppState.tasks || []).filter(t => t.id !== taskId);
        saveState();
        renderAll();
        showToast("info", "تم الحذف", "تمت إزالة المهمة بنجاح.");
    }
}

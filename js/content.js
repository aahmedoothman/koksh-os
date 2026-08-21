/**
 * ==========================================================================
 * Koksh Workspace OS — Content & Weekly Planning Engine
 * Phase 10 & 12: Goals, Dynamic Content Types & 7-Day Weekly Planner
 * ==========================================================================
 */

function setContentSubView(view) {
    AppState.contentSubView = view;
    const btnCal = document.getElementById('btn-view-calendar');
    const btnWeek = document.getElementById('btn-view-weekly');
    const btnTbl = document.getElementById('btn-view-table');

    const subCal = document.getElementById('content-subview-calendar');
    const subWeek = document.getElementById('content-subview-weekly');
    const subTbl = document.getElementById('content-subview-table');

    if (btnCal) btnCal.className = "px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer";
    if (btnWeek) btnWeek.className = "px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer";
    if (btnTbl) btnTbl.className = "px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer";

    if (subCal) subCal.classList.add('hidden');
    if (subWeek) subWeek.classList.add('hidden');
    if (subTbl) subTbl.classList.add('hidden');

    if (view === 'calendar') {
        if (btnCal) btnCal.className = "px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-xs cursor-pointer";
        if (subCal) subCal.classList.remove('hidden');
    } else if (view === 'weekly') {
        if (btnWeek) btnWeek.className = "px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-xs cursor-pointer";
        if (subWeek) subWeek.classList.remove('hidden');
    } else {
        if (btnTbl) btnTbl.className = "px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-xs cursor-pointer";
        if (subTbl) subTbl.classList.remove('hidden');
    }
    renderContentTab();
}

function renderContentTab() {
    const search = (document.getElementById('content-search')?.value || '').toLowerCase();
    const clientF = document.getElementById('content-client-filter')?.value || 'ALL';
    const platF = document.getElementById('content-platform-filter')?.value || 'ALL';
    const stageF = document.getElementById('content-stage-filter')?.value || 'ALL';
    const goalF = document.getElementById('content-goal-filter')?.value || 'ALL';

    let allItems = AppState.contentItems || [];
    let items = allItems;

    if (stageF === 'ARCHIVED') {
        items = items.filter(i => i.archived === true);
    } else {
        items = items.filter(i => !i.archived);
        if (stageF !== 'ALL') items = items.filter(i => i.stage === stageF);
    }

    if (clientF !== 'ALL') items = items.filter(i => i.clientId === clientF);
    if (platF !== 'ALL') items = items.filter(i => i.platform === platF);
    if (goalF !== 'ALL') items = items.filter(i => i.goal === goalF);
    
    if (search) {
        items = items.filter(i => {
            const c = (AppState.clients || []).find(cl => cl.id === i.clientId) || { name: '' };
            return (i.title && i.title.toLowerCase().includes(search)) ||
                   (i.hook && i.hook.toLowerCase().includes(search)) ||
                   (i.caption && i.caption.toLowerCase().includes(search)) ||
                   (c.name && c.name.toLowerCase().includes(search));
        });
    }

    renderCalendarGrid(items);
    renderWeeklyPlanningView(items);
    renderMasterTableView(items);
}

// 1. Monthly Calendar Grid
function renderCalendarGrid(filteredItems) {
    const monthLabel = document.getElementById('calendar-month-label');
    const calDate = AppState.plannerCurrentMonth;
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    if (monthLabel) monthLabel.textContent = `${monthNames[calDate.getMonth()]} ${calDate.getFullYear()}`;

    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    const year = calDate.getFullYear();
    const month = calDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const arabFirstDayOffset = (firstDayIndex + 1) % 7; 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().slice(0, 10);

    let html = '';

    for (let i = 0; i < arabFirstDayOffset; i++) {
        html += `<div class="min-h-[105px] bg-slate-50/40 rounded-2xl border border-slate-100 p-2 opacity-30"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dayPadded = d < 10 ? `0${d}` : `${d}`;
        const monthPadded = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
        const dateKey = `${year}-${monthPadded}-${dayPadded}`;

        const isToday = dateKey === todayStr;
        const dayItems = filteredItems.filter(i => i.date === dateKey);

        html += `
            <div class="min-h-[110px] rounded-2xl border ${isToday ? 'border-brand-500 bg-brand-50/20 ring-2 ring-brand-500/20' : 'border-slate-200 bg-white'} p-2 flex flex-col justify-between transition-all hover:border-slate-300"
                 ondragover="handleDragOver(event)"
                 ondragleave="handleDragLeave(event)"
                 ondrop="handleDrop(event, '${dateKey}')">
                
                <div class="flex items-center justify-between mb-1.5">
                    <span class="w-6 h-6 rounded-lg ${isToday ? 'bg-brand-600 text-white font-black' : 'text-slate-700 font-bold'} flex items-center justify-center text-xs">
                        ${d}
                    </span>
                    <button onclick="openNewContentForDate('${dateKey}')" class="text-slate-300 hover:text-brand-600 text-[10px] p-0.5 cursor-pointer" title="إضافة محتوى لهذا اليوم">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>

                <div class="space-y-1 overflow-y-auto max-h-[85px]">
                    ${dayItems.map(item => {
                        const client = (AppState.clients || []).find(c => c.id === item.clientId) || { name: '' };
                        const iconClass = {
                            'Instagram': 'fa-brands fa-instagram text-pink-600',
                            'TikTok': 'fa-brands fa-tiktok text-slate-900',
                            'Facebook': 'fa-brands fa-facebook text-blue-600',
                            'YouTube': 'fa-brands fa-youtube text-red-600',
                            'Google Ads': 'fa-brands fa-google text-amber-600'
                        }[item.platform] || 'fa-solid fa-file';

                        return `
                            <div draggable="true" 
                                 ondragstart="handleDragStart(event, '${item.id}')"
                                 onclick="editContentItem('${item.id}')"
                                 class="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl cursor-grab active:cursor-grabbing text-[10px] font-bold text-slate-800 shadow-2xs flex items-start gap-1.5 select-none transition-colors"
                                 title="${item.title} (${client.name}) • ${item.goal || 'Awareness'}">
                                <i class="${iconClass} shrink-0 mt-0.5"></i>
                                <span class="break-words line-clamp-2 leading-tight flex-1">${item.title}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    grid.innerHTML = html;
}

// 2. 7-Day Weekly Planning Matrix View (Phase 12)
function renderWeeklyPlanningView(filteredItems) {
    const grid = document.getElementById('weekly-planning-grid');
    const rangeLabel = document.getElementById('weekly-range-label');
    if (!grid) return;

    const offset = AppState.plannerWeekOffset || 0;
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + (offset * 7));

    // Get Saturday as start of week in Arabic / Middle East calendar
    const currentDay = baseDate.getDay();
    const diffToSat = (currentDay + 1) % 7; 
    const saturday = new Date(baseDate);
    saturday.setDate(baseDate.getDate() - diffToSat);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(saturday);
        day.setDate(saturday.getDate() + i);
        weekDays.push(day);
    }

    const dayNames = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
    const startStr = weekDays[0].toISOString().slice(0, 10);
    const endStr = weekDays[6].toISOString().slice(0, 10);
    const todayStr = new Date().toISOString().slice(0, 10);

    if (rangeLabel) rangeLabel.textContent = `الأسبوع: ${startStr} إلى ${endStr}`;

    const allTasks = typeof collectAllSystemTasks === 'function' ? collectAllSystemTasks() : [];

    grid.innerHTML = weekDays.map((dayObj, idx) => {
        const dateKey = dayObj.toISOString().slice(0, 10);
        const isToday = dateKey === todayStr;

        const dayContent = filteredItems.filter(i => i.date === dateKey);
        const dayShoots = (AppState.shootSessions || []).filter(s => s.date === dateKey);
        const dayTasks = allTasks.filter(t => t.dueDate === dateKey && t.status !== 'completed');

        const totalItemsCount = dayContent.length + dayShoots.length + dayTasks.length;
        
        let loadBadge = '<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">هادئ 🟢</span>';
        if (totalItemsCount >= 5) {
            loadBadge = '<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">ضغط عالي 🔴</span>';
        } else if (totalItemsCount >= 2) {
            loadBadge = '<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">متوسط 🟡</span>';
        }

        return `
            <div class="bg-white rounded-2xl border ${isToday ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md' : 'border-slate-200'} p-3.5 flex flex-col justify-between space-y-3">
                <div class="space-y-2 pb-2 border-b border-slate-100">
                    <div class="flex items-center justify-between">
                        <span class="font-black text-slate-900 text-xs ${isToday ? 'text-brand-600 font-black' : ''}">${dayNames[idx]}</span>
                        ${loadBadge}
                    </div>
                    <div class="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                        <span>${dateKey}</span>
                        <button onclick="openNewContentForDate('${dateKey}')" class="text-brand-600 hover:underline cursor-pointer" title="إضافة محتوى">+ محتوى</button>
                    </div>
                </div>

                <div class="space-y-2.5 flex-1 overflow-y-auto max-h-[300px] text-xs">
                    <!-- Shoots on this day -->
                    ${dayShoots.map(s => {
                        const client = (AppState.clients || []).find(c => c.id === s.clientId) || { name: 'عميل' };
                        return `
                            <div onclick="navigateToShootSession('${s.id}')" class="p-2 bg-rose-50/70 hover:bg-rose-100 border border-rose-200 rounded-xl cursor-pointer transition-colors space-y-0.5">
                                <div class="font-bold text-rose-900 text-[11px] flex items-center gap-1">
                                    <i class="fa-solid fa-video text-[9px] text-rose-600"></i>
                                    <span class="break-words">تصوير: ${client.name}</span>
                                </div>
                                <div class="text-[10px] text-rose-700">${s.time} • ${s.location.slice(0, 20)}...</div>
                            </div>
                        `;
                    }).join('')}

                    <!-- Content scheduled on this day -->
                    ${dayContent.map(item => {
                        const client = (AppState.clients || []).find(c => c.id === item.clientId) || { name: '' };
                        return `
                            <div onclick="editContentItem('${item.id}')" class="p-2 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 rounded-xl cursor-pointer transition-colors space-y-1">
                                <div class="flex items-center justify-between gap-1">
                                    <span class="font-bold text-slate-900 text-[11px] break-words line-clamp-2 leading-tight">${item.title}</span>
                                </div>
                                <div class="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                                    <span>${client.name || item.platform}</span>
                                    <span class="font-bold text-indigo-600">${item.goal || 'Awareness'}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}

                    <!-- Tasks due on this day -->
                    ${dayTasks.map(t => `
                        <div class="p-2 bg-amber-50/60 border border-amber-200 rounded-xl text-[10px] font-bold text-amber-900 flex items-center gap-1.5">
                            <i class="fa-solid fa-check text-amber-600"></i>
                            <span class="break-words line-clamp-2">${t.title}</span>
                        </div>
                    `).join('')}

                    ${totalItemsCount === 0 ? `
                        <div class="py-6 text-center text-slate-300 text-[11px] italic">يوم هادئ بدون تسليمات</div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function navigatePlannerMonth(offset) {
    AppState.plannerCurrentMonth = new Date(AppState.plannerCurrentMonth.getFullYear(), AppState.plannerCurrentMonth.getMonth() + offset, 1);
    renderContentTab();
}

function navigatePlannerWeek(offset) {
    AppState.plannerWeekOffset = (AppState.plannerWeekOffset || 0) + offset;
    renderContentTab();
}

let draggedItemId = null;
function handleDragStart(e, itemId) {
    draggedItemId = itemId;
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
}
function handleDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function handleDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
function handleDrop(e, targetDate) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (!draggedItemId) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    if (targetDate < todayStr) {
        showToast("warning", "حماية التواريخ ⚠️", "لا يمكن نقل المنشور إلى تاريخ ماضٍ! يرجى اختيار تاريخ اليوم أو موعد مستقبلي.");
        draggedItemId = null;
        return;
    }

    const item = (AppState.contentItems || []).find(i => i.id === draggedItemId);
    if (item) {
        item.date = targetDate;
        saveState();
        renderAll();
        showToast("success", "إعادة الجدولة بنجاح", `تم نقل "${item.title.slice(0,25)}..." إلى ${targetDate}`);
    }
    draggedItemId = null;
}

// 3. Master Table View (Enhanced with Goal & Dynamic Badges)
function renderMasterTableView(items) {
    const totalContentCount = (AppState.contentItems || []).filter(i => !i.archived).length;
    const countEl = document.getElementById('content-table-count');
    if (countEl) countEl.textContent = `عرض ${items.length} من إجمالي ${totalContentCount} قطعة محتوى نشطة`;

    const tbody = document.getElementById('content-table-body');
    if (!tbody) return;

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-12 text-center text-slate-400 font-semibold">لا توجد نتائج مطابقة للفلاتر المحددة</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(item => {
        const client = (AppState.clients || []).find(c => c.id === item.clientId) || { name: 'غير محدد' };
        const matchingShoot = (AppState.shootSessions || []).find(s => (s.items && s.items.includes(item.id)) || (s.clientId === item.clientId && s.date === item.date));
        const platIcons = {
            'Instagram': 'fa-brands fa-instagram text-pink-600',
            'TikTok': 'fa-brands fa-tiktok text-slate-900',
            'Facebook': 'fa-brands fa-facebook text-blue-600',
            'YouTube': 'fa-brands fa-youtube text-red-600',
            'Google Ads': 'fa-brands fa-google text-amber-600'
        };

        return `
            <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="py-3 px-4 font-bold text-slate-900 align-top">
                    <div class="flex items-center gap-2 cursor-pointer group" onclick="navigateToClientWorkspace('${item.clientId}')" title="فتح مساحة عمل ${client.name}">
                        <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-[10px] group-hover:bg-brand-600 group-hover:text-white transition-colors shrink-0">
                            ${client.name.charAt(0)}
                        </div>
                        <span class="break-words max-w-[140px] leading-tight group-hover:text-brand-600 group-hover:underline transition-colors">${client.name}</span>
                    </div>
                </td>

                <td class="py-3 px-4 cursor-pointer align-top" onclick="editContentItem('${item.id}')">
                    <div class="flex flex-col gap-1 max-w-sm">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="font-bold text-slate-900 text-xs hover:text-brand-600 transition-colors break-words leading-relaxed">${item.title}</span>
                            ${matchingShoot ? `
                                <span onclick="event.stopPropagation(); navigateToShootSession('${matchingShoot.id}')" class="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200 shrink-0 cursor-pointer" title="فتح جلسة التصوير">
                                    <i class="fa-solid fa-video text-[9px]"></i> جلسة: ${matchingShoot.date}
                                </span>
                            ` : ''}
                            ${item.archived ? `
                                <span class="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded-md">مؤرشف 📦</span>
                            ` : ''}
                        </div>
                        ${item.hook ? `
                            <div class="text-[11px] text-slate-500 break-words leading-snug bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                <span class="text-amber-700 font-bold">الهوك:</span> ${item.hook}
                            </div>
                        ` : ''}
                        ${item.designBrief ? `
                            <div class="text-[11px] text-slate-500 break-words leading-snug bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                <span class="text-indigo-700 font-bold">بريف التصميم:</span> ${item.designBrief}
                            </div>
                        ` : ''}
                    </div>
                </td>

                <td class="py-3 px-4 whitespace-nowrap align-top">
                    <div class="flex items-center gap-1.5 font-bold text-[11px]">
                        <i class="${platIcons[item.platform] || 'fa-solid fa-cube'}"></i>
                        <span>${item.platform}</span>
                        <span class="text-slate-400 font-medium">(${item.type})</span>
                    </div>
                </td>

                <td class="py-3 px-4 whitespace-nowrap align-top">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        ${item.goal || 'Awareness'}
                    </span>
                </td>

                <td class="py-3 px-4 whitespace-nowrap font-bold text-slate-700 text-xs align-top">${item.date}</td>

                <td class="py-3 px-4 whitespace-nowrap align-top">
                    <select onchange="updateItemStage('${item.id}', this.value)" class="bg-slate-50 border border-slate-200 text-[11px] font-bold rounded-lg px-2 py-1 text-slate-800 focus:outline-none cursor-pointer">
                        ${CONTENT_STAGES.map(st => `<option value="${st.value}" ${item.stage === st.value ? 'selected' : ''}>${st.label}</option>`).join('')}
                    </select>
                </td>

                <td class="py-3 px-4 text-center whitespace-nowrap align-top">
                    <div class="flex items-center justify-center gap-1.5">
                        <button onclick="viewFullScript('${item.id}')" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs cursor-pointer transition-colors" title="عرض الاسكريبت / التفاصيل">
                            <i class="fa-solid fa-file-lines"></i>
                        </button>
                        <button onclick="editContentItem('${item.id}')" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs cursor-pointer transition-colors" title="تعديل">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        ${item.archived ? `
                            <button onclick="restoreContentItem('${item.id}')" class="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs cursor-pointer transition-colors" title="استعادة من الأرشيف">
                                <i class="fa-solid fa-arrow-rotate-left"></i>
                            </button>
                            <button onclick="deleteContentItem('${item.id}')" class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs cursor-pointer transition-colors" title="حذف نهائي">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        ` : `
                            <button onclick="archiveContentItem('${item.id}')" class="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 flex items-center justify-center text-xs cursor-pointer transition-colors" title="أرشفة المحتوى">
                                <i class="fa-solid fa-box-archive"></i>
                            </button>
                        `}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function archiveContentItem(itemId) {
    const item = (AppState.contentItems || []).find(i => i.id === itemId);
    if (!item) return;

    if (confirm(`هل تريد أرشفة محتوى "${item.title.slice(0, 30)}..."؟`)) {
        item.archived = true;
        saveState();
        renderAll();
        showToast("info", "تمت أرشفة المحتوى 📦", "تم نقل قطعة المحتوى للأرشيف ويمكن استعادتها في أي وقت.");
    }
}

function restoreContentItem(itemId) {
    const item = (AppState.contentItems || []).find(i => i.id === itemId);
    if (!item) return;

    item.archived = false;
    saveState();
    renderAll();
    showToast("success", "تمت استعادة المحتوى ✓", "تمت إعادة قطعة المحتوى للجدول النشط بنجاح.");
}

function exportMasterPlanCSV() {
    let csv = "ID,Client,Title,Platform,Type,Goal,Date,Stage,Hook,Body,CTA,Archived\n";
    (AppState.contentItems || []).forEach(item => {
        const client = (AppState.clients || []).find(c => c.id === item.clientId) || { name: '' };
        const clean = (text) => `"${(text || '').replace(/"/g, '""')}"`;
        csv += `${clean(item.id)},${clean(client.name)},${clean(item.title)},${clean(item.platform)},${clean(item.type)},${clean(item.goal || 'Awareness')},${clean(item.date)},${clean(item.stage)},${clean(item.hook || item.designBrief || '')},${clean(item.body || item.caption || '')},${clean(item.cta)},${item.archived ? "Yes" : "No"}\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `koksh_content_master_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast("success", "تم التصدير", "تم تنزيل ملف المحتوى بنجاح!");
}
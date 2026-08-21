/**
 * ==========================================================================
 * Koksh Workspace OS — Content (المحتوى) Module
 * Phase 4: Interconnected Master Table & Calendar (Content ↔ Client ↔ Shoot)
 * ==========================================================================
 */

function setContentSubView(view) {
    AppState.contentSubView = view;
    const btnCal = document.getElementById('btn-view-calendar');
    const btnTbl = document.getElementById('btn-view-table');
    const subCal = document.getElementById('content-subview-calendar');
    const subTbl = document.getElementById('content-subview-table');

    if (view === 'calendar') {
        if (btnCal) btnCal.className = "px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-xs";
        if (btnTbl) btnTbl.className = "px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900";
        if (subCal) subCal.classList.remove('hidden');
        if (subTbl) subTbl.classList.add('hidden');
    } else {
        if (btnCal) btnCal.className = "px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900";
        if (btnTbl) btnTbl.className = "px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-xs";
        if (subCal) subCal.classList.add('hidden');
        if (subTbl) subTbl.classList.remove('hidden');
    }
    renderContentTab();
}

function renderContentTab() {
    const search = (document.getElementById('content-search')?.value || '').toLowerCase();
    const clientF = document.getElementById('content-client-filter')?.value || 'ALL';
    const platF = document.getElementById('content-platform-filter')?.value || 'ALL';
    const stageF = document.getElementById('content-stage-filter')?.value || 'ALL';

    let items = AppState.contentItems;
    if (clientF !== 'ALL') items = items.filter(i => i.clientId === clientF);
    if (platF !== 'ALL') items = items.filter(i => i.platform === platF);
    if (stageF !== 'ALL') items = items.filter(i => i.stage === stageF);
    if (search) {
        items = items.filter(i => {
            const c = AppState.clients.find(cl => cl.id === i.clientId) || { name: '' };
            return i.title.toLowerCase().includes(search) ||
                   (i.hook && i.hook.toLowerCase().includes(search)) ||
                   c.name.toLowerCase().includes(search);
        });
    }

    renderCalendarGrid(items);
    renderMasterTableView(items);
}

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
            <div class="min-h-[105px] rounded-2xl border ${isToday ? 'border-brand-500 bg-brand-50/20 ring-2 ring-brand-500/20' : 'border-slate-200 bg-white'} p-2 flex flex-col justify-between transition-all hover:border-slate-300"
                 ondragover="handleDragOver(event)"
                 ondragleave="handleDragLeave(event)"
                 ondrop="handleDrop(event, '${dateKey}')">
                
                <div class="flex items-center justify-between mb-1.5">
                    <span class="w-6 h-6 rounded-lg ${isToday ? 'bg-brand-600 text-white font-black' : 'text-slate-700 font-bold'} flex items-center justify-center text-xs">
                        ${d}
                    </span>
                    <button onclick="openNewContentForDate('${dateKey}')" class="text-slate-300 hover:text-brand-600 text-[10px] p-0.5" title="إضافة محتوى لهذا اليوم">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>

                <div class="space-y-1 overflow-y-auto max-h-[80px]">
                    ${dayItems.map(item => {
                        const client = AppState.clients.find(c => c.id === item.clientId) || { name: '' };
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
                                 class="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl cursor-grab active:cursor-grabbing text-[10px] font-bold text-slate-800 shadow-2xs truncate flex items-center gap-1.5 select-none transition-colors"
                                 title="${item.title} (${client.name})">
                                <i class="${iconClass} shrink-0"></i>
                                <span class="truncate flex-1">${item.title}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    grid.innerHTML = html;
}

function navigatePlannerMonth(offset) {
    AppState.plannerCurrentMonth = new Date(AppState.plannerCurrentMonth.getFullYear(), AppState.plannerCurrentMonth.getMonth() + offset, 1);
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

    const item = AppState.contentItems.find(i => i.id === draggedItemId);
    if (item) {
        item.date = targetDate;
        saveState();
        renderAll();
        showToast("success", "إعادة الجدولة بنجاح", `تم نقل "${item.title.slice(0,25)}..." إلى ${targetDate}`);
    }
    draggedItemId = null;
}

function renderMasterTableView(items) {
    const countEl = document.getElementById('content-table-count');
    if (countEl) countEl.textContent = `عرض ${items.length} من إجمالي ${AppState.contentItems.length} قطعة محتوى`;

    const tbody = document.getElementById('content-table-body');
    if (!tbody) return;

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="py-12 text-center text-slate-400 font-semibold">لا توجد نتائج مطابقة للفلاتر</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(item => {
        const client = AppState.clients.find(c => c.id === item.clientId) || { name: 'غير محدد' };
        const matchingShoot = AppState.shootSessions.find(s => (s.items && s.items.includes(item.id)) || (s.clientId === item.clientId && s.date === item.date));
        const platIcons = {
            'Instagram': 'fa-brands fa-instagram text-pink-600',
            'TikTok': 'fa-brands fa-tiktok text-slate-900',
            'Facebook': 'fa-brands fa-facebook text-blue-600',
            'YouTube': 'fa-brands fa-youtube text-red-600',
            'Google Ads': 'fa-brands fa-google text-amber-600'
        };

        return `
            <tr class="hover:bg-slate-50/70 transition-colors">
                <!-- Clickable Client Column (Content ↔ Client) -->
                <td class="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                    <div class="flex items-center gap-2 cursor-pointer group" onclick="navigateToClientWorkspace('${item.clientId}')" title="فتح مساحة عمل ${client.name}">
                        <div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-[10px] group-hover:bg-brand-600 group-hover:text-white transition-colors">
                            ${client.name.charAt(0)}
                        </div>
                        <span class="truncate max-w-[130px] group-hover:text-brand-600 group-hover:underline transition-colors">${client.name}</span>
                    </div>
                </td>

                <!-- Content Title with Direct Shoot Link if linked -->
                <td class="py-3 px-4 cursor-pointer" onclick="editContentItem('${item.id}')">
                    <div class="flex items-center gap-2">
                        <div class="font-bold text-slate-800 text-xs line-clamp-1 hover:text-brand-600 transition-colors">${item.title}</div>
                        ${matchingShoot ? `
                            <span onclick="event.stopPropagation(); navigateToShootSession('${matchingShoot.id}')" class="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200 shrink-0 cursor-pointer" title="فتح جلسة التصوير">
                                <i class="fa-solid fa-video text-[9px]"></i> جلسة: ${matchingShoot.date}
                            </span>
                        ` : ''}
                    </div>
                    ${item.hook ? `<div class="text-[11px] text-slate-400 line-clamp-1 mt-0.5">${item.hook}</div>` : ''}
                </td>

                <td class="py-3 px-4 whitespace-nowrap">
                    <div class="flex items-center gap-1.5 font-bold text-[11px]">
                        <i class="${platIcons[item.platform] || 'fa-solid fa-cube'}"></i>
                        <span>${item.platform}</span>
                        <span class="text-slate-400 font-medium">(${item.type})</span>
                    </div>
                </td>

                <td class="py-3 px-4 whitespace-nowrap font-bold text-slate-700 text-xs">${item.date}</td>

                <td class="py-3 px-4 whitespace-nowrap">
                    <select onchange="updateItemStage('${item.id}', this.value)" class="bg-slate-50 border border-slate-200 text-[11px] font-bold rounded-lg px-2 py-1 text-slate-800 focus:outline-none">
                        <option value="فكرة" ${item.stage === 'فكرة' ? 'selected' : ''}>💡 فكرة</option>
                        <option value="سكريبت" ${item.stage === 'سكريبت' ? 'selected' : ''}>📝 سكريبت</option>
                        <option value="تصوير" ${item.stage === 'تصوير' ? 'selected' : ''}>🎬 تصوير</option>
                        <option value="مونتاج" ${item.stage === 'مونتاج' ? 'selected' : ''}>✂️ مونتاج</option>
                        <option value="جاهز للنشر" ${item.stage === 'جاهز للنشر' ? 'selected' : ''}>🚀 جاهز للنشر</option>
                        <option value="تم النشر" ${item.stage === 'تم النشر' ? 'selected' : ''}>✅ تم النشر</option>
                    </select>
                </td>

                <td class="py-3 px-4 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-1.5">
                        <button onclick="viewFullScript('${item.id}')" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs cursor-pointer" title="عرض الاسكريبت">
                            <i class="fa-solid fa-file-lines"></i>
                        </button>
                        <button onclick="editContentItem('${item.id}')" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs cursor-pointer" title="تعديل">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="deleteContentItem('${item.id}')" class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs cursor-pointer" title="حذف">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function exportMasterPlanCSV() {
    let csv = "ID,Client,Title,Platform,Type,Date,Stage,Hook,Body,CTA\n";
    AppState.contentItems.forEach(item => {
        const client = AppState.clients.find(c => c.id === item.clientId) || { name: '' };
        const clean = (text) => `"${(text || '').replace(/"/g, '""')}"`;
        csv += `${clean(item.id)},${clean(client.name)},${clean(item.title)},${clean(item.platform)},${clean(item.type)},${clean(item.date)},${clean(item.stage)},${clean(item.hook)},${clean(item.body)},${clean(item.cta)}\n`;
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
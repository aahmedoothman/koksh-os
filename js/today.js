/**
 * ==========================================================================
 * Koksh Workspace OS — Today (اليوم) Module
 * Phase 10-12: Action-Oriented Schedule, Content & Shoots Integration
 * ==========================================================================
 */

function renderTodayTab() {
    const dateInput = document.getElementById('today-date-picker');
    if (dateInput) dateInput.value = AppState.selectedDate;

    // Update Header Counter
    const activeContent = (AppState.contentItems || []).filter(i => !i.archived);
    const todayItems = activeContent.filter(i => i.date === AppState.selectedDate);
    const todayShoots = (AppState.shootSessions || []).filter(s => s.date === AppState.selectedDate);

    const subEl = document.getElementById('today-summary-sub');
    if (subEl) {
        subEl.textContent = `لديك ${todayItems.length} قطع محتوى مجدولة و ${todayShoots.length} جلسات تصوير في هذا اليوم.`;
    }

    // 1. Render Shoots Section for Selected Date
    const shootContainer = document.getElementById('today-shoots-container');
    if (shootContainer) {
        if (todayShoots.length === 0) {
            shootContainer.innerHTML = `
                <div class="py-6 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <i class="fa-solid fa-video text-2xl mb-1 text-slate-300"></i>
                    <p class="text-xs font-semibold">لا توجد جلسات تصوير مجدولة لهذا اليوم.</p>
                </div>
            `;
        } else {
            shootContainer.innerHTML = todayShoots.map(shoot => {
                const client = (AppState.clients || []).find(c => c.id === shoot.clientId) || { name: 'عميل' };
                return `
                    <div class="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                                <i class="fa-solid fa-clapperboard"></i>
                            </div>
                            <div>
                                <span class="font-extrabold text-slate-900 text-xs block">جلسة تصوير: ${client.name}</span>
                                <span class="text-[11px] text-slate-500 font-semibold block mt-0.5">
                                    <i class="fa-solid fa-clock text-rose-500 ml-1"></i>الساعة ${shoot.time} • 
                                    <i class="fa-solid fa-location-dot text-rose-500 ml-1"></i>${shoot.location}
                                </span>
                            </div>
                        </div>
                        <button onclick="navigateToShootSession('${shoot.id}')" class="bg-white border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition-colors cursor-pointer shrink-0">
                            فتح استوديو التصوير 🎬 ↗
                        </button>
                    </div>
                `;
            }).join('');
        }
    }

    // 2. Render Scheduled Content Items
    const contentContainer = document.getElementById('today-content-list');
    if (!contentContainer) return;

    if (todayItems.length === 0) {
        contentContainer.innerHTML = `
            <div class="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <i class="fa-solid fa-calendar-xmark text-3xl text-slate-300"></i>
                <h4 class="font-bold text-slate-700 text-xs">لا يوجد محتوى مجدول للنشر في هذا التاريخ</h4>
                <p class="text-[11px] text-slate-400">يمكنك جدولة منشور جديد أو سحب محتوى من التقويم لهذا اليوم.</p>
                <button onclick="openNewContentForDate('${AppState.selectedDate}')" class="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs cursor-pointer">
                    + جدولة محتوى لليوم
                </button>
            </div>
        `;
        return;
    }

    contentContainer.innerHTML = todayItems.map(item => {
        const client = (AppState.clients || []).find(c => c.id === item.clientId) || { name: 'غير محدد' };
        const matchingShoot = (AppState.shootSessions || []).find(s => (s.items && s.items.includes(item.id)) || (s.clientId === item.clientId && s.date === item.date));
        
        return `
            <div class="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-all">
                <div class="space-y-1.5 min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">${item.platform}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">${item.goal || 'Awareness'}</span>
                        <h4 class="font-bold text-slate-900 text-xs break-words leading-relaxed cursor-pointer hover:text-brand-600 transition-colors" onclick="editContentItem('${item.id}')">${item.title}</h4>
                        ${matchingShoot ? `
                            <span onclick="navigateToShootSession('${matchingShoot.id}')" class="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200 cursor-pointer" title="مرتبط بجلسة تصوير اليوم">
                                <i class="fa-solid fa-video text-[9px]"></i> جلسة تصوير ↗
                            </span>
                        ` : ''}
                    </div>
                    <div class="text-[11px] text-slate-500 font-semibold">
                        <span class="cursor-pointer hover:underline text-slate-700" onclick="navigateToClientWorkspace('${item.clientId}')">عميل: ${client.name}</span> • 
                        <span>النوع: ${item.type}</span>
                    </div>
                    ${item.hook ? `<p class="text-[11px] text-slate-600 break-words leading-snug bg-slate-50 p-2 rounded-xl border border-slate-100 mt-1"><span class="text-amber-700 font-bold">الهوك:</span> ${item.hook}</p>` : ''}
                    ${item.designBrief ? `<p class="text-[11px] text-slate-600 break-words leading-snug bg-slate-50 p-2 rounded-xl border border-slate-100 mt-1"><span class="text-indigo-700 font-bold">بريف التصميم:</span> ${item.designBrief}</p>` : ''}
                </div>

                <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <select onchange="updateItemStage('${item.id}', this.value)" class="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer">
                        ${CONTENT_STAGES.map(st => `<option value="${st.value}" ${item.stage === st.value ? 'selected' : ''}>${st.label}</option>`).join('')}
                    </select>
                    <button onclick="viewFullScript('${item.id}')" class="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer" title="عرض التفاصيل"><i class="fa-solid fa-file-lines"></i></button>
                    <button onclick="editContentItem('${item.id}')" class="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer" title="تعديل"><i class="fa-solid fa-pen"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

function onTodayDateChange(dateStr) {
    if (!dateStr) return;
    AppState.selectedDate = dateStr;
    renderTodayTab();
}
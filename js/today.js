/**
 * ==========================================================================
 * Koksh Workspace OS — Today (اليوم) Module
 * Phase 4: Interconnected Today Hub (Today ↔ Client ↔ Shoot ↔ Content)
 * ==========================================================================
 */

function renderTodayTab() {
    const picker = document.getElementById('today-date-picker');
    if (picker) picker.value = AppState.selectedDate;

    const label = document.getElementById('today-date-sublabel');
    if (label) label.textContent = `عرض تسليمات ومهام تاريخ: ${AppState.selectedDate}`;

    const container = document.getElementById('today-items-container');
    if (!container) return;

    const items = AppState.contentItems.filter(i => i.date === AppState.selectedDate);
    const shoots = AppState.shootSessions.filter(s => s.date === AppState.selectedDate);

    if (items.length === 0 && shoots.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <i class="fa-solid fa-calendar-check text-3xl text-slate-300 mb-2"></i>
                <p class="text-xs font-bold text-slate-500">لا توجد مهام أو محتوى مجدول لهذا اليوم</p>
                <button onclick="openNewContentForDate(AppState.selectedDate)" class="mt-3 bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs hover:bg-brand-700 cursor-pointer">
                    + إضافة محتوى لهذا التاريخ
                </button>
            </div>
        `;
        return;
    }

    let html = '';

    shoots.forEach(s => {
        const client = AppState.clients.find(c => c.id === s.clientId) || { name: 'عميل' };
        html += `
            <div class="p-4 rounded-2xl border-2 border-rose-200 bg-rose-50/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div class="flex items-center gap-3 cursor-pointer" onclick="navigateToClientWorkspace('${s.clientId}')">
                    <div class="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                        <i class="fa-solid fa-video"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-extrabold text-slate-900 text-xs hover:text-rose-700 transition-colors">جلسة تصوير: ${client.name}</span>
                            <span class="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md">الساعة ${s.time}</span>
                        </div>
                        <p class="text-[11px] text-slate-600 mt-0.5"><i class="fa-solid fa-location-dot text-rose-500 ml-1"></i> ${s.location}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="navigateToClientWorkspace('${s.clientId}')" class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer">
                        <i class="fa-solid fa-users text-[10px] ml-1"></i> مساحة العميل
                    </button>
                    <button onclick="navigateToShootSession('${s.id}')" class="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer">
                        تفاصيل الجلسة ↗
                    </button>
                </div>
            </div>
        `;
    });

    items.forEach(item => {
        const client = AppState.clients.find(c => c.id === item.clientId) || { name: 'عميل' };
        const matchingShoot = shoots.find(s => s.clientId === item.clientId);

        html += `
            <div class="p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-card transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="space-y-1.5 flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                        <!-- Clickable Client Tag (Content -> Client) -->
                        <span onclick="navigateToClientWorkspace('${item.clientId}')" class="font-bold text-[11px] text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 px-2 py-0.5 rounded-md cursor-pointer transition-colors" title="فتح مساحة عمل ${client.name}">
                            <i class="fa-solid fa-user text-[9px] ml-1 text-slate-400"></i>${client.name}
                        </span>
                        <span class="font-bold text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                            ${item.platform} • ${item.type}
                        </span>
                        ${matchingShoot ? `
                            <span onclick="navigateToShootSession('${matchingShoot.id}')" class="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-rose-200 cursor-pointer transition-colors">
                                <i class="fa-solid fa-video text-[9px] ml-0.5"></i> جلسة اليوم
                            </span>
                        ` : ''}
                    </div>
                    <h4 class="font-bold text-slate-900 text-xs truncate cursor-pointer hover:text-brand-600 transition-colors" onclick="editContentItem('${item.id}')">${item.title}</h4>
                    ${item.hook ? `<p class="text-[11px] text-slate-500 truncate"><span class="text-amber-600 font-bold">الهوك:</span> ${item.hook}</p>` : ''}
                </div>

                <div class="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                    <select onchange="updateItemStage('${item.id}', this.value)" class="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none">
                        <option value="فكرة" ${item.stage === 'فكرة' ? 'selected' : ''}>💡 فكرة</option>
                        <option value="سكريبت" ${item.stage === 'سكريبت' ? 'selected' : ''}>📝 سكريبت</option>
                        <option value="تصوير" ${item.stage === 'تصوير' ? 'selected' : ''}>🎬 تصوير</option>
                        <option value="مونتاج" ${item.stage === 'مونتاج' ? 'selected' : ''}>✂️ مونتاج</option>
                        <option value="جاهز للنشر" ${item.stage === 'جاهز للنشر' ? 'selected' : ''}>🚀 جاهز للنشر</option>
                        <option value="تم النشر" ${item.stage === 'تم النشر' ? 'selected' : ''}>✅ تم النشر</option>
                    </select>

                    <button onclick="viewFullScript('${item.id}')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs cursor-pointer" title="عرض الاسكريبت">
                        <i class="fa-solid fa-file-lines"></i>
                    </button>

                    <button onclick="editContentItem('${item.id}')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs cursor-pointer" title="تعديل">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button onclick="deleteContentItem('${item.id}')" class="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs cursor-pointer" title="حذف">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function navigateDay(offset) {
    const current = new Date(AppState.selectedDate);
    if (offset === 0) {
        AppState.selectedDate = new Date().toISOString().slice(0, 10);
    } else {
        current.setDate(current.getDate() + offset);
        AppState.selectedDate = current.toISOString().slice(0, 10);
    }
    renderAll();
}

function onTodayDateChange(val) {
    if (!val) return;
    AppState.selectedDate = val;
    renderAll();
}
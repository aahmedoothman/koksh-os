/**
 * ==========================================================================
 * Koksh Workspace OS — Shoots (التصوير) Module
 * ==========================================================================
 */

function renderShootsTab() {
    const container = document.getElementById('shoots-list-container');
    if (!container) return;

    if (AppState.shootSessions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-soft">
                <i class="fa-solid fa-clapperboard text-4xl text-slate-300 mb-3"></i>
                <h3 class="font-bold text-slate-700 text-sm">لا توجد جلسات تصوير مجهزة</h3>
                <button onclick="openNewShootModal()" class="mt-3 bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
                    + إنشاء جلسة تصوير
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = AppState.shootSessions.map(session => {
        const client = AppState.clients.find(c => c.id === session.clientId) || { name: 'عميل غير محدد' };
        const clientContent = AppState.contentItems.filter(i => i.clientId === session.clientId && (i.stage === 'تصوير' || i.stage === 'سكريبت'));

        return `
            <div class="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden space-y-4">
                <div class="p-6 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div class="flex items-center gap-3.5">
                        <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl font-black shrink-0">
                            <i class="fa-solid fa-video"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-black text-slate-900">${client.name}</h3>
                            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold mt-1">
                                <span><i class="fa-solid fa-calendar ml-1 text-slate-400"></i> ${session.date}</span>
                                <span><i class="fa-solid fa-clock ml-1 text-slate-400"></i> ${session.time}</span>
                                <span><i class="fa-solid fa-location-dot ml-1 text-rose-500"></i> ${session.location}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <button onclick="openNewContentForClient('${session.clientId}')" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5">
                            <i class="fa-solid fa-plus text-[10px]"></i> إضافة اسكريبت للجلسة
                        </button>
                        <button onclick="deleteShootSession('${session.id}')" class="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-slate-200 text-xs" title="حذف الجلسة">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>

                ${session.notes ? `
                    <div class="px-6 text-xs text-slate-600 bg-amber-50/50 p-3 mx-6 rounded-2xl border border-amber-200 flex items-start gap-2">
                        <i class="fa-solid fa-circle-info text-amber-600 mt-0.5"></i>
                        <span><strong>ملاحظات ومعدات:</strong> ${session.notes}</span>
                    </div>
                ` : ''}

                <div class="p-6 pt-0 space-y-3">
                    <div class="text-xs font-bold text-slate-500">اسكريبتات وشوتات الجلسة:</div>
                    ${clientContent.length === 0 ? `<div class="text-xs text-slate-400 italic">لا توجد اسكريبتات مجهزة في مرحلة التصوير لهذا العميل حالياً.</div>` : clientContent.map(item => `
                        <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-2.5">
                            <div class="flex items-center justify-between">
                                <h4 class="font-bold text-slate-900 text-xs">${item.title}</h4>
                                <button onclick="viewFullScript('${item.id}')" class="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1">
                                    <i class="fa-solid fa-file-lines"></i> عرض الاسكريبت الكامل
                                </button>
                            </div>
                            ${item.hook ? `<p class="text-xs text-slate-600"><span class="font-bold text-amber-700">الهوك:</span> ${item.hook}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function openNewShootModal() {
    const form = document.getElementById('shoot-form');
    if (form) form.reset();
    const idInput = document.getElementById('shoot-id');
    if (idInput) idInput.value = '';
    const titleEl = document.getElementById('shoot-modal-title');
    if (titleEl) titleEl.textContent = "إنشاء جلسة تصوير جديدة";
    const dateInput = document.getElementById('shoot-date');
    if (dateInput) dateInput.value = AppState.selectedDate || new Date().toISOString().slice(0, 10);
    openModal('shoot-modal');
}

function handleShootSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('shoot-id').value;
    const clientId = document.getElementById('shoot-client-id').value;
    const date = document.getElementById('shoot-date').value;
    const time = document.getElementById('shoot-time').value;
    const location = document.getElementById('shoot-location').value.trim();
    const notes = document.getElementById('shoot-notes').value.trim();

    if (editId) {
        const session = AppState.shootSessions.find(s => s.id === editId);
        if (session) {
            session.clientId = clientId;
            session.date = date;
            session.time = time;
            session.location = location;
            session.notes = notes;
            showToast("success", "تم التعديل", "تم تعديل جلسة التصوير بنجاح!");
        }
    } else {
        const newSession = {
            id: 'shoot-' + Date.now(),
            clientId: clientId,
            date: date,
            time: time,
            location: location,
            notes: notes,
            items: []
        };
        AppState.shootSessions.push(newSession);
        showToast("success", "تم الإنشاء", "تمت إضافة جلسة التصوير بنجاح!");
    }

    saveState();
    renderAll();
    closeModal('shoot-modal');
}

function deleteShootSession(id) {
    if (confirm("هل أنت متأكد من حذف جلسة التصوير هذه؟")) {
        AppState.shootSessions = AppState.shootSessions.filter(s => s.id !== id);
        saveState();
        renderAll();
        showToast("info", "تم الحذف", "تمت إزالة جلسة التصوير.");
    }
}
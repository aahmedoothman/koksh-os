/**
 * ==========================================================================
 * Koksh Workspace OS — Shoots (التصوير) Module
 * Phase 6: Field-Ready Interactive Shotlist, Progress Tracking & Shoot Mode
 * ==========================================================================
 */

function toggleShootMode(sessionId) {
    if (AppState.activeShootModeSessionId === sessionId) {
        AppState.activeShootModeSessionId = null;
        AppState.shootMode = false;
        showToast('info', 'الوضع القياسي', 'تم الخروج من وضع التصوير السريع.');
    } else {
        AppState.activeShootModeSessionId = sessionId;
        AppState.shootMode = true;
        showToast('info', 'وضع التصوير السريع 🎬', 'تم تفعيل وضع التصوير الميداني المركز.');
    }
    saveState();
    renderShootsTab();
}

function renderShootsTab() {
    const container = document.getElementById('shoots-list-container');
    if (!container) return;

    if (AppState.shootSessions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-soft">
                <i class="fa-solid fa-clapperboard text-4xl text-slate-300 mb-3"></i>
                <h3 class="font-bold text-slate-700 text-sm">لا توجد جلسات تصوير مجهزة</h3>
                <button onclick="openNewShootModal()" class="mt-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-xs">
                    + إنشاء جلسة تصوير جديدة
                </button>
            </div>
        `;
        return;
    }

    const isShootModeActive = !!(AppState.shootMode && AppState.activeShootModeSessionId);

    container.innerHTML = AppState.shootSessions.map(session => {
        const client = AppState.clients.find(c => c.id === session.clientId) || { name: 'عميل غير محدد' };
        
        // Find content linked to this client and in production/script stages
        const clientContent = AppState.contentItems.filter(i => 
            i.clientId === session.clientId && 
            (i.stage === 'تصوير' || i.stage === 'سكريبت' || i.stage === 'فكرة' || (session.items && session.items.includes(i.id)))
        );

        // Calculate Total & Completed Shots across all content for this session
        let totalSessionShots = 0;
        let doneSessionShots = 0;

        clientContent.forEach(item => {
            const shots = item.shots || [];
            totalSessionShots += shots.length;
            doneSessionShots += shots.filter(s => s.done).length;
        });

        const sessionProgressPercent = totalSessionShots > 0 ? Math.round((doneSessionShots / totalSessionShots) * 100) : 0;
        const isSessionFullyDone = totalSessionShots > 0 && doneSessionShots === totalSessionShots;
        const isThisSessionInShootMode = AppState.activeShootModeSessionId === session.id;

        // If Shoot Mode is active on another session, hide this session to focus purely on active one
        if (isShootModeActive && !isThisSessionInShootMode) {
            return '';
        }

        return `
            <div id="shoot-card-${session.id}" class="bg-white rounded-3xl border ${isThisSessionInShootMode ? 'border-2 border-rose-500 shadow-floating ring-4 ring-rose-500/10' : 'border-slate-200 shadow-soft'} overflow-hidden space-y-4 transition-all">
                
                <!-- 1. SESSION HEADER & PROGRESS BAR -->
                <div class="p-5 md:p-6 ${isThisSessionInShootMode ? 'bg-slate-900 text-white' : 'bg-slate-50/80 text-slate-900'} border-b border-slate-200/80 flex flex-col gap-4">
                    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div class="flex items-center gap-3.5 cursor-pointer min-w-0" onclick="navigateToClientWorkspace('${session.clientId}')" title="فتح مساحة عمل ${client.name}">
                            <div class="w-12 h-12 rounded-2xl ${isThisSessionInShootMode ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'} flex items-center justify-center text-xl font-black shrink-0 shadow-xs">
                                <i class="fa-solid fa-video"></i>
                            </div>
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2">
                                    <h3 class="text-base md:text-lg font-black truncate hover:text-rose-400 transition-colors">${client.name}</h3>
                                    <span class="${isThisSessionInShootMode ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'} text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                        <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i> مساحة العميل
                                    </span>
                                </div>
                                <div class="flex flex-wrap items-center gap-3 text-xs ${isThisSessionInShootMode ? 'text-slate-300' : 'text-slate-500'} font-semibold mt-1">
                                    <span><i class="fa-solid fa-calendar ml-1 ${isThisSessionInShootMode ? 'text-rose-400' : 'text-slate-400'}"></i> ${session.date}</span>
                                    <span><i class="fa-solid fa-clock ml-1 ${isThisSessionInShootMode ? 'text-rose-400' : 'text-slate-400'}"></i> ${session.time}</span>
                                    <span><i class="fa-solid fa-location-dot ml-1 text-rose-500"></i> ${session.location}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Header Actions & Shoot Mode Toggle -->
                        <div class="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end shrink-0">
                            <button onclick="toggleShootMode('${session.id}')" class="${isThisSessionInShootMode ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200'} font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
                                <i class="fa-solid fa-camera-retro"></i>
                                <span>${isThisSessionInShootMode ? 'الخروج من وضع التصوير ✕' : 'وضع التصوير السريع 🎬'}</span>
                            </button>
                            ${!isThisSessionInShootMode ? `
                                <button onclick="openNewContentForClient('${session.clientId}')" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer">
                                    <i class="fa-solid fa-plus text-[10px]"></i> + اسكريبت
                                </button>
                                <button onclick="deleteShootSession('${session.id}')" class="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-slate-200 text-xs cursor-pointer" title="حذف الجلسة">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Overall Session Progress Bar -->
                    <div class="space-y-1.5 pt-1">
                        <div class="flex justify-between text-xs font-bold ${isThisSessionInShootMode ? 'text-slate-200' : 'text-slate-700'}">
                            <span class="flex items-center gap-1.5">
                                <i class="fa-solid fa-bars-progress text-rose-500"></i>
                                <span>إنجاز شوتات الجلسة بالكامل:</span>
                            </span>
                            <span class="${isSessionFullyDone ? 'text-emerald-500 font-black' : (isThisSessionInShootMode ? 'text-amber-300' : 'text-rose-600')}">
                                ${doneSessionShots} / ${totalSessionShots} شوت (${sessionProgressPercent}%)
                                ${isSessionFullyDone ? '🎉 اكتملت الجلسة!' : ''}
                            </span>
                        </div>
                        <div class="w-full ${isThisSessionInShootMode ? 'bg-slate-800' : 'bg-slate-200'} h-2 rounded-full overflow-hidden">
                            <div class="${isSessionFullyDone ? 'bg-emerald-500' : 'bg-rose-500'} h-full rounded-full transition-all duration-300" style="width: ${sessionProgressPercent}%"></div>
                        </div>
                    </div>
                </div>

                <!-- 2. EQUIPMENT & PREPARATION NOTES -->
                ${session.notes && !isThisSessionInShootMode ? `
                    <div class="px-6 text-xs text-slate-600 bg-amber-50/60 p-3.5 mx-6 rounded-2xl border border-amber-200 flex items-start gap-2.5">
                        <i class="fa-solid fa-circle-info text-amber-600 mt-0.5 shrink-0 text-sm"></i>
                        <span class="leading-relaxed"><strong>ملاحظات ومعدات التصوير:</strong> ${session.notes}</span>
                    </div>
                ` : ''}

                <!-- 3. INTERACTIVE CONTENT ITEMS & SHOTLISTS -->
                <div class="p-6 pt-0 space-y-5">
                    <div class="flex items-center justify-between text-xs font-bold text-slate-500 pb-1 border-b border-slate-100">
                        <span>الاسكريبتات والشوتات الميدانية (${clientContent.length} عناصر):</span>
                        <span>اضغط على الشوت لتعليمه فوراً ✓</span>
                    </div>

                    ${clientContent.length === 0 ? `
                        <div class="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400 italic text-center space-y-2">
                            <p>لا توجد اسكريبتات مجهزة في مرحلة التصوير لهذا العميل حالياً.</p>
                            <button onclick="openNewContentForClient('${session.clientId}')" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs cursor-pointer shadow-xs">
                                + إضافة أول اسكريبت للجلسة
                            </button>
                        </div>
                    ` : clientContent.map(item => {
                        const shots = item.shots || [];
                        const doneCount = shots.filter(s => s.done).length;
                        const totalShots = shots.length;
                        const isReelDone = totalShots > 0 && doneCount === totalShots;
                        const reelPercent = totalShots > 0 ? Math.round((doneCount / totalShots) * 100) : 0;

                        return `
                            <div class="p-4 md:p-5 rounded-3xl border-2 ${isReelDone ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 bg-white'} space-y-4 shadow-soft transition-all">
                                
                                <!-- Reel Top Bar -->
                                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                    <div class="space-y-1 min-w-0 flex-1">
                                        <div class="flex flex-wrap items-center gap-2">
                                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">${item.platform} • ${item.type}</span>
                                            <h4 class="font-black text-slate-900 text-sm truncate">${item.title}</h4>
                                        </div>
                                        
                                        <!-- Reel Progress Indicator -->
                                        <div class="flex items-center gap-3 text-xs pt-0.5">
                                            <span class="font-bold text-slate-500">إنجاز الشوتات:</span>
                                            <span class="font-extrabold ${isReelDone ? 'text-emerald-600' : 'text-slate-800'}">
                                                ${doneCount} / ${totalShots} (${reelPercent}%)
                                            </span>
                                            <div class="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                                                <div class="${isReelDone ? 'bg-emerald-500' : 'bg-indigo-600'} h-full rounded-full" style="width: ${reelPercent}%"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Reel Actions & Move to Editing Button -->
                                    <div class="flex items-center gap-2 shrink-0">
                                        ${isReelDone && item.stage !== 'مونتاج' && item.stage !== 'تم النشر' ? `
                                            <button onclick="moveToEditing('${item.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer animate-bounce">
                                                <i class="fa-solid fa-scissors"></i>
                                                <span>نقل إلى المونتاج ✂️</span>
                                            </button>
                                        ` : ''}
                                        <button onclick="viewFullScript('${item.id}')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer">
                                            <i class="fa-solid fa-file-lines text-indigo-600"></i>
                                            <span>الاسكريبت الكامل</span>
                                        </button>
                                        <button onclick="editContentItem('${item.id}')" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer" title="تعديل"><i class="fa-solid fa-pen"></i></button>
                                    </div>
                                </div>

                                <!-- Fast Hook Banner (For quick delivery in front of camera) -->
                                ${item.hook ? `
                                    <div class="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
                                        <div class="flex items-start gap-2 min-w-0">
                                            <i class="fa-solid fa-bolt text-amber-600 mt-0.5 shrink-0 text-sm"></i>
                                            <span class="text-xs text-slate-900 font-bold leading-relaxed">الهوك: <span class="font-normal text-slate-800">${item.hook}</span></span>
                                        </div>
                                        <button onclick="copyFastHook('${item.id}')" class="bg-white border border-amber-300 hover:bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 cursor-pointer shadow-2xs">
                                            نسخ الهوك 📋
                                        </button>
                                    </div>
                                ` : ''}

                                <!-- Interactive Shotlist (Checkboxes & Realtime Toggle) -->
                                <div class="space-y-2 text-xs">
                                    <div class="font-bold text-slate-700 flex items-center justify-between">
                                        <span class="flex items-center gap-1.5">
                                            <i class="fa-solid fa-list-check text-rose-500"></i>
                                            <span>شوتات المشهد (Shotlist):</span>
                                        </span>
                                        <button onclick="generateDefaultShots('${item.id}')" class="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer">
                                            + توليد شوتات افتراضية
                                        </button>
                                    </div>

                                    ${shots.length === 0 ? `
                                        <div class="p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 italic text-center">
                                            لا توجد شوتات مسجلة بعد. أضف الشوت المطلوب تصويره بالأسفل.
                                        </div>
                                    ` : `
                                        <div class="space-y-1.5">
                                            ${shots.map(shot => `
                                                <div class="p-2.5 rounded-xl border ${shot.done ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200/80'} flex items-center justify-between gap-3 transition-colors">
                                                    <label class="flex items-center gap-3 cursor-pointer flex-1 min-w-0 select-none">
                                                        <input type="checkbox" ${shot.done ? 'checked' : ''} onchange="toggleShotDone('${item.id}', '${shot.id}', this.checked)" class="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 cursor-pointer border-slate-300 shrink-0">
                                                        <span class="text-xs font-semibold ${shot.done ? 'text-emerald-900 line-through' : 'text-slate-900'} leading-snug break-words">${shot.text}</span>
                                                    </label>
                                                    <button onclick="deleteShot('${item.id}', '${shot.id}')" class="text-slate-300 hover:text-rose-500 p-1 shrink-0 cursor-pointer" title="حذف الشوت">
                                                        <i class="fa-solid fa-xmark text-xs"></i>
                                                    </button>
                                                </div>
                                            `).join('')}
                                        </div>
                                    `}

                                    <!-- Quick Shot Adder Form -->
                                    <form onsubmit="handleQuickShotSubmit(event, '${item.id}')" class="flex items-center gap-2 pt-1">
                                        <input type="text" id="quick-shot-input-${item.id}" placeholder="أضف شوت جديد (مثال: كلوز للمنتج مع دوران بطيء)..." class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white">
                                        <button type="submit" class="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs shrink-0 cursor-pointer shadow-xs">
                                            + إضافة
                                        </button>
                                    </form>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// ================= SHOTLIST INTERACTION FUNCTIONS =================
function toggleShotDone(contentId, shotId, isDone) {
    const item = AppState.contentItems.find(i => i.id === contentId);
    if (!item || !item.shots) return;

    const shot = item.shots.find(s => s.id === shotId);
    if (shot) {
        shot.done = isDone;
        saveState();
        renderShootsTab();

        const allDone = item.shots.length > 0 && item.shots.every(s => s.done);
        if (isDone && allDone) {
            showToast('success', 'اكتملت شوتات الاسكريبت! 🎬', 'تم تصوير كافة المشاهد بنجاح. يمكنك الآن نقله للمونتاج.');
        }
    }
}

function handleQuickShotSubmit(e, contentId) {
    e.preventDefault();
    const input = document.getElementById(`quick-shot-input-${contentId}`);
    const text = input ? input.value.trim() : '';
    if (!text) return;

    const item = AppState.contentItems.find(i => i.id === contentId);
    if (!item) return;

    if (!item.shots) item.shots = [];
    item.shots.push({
        id: 'st-' + Date.now(),
        text: text,
        done: false
    });

    saveState();
    renderShootsTab();
    showToast('success', 'تمت إضافة الشوت', text);
}

function deleteShot(contentId, shotId) {
    const item = AppState.contentItems.find(i => i.id === contentId);
    if (!item || !item.shots) return;

    item.shots = item.shots.filter(s => s.id !== shotId);
    saveState();
    renderShootsTab();
}

function generateDefaultShots(contentId) {
    const item = AppState.contentItems.find(i => i.id === contentId);
    if (!item) return;

    if (!item.shots) item.shots = [];
    const defaults = [
        { id: 'st-' + Date.now() + '-1', text: '1. لقطة الهوك الافتتاحية والمشهد التعبيري (0 to 3s)', done: false },
        { id: 'st-' + Date.now() + '-2', text: '2. تفاصيل المتن والـ B-Roll وشرح المشاهد العملية', done: false },
        { id: 'st-' + Date.now() + '-3', text: '3. لقطة الختام والدعوة المباشرة لاتخاذ إجراء (CTA)', done: false }
    ];

    item.shots = [...item.shots, ...defaults];
    saveState();
    renderShootsTab();
    showToast('success', 'تم توليد الشوتات', 'تمت إضافة 3 شوتات افتراضية مجهزة للاسكريبت.');
}

function moveToEditing(contentId) {
    const item = AppState.contentItems.find(i => i.id === contentId);
    if (!item) return;

    item.stage = 'مونتاج';
    saveState();
    renderAll();
    showToast('success', 'تم النقل للمونتاج ✂️', `أصبحت مرحلة "${item.title.slice(0, 25)}..." الآن في المونتاج.`);
}

function copyFastHook(contentId) {
    const item = AppState.contentItems.find(i => i.id === contentId);
    if (!item || !item.hook) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(item.hook).then(() => {
            showToast('success', 'تم نسخ الهوك 📋', item.hook);
        });
    }
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
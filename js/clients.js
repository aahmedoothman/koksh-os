/**
 * ==========================================================================
 * Koksh Workspace OS — Clients & Client Workspace Module
 * Phase 5: Streamlined 6-Tab Client Workspace (Overview, Content, Production, Growth, Finance, Assets)
 * ==========================================================================
 */

function renderClientsTab() {
    const grid = document.getElementById('clients-grid-container');
    if (!grid) return;

    grid.innerHTML = AppState.clients.map(client => {
        const clientContent = AppState.contentItems.filter(i => i.clientId === client.id);
        const publishedCount = clientContent.filter(i => i.stage === 'تم النشر').length;
        const totalCount = clientContent.length;
        const clientShoots = AppState.shootSessions.filter(s => s.clientId === client.id);

        return `
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft hover:shadow-card transition-all flex flex-col justify-between space-y-4">
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3 cursor-pointer" onclick="openClientWorkspace('${client.id}')">
                            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                                ${client.name.charAt(0)}
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-900 text-sm truncate hover:text-brand-600 transition-colors">${client.name}</h3>
                                <span class="text-[11px] text-slate-400 font-semibold">${client.niche || 'غير محدد'}</span>
                            </div>
                        </div>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${client.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}">
                            ${client.status === 'active' ? 'نشط' : 'متوقف'}
                        </span>
                    </div>

                    <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                        <div class="flex justify-between text-slate-500">
                            <span>الاشتراك الشهري:</span>
                            <span class="font-black text-slate-900">${(Number(client.retainer) || 0).toLocaleString()} ج.م</span>
                        </div>
                        <div class="flex justify-between text-slate-500">
                            <span>التسليمات:</span>
                            <span class="font-bold text-slate-700 truncate max-w-[160px]">${client.deliverables || '-'}</span>
                        </div>
                        ${clientShoots.length > 0 ? `
                            <div class="flex justify-between text-slate-500 pt-1 border-t border-slate-200/60">
                                <span>الإنتاج:</span>
                                <span class="font-bold text-rose-600 cursor-pointer hover:underline" onclick="event.stopPropagation(); openClientWorkspace('${client.id}'); setWorkspaceTab('production');">
                                    <i class="fa-solid fa-clapperboard text-[10px] ml-1"></i>${clientShoots.length} جلسات مجدولة
                                </span>
                            </div>
                        ` : ''}
                    </div>

                    <div class="space-y-1">
                        <div class="flex justify-between text-[11px] font-bold">
                            <span class="text-slate-500">إنجاز محتوى الشهر:</span>
                            <span class="text-brand-600">${publishedCount} / ${totalCount}</span>
                        </div>
                        <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-brand-600 h-full rounded-full" style="width: ${totalCount > 0 ? (publishedCount / totalCount) * 100 : 0}%"></div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button onclick="openClientWorkspace('${client.id}')" class="bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer">
                        <i class="fa-solid fa-door-open"></i>
                        <span>مساحة العمل (Workspace)</span>
                    </button>
                    <div class="flex items-center gap-1">
                        <button onclick="editClient('${client.id}')" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs cursor-pointer" title="تعديل">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="deleteClient('${client.id}')" class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs cursor-pointer" title="حذف">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openClientWorkspace(clientId) {
    AppState.currentWorkspaceClientId = clientId;
    const client = AppState.clients.find(c => c.id === clientId);
    if (!client) return;

    const mainV = document.getElementById('clients-main-view');
    const wsV = document.getElementById('client-workspace-view');
    if (mainV) mainV.classList.add('hidden');
    if (wsV) wsV.classList.remove('hidden');

    const nameEl = document.getElementById('ws-client-name');
    const avatarEl = document.getElementById('ws-client-avatar');
    const nicheEl = document.getElementById('ws-client-niche');
    const statusEl = document.getElementById('ws-client-status');

    if (nameEl) nameEl.textContent = client.name;
    if (avatarEl) avatarEl.textContent = client.name.charAt(0);
    if (nicheEl) nicheEl.textContent = `${client.niche || 'نيتش عام'} • ${client.phone || ''}`;
    if (statusEl) statusEl.textContent = client.status === 'active' ? 'نشط' : 'متوقف';

    const validTabs = ['overview', 'content', 'production', 'growth', 'finance', 'assets'];
    let initialTab = AppState.currentWorkspaceTab;
    if (initialTab === 'shoots') initialTab = 'production';
    if (initialTab === 'ads') initialTab = 'growth';
    if (initialTab === 'files') initialTab = 'assets';
    if (initialTab === 'calendar') initialTab = 'content';
    if (!validTabs.includes(initialTab)) initialTab = 'overview';

    setWorkspaceTab(initialTab);
}

function closeClientWorkspace() {
    AppState.currentWorkspaceClientId = null;
    const mainV = document.getElementById('clients-main-view');
    const wsV = document.getElementById('client-workspace-view');
    if (mainV) mainV.classList.remove('hidden');
    if (wsV) wsV.classList.add('hidden');
}

function setWorkspaceTab(tabKey) {
    if (tabKey === 'shoots') tabKey = 'production';
    if (tabKey === 'ads') tabKey = 'growth';
    if (tabKey === 'files') tabKey = 'assets';
    if (tabKey === 'calendar') {
        tabKey = 'content';
        AppState.clientContentSubView = 'calendar';
    }

    AppState.currentWorkspaceTab = tabKey;
    document.querySelectorAll('.ws-nav-btn').forEach(b => {
        b.className = "ws-nav-btn shrink-0 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer";
    });
    const activeBtn = document.getElementById(`ws-tab-${tabKey}`);
    if (activeBtn) activeBtn.className = "ws-nav-btn shrink-0 bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs";

    renderWorkspaceTabContent();
}

function setClientContentSubView(subView) {
    AppState.clientContentSubView = subView;
    renderWorkspaceTabContent();
}

function renderWorkspaceTabContent() {
    const container = document.getElementById('ws-tab-content-container');
    if (!container) return;

    const clientId = AppState.currentWorkspaceClientId;
    const client = AppState.clients.find(c => c.id === clientId);
    if (!client) return;

    const clientContent = AppState.contentItems.filter(i => i.clientId === clientId);
    const clientShoots = AppState.shootSessions.filter(s => s.clientId === clientId);
    const clientAds = (AppState.adsCampaigns || []).filter(a => a.clientId === clientId);

    const retainer = Number(client.retainer) || 0;
    const paid = Number(client.paid) || 0;
    const due = Math.max(0, retainer - paid);
    const publishedCount = clientContent.filter(i => i.stage === 'تم النشر').length;
    const totalCount = clientContent.length;
    const ideasCount = clientContent.filter(i => i.stage === 'فكرة').length;
    const inProdCount = clientContent.filter(i => i.stage === 'تصوير' || i.stage === 'مونتاج').length;

    // ================= 1. TAB: OVERVIEW =================
    if (AppState.currentWorkspaceTab === 'overview') {
        const nextShoot = clientShoots[0];
        const upcomingItems = clientContent.filter(i => i.stage !== 'تم النشر').slice(0, 3);

        container.innerHTML = `
            <!-- Client Account Health Bar -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft cursor-pointer hover:border-slate-300 transition-colors" onclick="setWorkspaceTab('finance')">
                    <span class="text-[11px] font-bold text-slate-400 block mb-1">الاشتراك والماليات</span>
                    <div class="flex items-baseline gap-2">
                        <span class="text-lg font-black text-slate-900">${retainer.toLocaleString()} ج.م</span>
                        <span class="text-[10px] ${due > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-semibold'}">
                            ${due > 0 ? `(متبقي ${due.toLocaleString()})` : 'مسدد بالكامل ✓'}
                        </span>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft cursor-pointer hover:border-slate-300 transition-colors" onclick="setWorkspaceTab('content')">
                    <span class="text-[11px] font-bold text-slate-400 block mb-1">معدل نشر المحتوى</span>
                    <div class="flex items-baseline gap-2">
                        <span class="text-lg font-black text-emerald-600">${publishedCount} / ${totalCount}</span>
                        <span class="text-[10px] text-slate-400">(${totalCount > 0 ? Math.round((publishedCount/totalCount)*100) : 0}% منجز)</span>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft cursor-pointer hover:border-slate-300 transition-colors" onclick="setWorkspaceTab('production')">
                    <span class="text-[11px] font-bold text-slate-400 block mb-1">جلسات الإنتاج والتصوير</span>
                    <div class="flex items-baseline gap-2">
                        <span class="text-lg font-black text-rose-600">${clientShoots.length}</span>
                        <span class="text-[10px] text-slate-400 font-medium">جلسات هذا الشهر</span>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft cursor-pointer hover:border-slate-300 transition-colors" onclick="setWorkspaceTab('growth')">
                    <span class="text-[11px] font-bold text-slate-400 block mb-1">حملات النمو (Ads)</span>
                    <div class="flex items-baseline gap-2">
                        <span class="text-lg font-black text-indigo-600">${clientAds.length}</span>
                        <span class="text-[10px] text-emerald-600 font-bold">حملات مسجلة</span>
                    </div>
                </div>
            </div>

            <!-- Contextual Highlights & Needs Attention for this Client -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <!-- Upcoming Timeline & Shoots -->
                <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-3.5 text-xs">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 class="font-black text-slate-900 text-sm flex items-center gap-2">
                            <i class="fa-solid fa-calendar-check text-brand-600"></i>
                            <span>أهم المواعيد القادمة</span>
                        </h4>
                        <button onclick="setWorkspaceTab('content')" class="text-brand-600 hover:underline font-bold cursor-pointer">عرض الكل ↗</button>
                    </div>

                    ${nextShoot ? `
                        <div class="p-3 bg-rose-50/60 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:bg-rose-100/60 transition-colors" onclick="setWorkspaceTab('production')">
                            <div class="flex items-center gap-2.5 min-w-0">
                                <div class="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                    <i class="fa-solid fa-video"></i>
                                </div>
                                <div class="min-w-0">
                                    <span class="font-bold text-slate-900 block truncate">أقرب جلسة تصوير: ${nextShoot.date} (${nextShoot.time})</span>
                                    <span class="text-[11px] text-slate-500 truncate block">${nextShoot.location}</span>
                                </div>
                            </div>
                            <span class="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 shrink-0">فتح الجلسة</span>
                        </div>
                    ` : '<div class="text-slate-400 py-2 italic text-center">لا توجد جلسات تصوير قادمة مجدولة.</div>'}

                    <div class="space-y-2 pt-1">
                        <span class="font-bold text-slate-500 block">قطع المحتوى التالية للنشر:</span>
                        ${upcomingItems.length === 0 ? `<div class="text-slate-400 py-1 italic">لا يوجد محتوى قادم مجدول.</div>` : upcomingItems.map(item => `
                            <div class="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between gap-2 transition-colors cursor-pointer" onclick="editContentItem('${item.id}')">
                                <div class="flex items-center gap-2 min-w-0 flex-1">
                                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 shrink-0">${item.platform}</span>
                                    <span class="font-bold text-slate-800 truncate">${item.title}</span>
                                </div>
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 shrink-0">${item.stage}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Contract, Assets & Quick Notes -->
                <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-3.5 text-xs flex flex-col justify-between">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                            <h4 class="font-black text-slate-900 text-sm flex items-center gap-2">
                                <i class="fa-solid fa-file-contract text-indigo-600"></i>
                                <span>بيانات الحساب والماتريال</span>
                            </h4>
                            <button onclick="editClient('${client.id}')" class="text-slate-500 hover:text-slate-800 font-bold cursor-pointer">تعديل ↗</button>
                        </div>
                        <p class="text-slate-700 font-semibold"><strong>باقة التسليمات:</strong> ${client.deliverables || 'غير محدد'}</p>
                        <p class="text-slate-700 font-semibold"><strong>رقم الهاتف / واتساب:</strong> ${client.phone || '-'}</p>
                        <p class="text-slate-700 font-semibold"><strong>المجال والنيتش:</strong> ${client.niche || 'عام'}</p>
                    </div>

                    <div class="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center justify-between gap-2 mt-2">
                        <div class="flex items-center gap-2 min-w-0">
                            <i class="fa-brands fa-google-drive text-xl text-indigo-600 shrink-0"></i>
                            <span class="font-bold text-slate-900 truncate">مجلد Drive الرئيسي</span>
                        </div>
                        ${client.driveLink ? `<a href="${client.driveLink}" target="_blank" class="bg-white border border-indigo-200 text-indigo-700 font-bold px-3 py-1 rounded-xl text-xs shadow-xs shrink-0 hover:bg-indigo-50">فتح ↗</a>` : '<span class="text-slate-400 text-[10px]">غير مضاف</span>'}
                    </div>
                </div>
            </div>
        `;
    }

    // ================= 2. TAB: CONTENT (WITH INTEGRATED CALENDAR & IDEAS TOGGLE) =================
    else if (AppState.currentWorkspaceTab === 'content') {
        const subView = AppState.clientContentSubView || 'list';
        let displayItems = clientContent;
        if (subView === 'ideas') displayItems = clientContent.filter(i => i.stage === 'فكرة');

        container.innerHTML = `
            <div class="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden space-y-4">
                <!-- Content Tab Sub-Header & Controls -->
                <div class="p-5 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <!-- Internal View Switcher: List vs Ideas vs Calendar -->
                        <div class="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 text-xs">
                            <button onclick="setClientContentSubView('list')" class="px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${subView === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}">
                                <i class="fa-solid fa-list ml-1"></i> قائمة المحتوى (${totalCount})
                            </button>
                            <button onclick="setClientContentSubView('ideas')" class="px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${subView === 'ideas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}">
                                <i class="fa-solid fa-lightbulb ml-1 text-amber-500"></i> الأفكار (${ideasCount})
                            </button>
                            <button onclick="setClientContentSubView('calendar')" class="px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${subView === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}">
                                <i class="fa-solid fa-calendar-days ml-1 text-indigo-500"></i> التقويم
                            </button>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <button onclick="openQuickIdeaModal()" class="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer">
                            <i class="fa-solid fa-lightbulb text-[10px]"></i> + فكرة
                        </button>
                        <button onclick="openNewContentForClient('${client.id}')" class="bg-brand-600 hover:bg-brand-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs cursor-pointer">
                            <i class="fa-solid fa-plus text-[10px]"></i> + محتوى
                        </button>
                    </div>
                </div>

                <!-- Sub-View Content -->
                <div class="p-5 pt-0">
                    ${subView === 'calendar' ? `
                        <div class="space-y-3 text-xs">
                            <div class="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-500 font-bold">
                                <span>جدول مواعيد نشر محتوى ${client.name}</span>
                                <button onclick="switchTab('content')" class="text-brand-600 hover:underline cursor-pointer">فتح التقويم التفاعلي العام ↗</button>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                ${clientContent.length === 0 ? `<div class="text-slate-400 py-6 text-center col-span-2">لا توجد مواعيد نشر مسجلة.</div>` : clientContent.map(i => `
                                    <div class="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 cursor-pointer transition-colors" onclick="editContentItem('${i.id}')">
                                        <div class="min-w-0 flex-1">
                                            <span class="font-bold text-slate-900 block truncate">${i.title}</span>
                                            <span class="text-[11px] text-slate-400">${i.platform} • ${i.type}</span>
                                        </div>
                                        <div class="text-left shrink-0">
                                            <span class="text-indigo-600 font-black block">${i.date}</span>
                                            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700">${i.stage}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : `
                        <div class="divide-y divide-slate-100 text-xs">
                            ${displayItems.length === 0 ? `<div class="p-8 text-center text-slate-400">لا يوجد محتوى في هذا العرض حالياً.</div>` : displayItems.map(item => {
                                const matchingShoot = clientShoots.find(s => (s.items && s.items.includes(item.id)) || s.date === item.date);
                                return `
                                    <div class="py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer rounded-xl px-2" onclick="editContentItem('${item.id}')">
                                        <div class="space-y-1 flex-1 min-w-0">
                                            <div class="flex items-center gap-2">
                                                <span class="font-bold text-slate-900 text-xs truncate">${item.title}</span>
                                                ${matchingShoot ? `
                                                    <span onclick="event.stopPropagation(); setWorkspaceTab('production')" class="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1" title="فتح جلسة التصوير">
                                                        <i class="fa-solid fa-clapperboard text-[9px]"></i> جلسة: ${matchingShoot.date}
                                                    </span>
                                                ` : ''}
                                            </div>
                                            <div class="text-[11px] text-slate-400 font-medium">${item.platform} • ${item.type} • تاريخ: ${item.date}</div>
                                        </div>
                                        <div class="flex items-center gap-2 shrink-0">
                                            <select onchange="event.stopPropagation(); updateItemStage('${item.id}', this.value)" class="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer">
                                                <option value="فكرة" ${item.stage === 'فكرة' ? 'selected' : ''}>💡 فكرة</option>
                                                <option value="سكريبت" ${item.stage === 'سكريبت' ? 'selected' : ''}>📝 سكريبت</option>
                                                <option value="تصوير" ${item.stage === 'تصوير' ? 'selected' : ''}>🎬 تصوير</option>
                                                <option value="مونتاج" ${item.stage === 'مونتاج' ? 'selected' : ''}>✂️ مونتاج</option>
                                                <option value="جاهز للنشر" ${item.stage === 'جاهز للنشر' ? 'selected' : ''}>🚀 جاهز للنشر</option>
                                                <option value="تم النشر" ${item.stage === 'تم النشر' ? 'selected' : ''}>✅ تم النشر</option>
                                            </select>
                                            <button onclick="event.stopPropagation(); viewFullScript('${item.id}')" class="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer" title="عرض الاسكريبت"><i class="fa-solid fa-file-lines"></i></button>
                                            <button onclick="event.stopPropagation(); editContentItem('${item.id}')" class="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer" title="تعديل"><i class="fa-solid fa-pen"></i></button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    // ================= 3. TAB: PRODUCTION (REPLACES SHOOTS) =================
    else if (AppState.currentWorkspaceTab === 'production') {
        const prodPipeline = clientContent.filter(i => i.stage === 'تصوير' || i.stage === 'مونتاج');

        container.innerHTML = `
            <div class="space-y-5 text-xs">
                <!-- Shoot Sessions -->
                <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                            <h4 class="font-black text-slate-900 text-sm flex items-center gap-2">
                                <i class="fa-solid fa-clapperboard text-rose-600"></i>
                                <span>جلسات التصوير المجهزة</span>
                            </h4>
                            <p class="text-[11px] text-slate-400 mt-0.5">مواعيد جلسات التصوير، اللوكيشن، والمعدات المطلوبة</p>
                        </div>
                        <button onclick="openNewShootModal()" class="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-2 rounded-xl shadow-xs cursor-pointer">
                            + جلسة تصوير
                        </button>
                    </div>

                    <div class="space-y-3">
                        ${clientShoots.length === 0 ? `<div class="text-slate-400 py-4 text-center italic">لا توجد جلسات تصوير مسجلة لهذا العميل.</div>` : clientShoots.map(s => `
                            <div class="p-4 bg-rose-50/40 rounded-2xl border border-rose-200 space-y-2">
                                <div class="flex items-center justify-between">
                                    <div class="font-bold text-slate-900 text-sm flex items-center gap-2">
                                        <span>جلسة يوم: ${s.date} (الساعة ${s.time})</span>
                                    </div>
                                    <button onclick="navigateToShootSession('${s.id}')" class="text-rose-700 font-bold hover:underline cursor-pointer">عرض في استوديو التصوير ↗</button>
                                </div>
                                <div class="text-slate-600"><i class="fa-solid fa-location-dot text-rose-500 ml-1"></i> ${s.location}</div>
                                ${s.notes ? `<div class="text-slate-500 mt-1 font-medium bg-white/70 p-2.5 rounded-xl border border-rose-100">${s.notes}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Production & Editing Pipeline -->
                <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 class="font-black text-slate-900 text-sm flex items-center gap-2">
                            <i class="fa-solid fa-scissors text-indigo-600"></i>
                            <span>المحتوى الجاري إنتاجه ومونتاجه (${prodPipeline.length})</span>
                        </h4>
                    </div>

                    <div class="space-y-2.5">
                        ${prodPipeline.length === 0 ? `<div class="text-slate-400 py-3 text-center italic">لا توجد قطع محتوى في مرحلة التصوير أو المونتاج حالياً.</div>` : prodPipeline.map(item => `
                            <div class="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-colors cursor-pointer" onclick="editContentItem('${item.id}')">
                                <div class="space-y-1 flex-1 min-w-0">
                                    <div class="flex items-center gap-2">
                                        <span class="font-bold text-slate-900 truncate">${item.title}</span>
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${item.stage === 'تصوير' ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'}">${item.stage}</span>
                                    </div>
                                    ${item.hook ? `<p class="text-[11px] text-slate-500 truncate"><span class="text-amber-600 font-bold">الهوك:</span> ${item.hook}</p>` : ''}
                                </div>
                                <div class="flex items-center gap-2 shrink-0">
                                    <button onclick="event.stopPropagation(); viewFullScript('${item.id}')" class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer">
                                        <i class="fa-solid fa-file-lines text-indigo-600"></i> الاسكريبت
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // ================= 4. TAB: GROWTH (REPLACES ADS) =================
    else if (AppState.currentWorkspaceTab === 'growth') {
        const totalAdBudget = clientAds.reduce((s,a) => s + (Number(a.budget) || 0), 0);
        const totalAdSpend = clientAds.reduce((s,a) => s + (Number(a.spend) || 0), 0);

        container.innerHTML = `
            <div class="space-y-5 text-xs">
                <!-- Growth KPI Header -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
                        <span class="text-slate-400 font-bold block mb-1">إجمالي الميزانيات المعتمدة</span>
                        <span class="text-lg font-black text-slate-900">${totalAdBudget.toLocaleString()} ج.م</span>
                    </div>
                    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
                        <span class="text-slate-400 font-bold block mb-1">المصروف الفعلي</span>
                        <span class="text-lg font-black text-indigo-600">${totalAdSpend.toLocaleString()} ج.م</span>
                    </div>
                    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
                        <span class="text-slate-400 font-bold block mb-1">الحملات النشطة</span>
                        <span class="text-lg font-black text-emerald-600">${clientAds.filter(a => a.status === 'active').length}</span>
                    </div>
                </div>

                <!-- Campaigns List -->
                <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 class="font-black text-slate-900 text-sm flex items-center gap-2">
                            <i class="fa-solid fa-chart-line text-emerald-600"></i>
                            <span>الحملات الإعلانية ومؤشرات النمو</span>
                        </h4>
                    </div>

                    <div class="space-y-3">
                        ${clientAds.length === 0 ? `<div class="text-slate-400 py-6 text-center italic">لا توجد حملات نمو أو إعلانات مسجلة لهذا العميل حالياً.</div>` : clientAds.map(ad => `
                            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                <div class="space-y-1 flex-1 min-w-0">
                                    <div class="font-bold text-slate-900 text-sm truncate">${ad.name}</div>
                                    <div class="text-slate-500 font-semibold">${ad.platform} • الميزانية: ${Number(ad.budget).toLocaleString()} ج.م (تم صرف: ${Number(ad.spend).toLocaleString()} ج.م)</div>
                                </div>
                                <div class="text-emerald-700 font-black bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-xs shrink-0">
                                    ${ad.results}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // ================= 5. TAB: FINANCE =================
    else if (AppState.currentWorkspaceTab === 'finance') {
        container.innerHTML = `
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-5 text-xs">
                <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                        <h4 class="font-black text-slate-900 text-sm flex items-center gap-2">
                            <i class="fa-solid fa-wallet text-emerald-600"></i>
                            <span>كشف الحساب والاشتراك الشهري</span>
                        </h4>
                        <p class="text-[11px] text-slate-400 mt-0.5">متابعة مدفوعات العميل والتحصيلات والمتبقيات</p>
                    </div>
                    <button onclick="openPaymentForClient('${client.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5">
                        <i class="fa-solid fa-plus text-[10px]"></i> + تسجيل دفعة
                    </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-center">
                    <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span class="text-slate-400 font-bold block mb-1">الاشتراك الشهري (Retainer)</span>
                        <span class="font-black text-slate-900 text-lg">${retainer.toLocaleString()} ج.م</span>
                    </div>
                    <div class="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                        <span class="text-emerald-700 font-bold block mb-1">المبلغ المدفوع</span>
                        <span class="font-black text-emerald-700 text-lg">${paid.toLocaleString()} ج.م</span>
                    </div>
                    <div class="p-4 bg-rose-50/70 rounded-2xl border border-rose-200">
                        <span class="text-rose-700 font-bold block mb-1">المتبقي للتحصيل</span>
                        <span class="font-black text-rose-700 text-lg">${due.toLocaleString()} ج.م</span>
                    </div>
                </div>

                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <div class="flex justify-between font-bold">
                        <span class="text-slate-600">حالة السداد العامة:</span>
                        <span class="${due === 0 && retainer > 0 ? 'text-emerald-600' : 'text-amber-600'}">
                            ${due === 0 && retainer > 0 ? '✅ مسدد بالكامل' : (paid > 0 ? '⏳ مسدد جزئياً' : '⚠️ معلق بالكامل')}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    // ================= 6. TAB: ASSETS (REPLACES FILES) =================
    else if (AppState.currentWorkspaceTab === 'assets') {
        container.innerHTML = `
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-5 text-xs">
                <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                        <h4 class="font-black text-slate-900 text-sm flex items-center gap-2">
                            <i class="fa-solid fa-folder-open text-indigo-600"></i>
                            <span>الملفات والماتريال والهوية (Assets & Media)</span>
                        </h4>
                        <p class="text-[11px] text-slate-400 mt-0.5">روابط مجلدات Google Drive والمواد الخام والشعارات</p>
                    </div>
                    <button onclick="editClient('${client.id}')" class="text-slate-500 hover:text-slate-800 font-bold cursor-pointer">تحديث الروابط ↗</button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3 min-w-0">
                            <i class="fa-brands fa-google-drive text-3xl text-indigo-600 shrink-0"></i>
                            <div class="min-w-0">
                                <span class="font-bold text-slate-900 block truncate">مجلد Drive الرئيسي للعميل</span>
                                <span class="text-[11px] text-slate-500 truncate block">${client.driveLink || 'لم يتم تعيين رابط'}</span>
                            </div>
                        </div>
                        ${client.driveLink ? `<a href="${client.driveLink}" target="_blank" class="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold px-3.5 py-1.5 rounded-xl shadow-xs shrink-0">فتح ↗</a>` : ''}
                    </div>

                    <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3 min-w-0">
                            <i class="fa-solid fa-photo-film text-3xl text-slate-400 shrink-0"></i>
                            <div class="min-w-0">
                                <span class="font-bold text-slate-900 block truncate">ماتريال الفيديوهات والشوتات</span>
                                <span class="text-[11px] text-slate-500 truncate block">الفيديوهات الخام والصور المعدلة</span>
                            </div>
                        </div>
                        ${client.driveLink ? `<a href="${client.driveLink}" target="_blank" class="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-3.5 py-1.5 rounded-xl shadow-xs shrink-0">استعراض ↗</a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }
}

function openNewClientModal() {
    const form = document.getElementById('client-form');
    if (form) form.reset();
    const idInput = document.getElementById('client-id');
    if (idInput) idInput.value = '';
    const titleEl = document.getElementById('client-modal-title');
    if (titleEl) titleEl.textContent = "إضافة عميل جديد";
    openModal('client-modal');
}

function editClient(clientId) {
    const client = AppState.clients.find(c => c.id === clientId);
    if (!client) return;

    openModal('client-modal');
    document.getElementById('client-id').value = client.id;
    document.getElementById('client-name').value = client.name;
    document.getElementById('client-niche').value = client.niche || '';
    document.getElementById('client-retainer').value = client.retainer;
    document.getElementById('client-deliverables').value = client.deliverables || '';
    document.getElementById('client-phone').value = client.phone || '';
    document.getElementById('client-status').value = client.status || 'active';
    document.getElementById('client-drive-link').value = client.driveLink || '';
    document.getElementById('client-modal-title').textContent = "تعديل بيانات العميل";
}

function handleClientSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('client-id').value;
    const name = document.getElementById('client-name').value.trim();
    const niche = document.getElementById('client-niche').value.trim();
    const retainer = Number(document.getElementById('client-retainer').value) || 0;
    const deliverables = document.getElementById('client-deliverables').value.trim();
    const phone = document.getElementById('client-phone').value.trim();
    const status = document.getElementById('client-status').value;
    const driveLink = document.getElementById('client-drive-link').value.trim();

    if (editId) {
        const client = AppState.clients.find(c => c.id === editId);
        if (client) {
            client.name = name;
            client.niche = niche;
            client.retainer = retainer;
            client.deliverables = deliverables;
            client.phone = phone;
            client.status = status;
            client.driveLink = driveLink;
            showToast("success", "تم التعديل", "تم تعديل بيانات العميل بنجاح!");
        }
    } else {
        const newClient = {
            id: 'c-' + Date.now(),
            name: name,
            niche: niche,
            retainer: retainer,
            paid: 0,
            deliverables: deliverables,
            phone: phone,
            status: status,
            driveLink: driveLink
        };
        AppState.clients.push(newClient);
        showToast("success", "تمت الإضافة", "تمت إضافة العميل الجديد بنجاح!");
    }

    saveState();
    renderAll();
    closeModal('client-modal');
}

function deleteClient(clientId) {
    if (confirm("هل أنت متأكد من حذف هذا العميل وجميع بياناته ومحتواه؟")) {
        AppState.clients = AppState.clients.filter(c => c.id !== clientId);
        AppState.contentItems = AppState.contentItems.filter(i => i.clientId !== clientId);
        AppState.shootSessions = AppState.shootSessions.filter(s => s.clientId !== clientId);
        if (AppState.currentWorkspaceClientId === clientId) {
            closeClientWorkspace();
        }
        saveState();
        renderAll();
        showToast("info", "تم الحذف", "تم حذف العميل بنجاح.");
    }
}

function openNewContentForClient(clientId) {
    openNewContentModal();
    const select = document.getElementById('cnt-client-id');
    if (select) select.value = clientId;
}
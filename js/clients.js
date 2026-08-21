/**
 * ==========================================================================
 * Koksh Workspace OS — Clients (العملاء) & Client Workspace Module
 * ==========================================================================
 */

function renderClientsTab() {
    const grid = document.getElementById('clients-grid-container');
    if (!grid) return;

    grid.innerHTML = AppState.clients.map(client => {
        const clientContent = AppState.contentItems.filter(i => i.clientId === client.id);
        const publishedCount = clientContent.filter(i => i.stage === 'تم النشر').length;
        const totalCount = clientContent.length;

        return `
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft hover:shadow-card transition-all flex flex-col justify-between space-y-4">
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                                ${client.name.charAt(0)}
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-900 text-sm truncate">${client.name}</h3>
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
                    <button onclick="openClientWorkspace('${client.id}')" class="bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all">
                        <i class="fa-solid fa-door-open"></i>
                        <span>مساحة العمل (Workspace)</span>
                    </button>
                    <div class="flex items-center gap-1">
                        <button onclick="editClient('${client.id}')" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs" title="تعديل">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="deleteClient('${client.id}')" class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs" title="حذف">
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

    setWorkspaceTab('overview');
}

function closeClientWorkspace() {
    AppState.currentWorkspaceClientId = null;
    const mainV = document.getElementById('clients-main-view');
    const wsV = document.getElementById('client-workspace-view');
    if (mainV) mainV.classList.remove('hidden');
    if (wsV) wsV.classList.add('hidden');
}

function setWorkspaceTab(tabKey) {
    AppState.currentWorkspaceTab = tabKey;
    document.querySelectorAll('.ws-nav-btn').forEach(b => {
        b.className = "ws-nav-btn bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all";
    });
    const activeBtn = document.getElementById(`ws-tab-${tabKey}`);
    if (activeBtn) activeBtn.className = "ws-nav-btn bg-slate-900 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all";

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

    if (AppState.currentWorkspaceTab === 'overview') {
        const total = clientContent.length;
        const published = clientContent.filter(i => i.stage === 'تم النشر').length;
        const inProgress = total - published;

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
                    <span class="text-xs font-bold text-slate-400 block mb-1">الاشتراك الشهري</span>
                    <span class="text-xl font-black text-slate-900">${(Number(client.retainer) || 0).toLocaleString()} ج.م</span>
                    <span class="text-[11px] text-slate-400 block mt-1">المدفوع: ${(Number(client.paid) || 0).toLocaleString()} ج.م</span>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
                    <span class="text-xs font-bold text-slate-400 block mb-1">المحتوى المنشور</span>
                    <span class="text-xl font-black text-emerald-600">${published} / ${total}</span>
                    <span class="text-[11px] text-slate-400 block mt-1">${inProgress} جاري العمل عليها</span>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
                    <span class="text-xs font-bold text-slate-400 block mb-1">جلسات التصوير</span>
                    <span class="text-xl font-black text-rose-600">${clientShoots.length}</span>
                    <span class="text-[11px] text-slate-400 block mt-1">جلسات مجهزة هذا الشهر</span>
                </div>
            </div>

            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-3 text-xs">
                <h4 class="font-bold text-slate-900 text-sm">تفاصيل العقد والتسليمات</h4>
                <p class="text-slate-600 leading-relaxed font-semibold"><strong>باقة التسليمات:</strong> ${client.deliverables || 'غير محدد'}</p>
                <p class="text-slate-600 font-semibold"><strong>رقم الهاتف / واتساب:</strong> ${client.phone || '-'}</p>
                <p class="text-slate-600 font-semibold"><strong>مجلد Drive:</strong> <a href="${client.driveLink || '#'}" target="_blank" class="text-indigo-600 hover:underline">${client.driveLink || 'غير مضاف'}</a></p>
            </div>
        `;
    } else if (AppState.currentWorkspaceTab === 'content') {
        container.innerHTML = `
            <div class="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
                <div class="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
                    <span class="font-bold text-slate-700">جميع قطع محتوى ${client.name} (${clientContent.length})</span>
                    <button onclick="openNewContentForClient('${client.id}')" class="bg-brand-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs">+ محتوى جديد</button>
                </div>
                <div class="divide-y divide-slate-100 text-xs">
                    ${clientContent.length === 0 ? `<div class="p-8 text-center text-slate-400">لا يوجد محتوى مسجل لهذا العميل بعد.</div>` : clientContent.map(item => `
                        <div class="p-4 flex items-center justify-between gap-3 hover:bg-slate-50">
                            <div class="space-y-1 flex-1 min-w-0">
                                <div class="font-bold text-slate-900 truncate">${item.title}</div>
                                <div class="text-[11px] text-slate-400">${item.platform} • ${item.type} • تاريخ: ${item.date}</div>
                            </div>
                            <div class="flex items-center gap-2">
                                <select onchange="updateItemStage('${item.id}', this.value)" class="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2 py-1">
                                    <option value="فكرة" ${item.stage === 'فكرة' ? 'selected' : ''}>💡 فكرة</option>
                                    <option value="سكريبت" ${item.stage === 'سكريبت' ? 'selected' : ''}>📝 سكريبت</option>
                                    <option value="تصوير" ${item.stage === 'تصوير' ? 'selected' : ''}>🎬 تصوير</option>
                                    <option value="مونتاج" ${item.stage === 'مونتاج' ? 'selected' : ''}>✂️ مونتاج</option>
                                    <option value="جاهز للنشر" ${item.stage === 'جاهز للنشر' ? 'selected' : ''}>🚀 جاهز للنشر</option>
                                    <option value="تم النشر" ${item.stage === 'تم النشر' ? 'selected' : ''}>✅ تم النشر</option>
                                </select>
                                <button onclick="editContentItem('${item.id}')" class="p-1.5 text-slate-400 hover:text-slate-700"><i class="fa-solid fa-pen"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (AppState.currentWorkspaceTab === 'calendar') {
        container.innerHTML = `
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-3">
                <h4 class="font-bold text-slate-900 text-sm">جدول نشر ومواعيد ${client.name}</h4>
                <div class="space-y-2 text-xs">
                    ${clientContent.length === 0 ? `<div class="text-slate-400 py-4 text-center">لا توجد مواعيد نشر مجدولة.</div>` : clientContent.map(i => `
                        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                            <span class="font-bold text-slate-800">${i.title}</span>
                            <span class="text-indigo-600 font-extrabold">${i.date} (${i.platform})</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (AppState.currentWorkspaceTab === 'shoots') {
        container.innerHTML = `
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
                <div class="flex items-center justify-between text-xs">
                    <h4 class="font-bold text-slate-900 text-sm">جلسات تصوير ${client.name}</h4>
                    <button onclick="openNewShootModal()" class="bg-rose-600 text-white font-bold px-3 py-1.5 rounded-xl">+ جلسة تصوير</button>
                </div>
                <div class="space-y-3 text-xs">
                    ${clientShoots.length === 0 ? `<div class="text-slate-400 py-4 text-center">لا توجد جلسات تصوير مجدولة لهذا العميل.</div>` : clientShoots.map(s => `
                        <div class="p-4 bg-rose-50/40 rounded-2xl border border-rose-200 space-y-1.5">
                            <div class="font-bold text-slate-900 text-sm">جلسة يوم: ${s.date} (الساعة ${s.time})</div>
                            <div class="text-slate-600"><i class="fa-solid fa-map-pin text-rose-500 ml-1"></i> ${s.location}</div>
                            ${s.notes ? `<div class="text-slate-500 mt-1 font-medium">${s.notes}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (AppState.currentWorkspaceTab === 'ads') {
        container.innerHTML = `
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
                <div class="flex items-center justify-between text-xs">
                    <h4 class="font-bold text-slate-900 text-sm">الحملات الإعلانية الممولة (Paid Ads)</h4>
                </div>
                <div class="space-y-3 text-xs">
                    ${clientAds.length === 0 ? `<div class="text-slate-400 py-4 text-center">لا توجد حملات إعلانية مسجلة لهذا العميل حالياً.</div>` : clientAds.map(ad => `
                        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <div class="space-y-1">
                                <div class="font-bold text-slate-900 text-sm">${ad.name}</div>
                                <div class="text-slate-500 font-semibold">${ad.platform} • الميزانية: ${ad.budget.toLocaleString()} ج.م (تم صرف: ${ad.spend.toLocaleString()} ج.م)</div>
                            </div>
                            <div class="text-emerald-700 font-black bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                ${ad.results}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (AppState.currentWorkspaceTab === 'finance') {
        const retainer = Number(client.retainer) || 0;
        const paid = Number(client.paid) || 0;
        const due = Math.max(0, retainer - paid);

        container.innerHTML = `
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4 text-xs">
                <h4 class="font-bold text-slate-900 text-sm">كشف حساب واشتراكات ${client.name}</h4>
                <div class="grid grid-cols-3 gap-3 text-center">
                    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span class="text-slate-400 block mb-1">الاشتراك</span>
                        <span class="font-black text-slate-900 text-base">${retainer.toLocaleString()} ج.م</span>
                    </div>
                    <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <span class="text-emerald-600 block mb-1">المدفوع</span>
                        <span class="font-black text-emerald-700 text-base">${paid.toLocaleString()} ج.م</span>
                    </div>
                    <div class="p-3 bg-rose-50 rounded-xl border border-rose-200">
                        <span class="text-rose-600 block mb-1">المتبقي</span>
                        <span class="font-black text-rose-700 text-base">${due.toLocaleString()} ج.م</span>
                    </div>
                </div>
                <button onclick="openPaymentForClient('${client.id}')" class="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl">+ تسجيل دفعة جديدة لهذا العميل</button>
            </div>
        `;
    } else if (AppState.currentWorkspaceTab === 'files') {
        container.innerHTML = `
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4 text-xs">
                <h4 class="font-bold text-slate-900 text-sm">الملفات والماتريال والهوية (Drive & Assets)</h4>
                <div class="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i class="fa-brands fa-google-drive text-2xl text-indigo-600"></i>
                        <div>
                            <span class="font-bold text-slate-900 block">مجلد Google Drive الرئيسي للعميل</span>
                            <span class="text-[11px] text-slate-500">${client.driveLink || 'لم يتم تعيين رابط'}</span>
                        </div>
                    </div>
                    ${client.driveLink ? `<a href="${client.driveLink}" target="_blank" class="bg-white border border-indigo-200 text-indigo-700 font-bold px-3.5 py-1.5 rounded-xl shadow-xs">فتح المجلد ↗</a>` : ''}
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
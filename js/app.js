/**
 * ==========================================================================
 * Koksh Workspace OS — App Orchestration & Content Actions Module
 * ==========================================================================
 */

function switchTab(tabId) {
    AppState.activeTab = tabId;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.className = "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-slate-600 hover:bg-slate-50 hover:text-slate-900";
        const icon = btn.querySelector('i');
        if (icon && typeof icon.className === 'string') {
            icon.className = icon.className.replace('text-brand-600', 'text-slate-400');
        }
    });

    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) {
        activeNav.className = "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-brand-700 bg-brand-50 border border-brand-100/70 shadow-xs";
        const icon = activeNav.querySelector('i');
        if (icon && typeof icon.className === 'string') {
            icon.className = icon.className.replace('text-slate-400', 'text-brand-600');
        }
    }

    const titles = {
        dashboard: 'الرئيسية',
        today: 'اليوم',
        content: 'المحتوى',
        shoots: 'التصوير',
        clients: 'العملاء',
        finance: 'المالية'
    };
    const breadcrumb = document.getElementById('breadcrumb-title');
    if (breadcrumb) breadcrumb.textContent = titles[tabId] || 'الرئيسية';

    if (tabId !== 'clients') {
        closeClientWorkspace();
    }

    renderAll();
}

function openModal(modalId) {
    const rawId = modalId.replace('-modal','');
    const el = document.getElementById(`modal-${rawId}`) || document.getElementById(`modal-${modalId}`);
    if (el) el.classList.remove('hidden');
    populateClientDropdowns();
}

function closeModal(modalId) {
    const rawId = modalId.replace('-modal','');
    const el = document.getElementById(`modal-${rawId}`) || document.getElementById(`modal-${modalId}`);
    if (el) el.classList.add('hidden');
}

function openNewContentModal() {
    const form = document.getElementById('content-form');
    if (form) form.reset();
    const idInput = document.getElementById('cnt-id');
    if (idInput) idInput.value = '';
    const titleEl = document.getElementById('content-modal-title');
    if (titleEl) titleEl.textContent = "إضافة قطعة محتوى جديدة";
    const dateInput = document.getElementById('cnt-date');
    if (dateInput) dateInput.value = AppState.selectedDate || new Date().toISOString().slice(0, 10);
    openModal('content-modal');
}

function openNewContentForDate(dateStr) {
    openNewContentModal();
    const dateInput = document.getElementById('cnt-date');
    if (dateInput) dateInput.value = dateStr;
}

function editContentItem(itemId) {
    const item = AppState.contentItems.find(i => i.id === itemId);
    if (!item) return;

    openModal('content-modal');
    document.getElementById('cnt-id').value = item.id;
    document.getElementById('cnt-client-id').value = item.clientId;
    document.getElementById('cnt-title').value = item.title;
    document.getElementById('cnt-platform').value = item.platform;
    document.getElementById('cnt-type').value = item.type;
    document.getElementById('cnt-date').value = item.date;
    document.getElementById('cnt-stage').value = item.stage;
    document.getElementById('cnt-hook').value = item.hook || '';
    document.getElementById('cnt-body').value = item.body || '';
    document.getElementById('cnt-cta').value = item.cta || '';
    document.getElementById('content-modal-title').textContent = "تعديل قطعة المحتوى";
}

function handleContentSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('cnt-id').value;
    const clientId = document.getElementById('cnt-client-id').value;
    const title = document.getElementById('cnt-title').value.trim();
    const platform = document.getElementById('cnt-platform').value;
    const type = document.getElementById('cnt-type').value;
    const date = document.getElementById('cnt-date').value;
    const stage = document.getElementById('cnt-stage').value;
    const hook = document.getElementById('cnt-hook').value.trim();
    const body = document.getElementById('cnt-body').value.trim();
    const cta = document.getElementById('cnt-cta').value.trim();

    if (editId) {
        const item = AppState.contentItems.find(i => i.id === editId);
        if (item) {
            item.clientId = clientId;
            item.title = title;
            item.platform = platform;
            item.type = type;
            item.date = date;
            item.stage = stage;
            item.hook = hook;
            item.body = body;
            item.cta = cta;
            showToast("success", "تم التعديل", "تم تعديل قطعة المحتوى بنجاح!");
        }
    } else {
        const newItem = {
            id: 'cnt-' + Date.now(),
            clientId: clientId,
            title: title,
            platform: platform,
            type: type,
            date: date,
            stage: stage,
            hook: hook,
            body: body,
            cta: cta,
            shots: []
        };
        AppState.contentItems.unshift(newItem);
        showToast("success", "تمت الإضافة", "تمت إضافة وجدولة المحتوى بنجاح!");
    }

    saveState();
    renderAll();
    closeModal('content-modal');
}

function deleteContentItem(itemId) {
    if (confirm("هل أنت متأكد من حذف هذا المحتوى؟")) {
        AppState.contentItems = AppState.contentItems.filter(i => i.id !== itemId);
        saveState();
        renderAll();
        showToast("info", "تم الحذف", "تمت إزالة قطعة المحتوى.");
    }
}

function updateItemStage(itemId, newStage) {
    const item = AppState.contentItems.find(i => i.id === itemId);
    if (item) {
        item.stage = newStage;
        saveState();
        renderAll();
        showToast("success", "تم تحديث المرحلة", `أصبحت مرحلة "${item.title.slice(0,20)}..." الآن: ${newStage}`);
    }
}

function viewFullScript(itemId) {
    const item = AppState.contentItems.find(i => i.id === itemId);
    if (!item) return;

    const client = AppState.clients.find(c => c.id === item.clientId) || { name: 'عميل' };
    AppState.currentScriptViewing = item;

    document.getElementById('view-script-title').textContent = item.title;
    document.getElementById('view-script-client').textContent = `${client.name} • ${item.platform} • ${item.stage}`;
    document.getElementById('view-script-hook').textContent = item.hook || 'لا يوجد هوك مكتوب لهذا المحتوى';
    document.getElementById('view-script-body').textContent = item.body || 'لا توجد تفاصيل للمتن';
    document.getElementById('view-script-cta').textContent = item.cta || 'لا توجد دعوة لاتخاذ إجراء';

    openModal('script-view-modal');
}

function copyCurrentScript() {
    if (!AppState.currentScriptViewing) return;
    const item = AppState.currentScriptViewing;
    const text = `📌 ${item.title}\n\n⚡ الهوك (Hook):\n${item.hook || '-'}\n\n📝 متن الاسكريبت:\n${item.body || '-'}\n\n📢 الـ CTA:\n${item.cta || '-'}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast("success", "تم النسخ بنجاح! 📋", "تم نسخ الاسكريبت بالكامل للحافظة.");
        });
    } else {
        showToast("info", "تم النسخ", text.slice(0, 50) + "...");
    }
}

// Bootstrap on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('koksh_sidebar_collapsed') === 'true') {
        AppState.sidebarCollapsed = true;
        applySidebarState();
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    AppState.selectedDate = todayStr;
    const cntDate = document.getElementById('cnt-date');
    if (cntDate) cntDate.value = todayStr;
    const shootDate = document.getElementById('shoot-date');
    if (shootDate) shootDate.value = todayStr;

    renderAll();
});
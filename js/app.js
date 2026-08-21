/**
 * ==========================================================================
 * Koksh Workspace OS — App Orchestration & Content Actions Module
 * Phase 2: Progressive Disclosure & Quick Idea Creation
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
        clients: 'العملاء',
        content: 'المحتوى',
        shoots: 'التصوير',
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

// ================= GLOBAL ADD CONTROLS =================
function toggleGlobalAddMenu(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('global-add-menu');
    if (!menu) return;
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
        menu.classList.remove('hidden');
        menu.classList.add('dropdown-pop');
    } else {
        menu.classList.add('hidden');
        menu.classList.remove('dropdown-pop');
    }
}

function closeGlobalAddMenu() {
    const menu = document.getElementById('global-add-menu');
    if (menu) {
        menu.classList.add('hidden');
        menu.classList.remove('dropdown-pop');
    }
}

function handleGlobalAdd(type) {
    closeGlobalAddMenu();
    switch (type) {
        case 'content':
            openNewContentModal();
            break;
        case 'quick-idea':
            openQuickIdeaModal();
            break;
        case 'task':
            openNewTaskModal();
            break;
        case 'shoot':
            openNewShootModal();
            break;
        case 'client':
            openNewClientModal();
            break;
        case 'collection':
            openNewPaymentModal();
            break;
        case 'expense':
            openNewExpenseModal();
            break;
        default:
            openNewContentModal();
    }
}

// ================= DEDICATED QUICK IDEA HANDLERS (PHASE 2) =================
function openQuickIdeaModal() {
    const form = document.getElementById('quick-idea-form');
    if (form) form.reset();
    openModal('quick-idea-modal');
    setTimeout(() => {
        const titleInput = document.getElementById('quick-idea-title');
        if (titleInput) titleInput.focus();
    }, 100);
}

function handleQuickIdeaSubmit(e) {
    e.preventDefault();
    const clientId = document.getElementById('quick-idea-client-id').value;
    const title = document.getElementById('quick-idea-title').value.trim();
    const platform = document.getElementById('quick-idea-platform').value || 'Instagram';

    if (!title) return;

    const newIdea = {
        id: 'cnt-' + Date.now(),
        clientId: clientId,
        title: title,
        platform: platform,
        type: 'Reels / Short',
        date: AppState.selectedDate || new Date().toISOString().slice(0, 10),
        stage: 'فكرة',
        hook: '',
        body: '',
        cta: '',
        shootNotes: '',
        shots: []
    };

    AppState.contentItems.unshift(newIdea);
    saveState();
    renderAll();
    closeModal('quick-idea-modal');
    showToast('success', 'تم حفظ الفكرة 💡', 'تم تسجيل الفكرة بنجاح في خطة المحتوى بحالة (فكرة).');
}

// ================= COLLAPSIBLE CONTENT MODAL HANDLERS (PHASE 2) =================
function toggleScriptSection(forceState) {
    const sec = document.getElementById('cnt-script-section');
    const icon = document.getElementById('script-section-icon');
    if (!sec) return;

    const shouldOpen = typeof forceState === 'boolean' ? forceState : sec.classList.contains('hidden');
    if (shouldOpen) {
        sec.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
    } else {
        sec.classList.add('hidden');
        if (icon) icon.classList.remove('rotate-180');
    }
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
    
    // Collapse script section by default for progressive disclosure
    toggleScriptSection(false);

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
    document.getElementById('cnt-platform').value = item.platform || 'Instagram';
    document.getElementById('cnt-type').value = item.type || 'Reels / Short';
    document.getElementById('cnt-date').value = item.date || new Date().toISOString().slice(0, 10);
    document.getElementById('cnt-stage').value = item.stage || 'فكرة';
    document.getElementById('cnt-hook').value = item.hook || '';
    document.getElementById('cnt-body').value = item.body || '';
    document.getElementById('cnt-cta').value = item.cta || '';
    
    const shootNotesEl = document.getElementById('cnt-shoot-notes');
    if (shootNotesEl) shootNotesEl.value = item.shootNotes || '';

    // If script details exist, expand accordion automatically
    const hasScriptDetails = !!(item.hook || item.body || item.cta || item.shootNotes);
    toggleScriptSection(hasScriptDetails);

    document.getElementById('content-modal-title').textContent = "تعديل قطعة المحتوى";
}

function handleContentSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('cnt-id').value;
    const clientId = document.getElementById('cnt-client-id').value;
    const title = document.getElementById('cnt-title').value.trim();
    const platform = document.getElementById('cnt-platform').value || 'Instagram';
    const type = document.getElementById('cnt-type').value || 'Reels / Short';
    const date = document.getElementById('cnt-date').value || (AppState.selectedDate || new Date().toISOString().slice(0, 10));
    const stage = document.getElementById('cnt-stage').value || 'فكرة';
    const hook = document.getElementById('cnt-hook').value.trim();
    const body = document.getElementById('cnt-body').value.trim();
    const cta = document.getElementById('cnt-cta').value.trim();
    const shootNotes = document.getElementById('cnt-shoot-notes')?.value.trim() || '';

    if (!title) return;

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
            item.shootNotes = shootNotes;
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
            shootNotes: shootNotes,
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

// ================= TASK & EXPENSE HANDLERS =================
function openNewTaskModal() {
    const form = document.getElementById('task-form');
    if (form) form.reset();
    openModal('task-modal');
    setTimeout(() => {
        const input = document.getElementById('task-text-input');
        if (input) input.focus();
    }, 100);
}

function handleTaskSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('task-text-input');
    const text = input ? input.value.trim() : '';
    if (!text) return;

    const newTask = {
        id: 'urg-' + Date.now(),
        text: text,
        done: false
    };
    AppState.urgentTasks.unshift(newTask);
    saveState();
    renderAll();
    closeModal('task-modal');
    showToast('success', 'تمت إضافة المهمة', 'تم تسجيل المهمة بنجاح في قائمة المهام العاجلة.');
}

function openNewExpenseModal() {
    const form = document.getElementById('expense-form');
    if (form) form.reset();
    openModal('expense-modal');
}

function handleExpenseSubmit(e) {
    e.preventDefault();
    const category = document.getElementById('expense-category').value;
    const amount = Number(document.getElementById('expense-amount').value) || 0;
    const notes = document.getElementById('expense-notes').value.trim();

    closeModal('expense-modal');
    showToast('info', 'تسجيل المصروف', `تم تسجيل مصروف بقيمة ${amount.toLocaleString()} ج.م (${category}) بنجاح.`);
}

// ================= SCRIPT VIEW & COPY =================
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

// ================= GLOBAL EVENT LISTENERS =================
window.addEventListener('click', (e) => {
    const menu = document.getElementById('global-add-menu');
    const btn = document.getElementById('global-add-btn');
    if (menu && !menu.classList.contains('hidden')) {
        if (!menu.contains(e.target) && (!btn || !btn.contains(e.target))) {
            closeGlobalAddMenu();
        }
    }
});


// ================= INTERCONNECTED NAVIGATION HELPERS (PHASE 4) =================
function navigateToClientWorkspace(clientId) {
    if (!clientId) return;
    AppState.previousTab = AppState.activeTab;
    switchTab('clients');
    openClientWorkspace(clientId);
}

function navigateToShootSession(shootId) {
    if (!shootId) return;
    AppState.previousTab = AppState.activeTab;
    switchTab('shoots');
    setTimeout(() => {
        const shootEl = document.getElementById(`shoot-card-${shootId}`);
        if (shootEl) {
            shootEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            shootEl.classList.add('ring-2', 'ring-rose-500');
            setTimeout(() => shootEl.classList.remove('ring-2', 'ring-rose-500'), 2000);
        }
    }, 100);
}

function navigateToContent(contentId) {
    if (!contentId) return;
    editContentItem(contentId);
}

function navigateBackFromWorkspace() {
    if (AppState.previousTab && AppState.previousTab !== 'clients') {
        const prev = AppState.previousTab;
        AppState.previousTab = 'dashboard';
        closeClientWorkspace();
        switchTab(prev);
    } else {
        closeClientWorkspace();
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
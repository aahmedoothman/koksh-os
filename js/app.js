/**
 * ==========================================================================
 * Koksh Workspace OS — App Orchestration & Action Dispatcher Module
 * Phase 10-12: Dynamic Forms, Idea Inbox, Weekly Planner, Tasks & Modals
 * ==========================================================================
 */

function switchTab(tabId) {
    AppState.activeTab = tabId;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.className = "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer";
        const icon = btn.querySelector('i');
        if (icon && typeof icon.className === 'string') {
            icon.className = icon.className.replace('text-brand-600', 'text-slate-400');
        }
    });

    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) {
        activeNav.className = "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-brand-700 bg-brand-50 border border-brand-100/70 shadow-xs cursor-pointer";
        const icon = activeNav.querySelector('i');
        if (icon && typeof icon.className === 'string') {
            icon.className = icon.className.replace('text-slate-400', 'text-brand-600');
        }
    }

    const titles = {
        dashboard: 'الرئيسية',
        today: 'اليوم',
        tasks: 'المهام',
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
        case 'idea-inbox':
            openIdeaInboxModal();
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

// ================= IDEA INBOX (PHASE 10) =================
function openIdeaInboxModal() {
    renderIdeaInboxList();
    openModal('idea-inbox-modal');
    setTimeout(() => {
        const input = document.getElementById('inbox-quick-title');
        if (input) input.focus();
    }, 100);
}

function renderIdeaInboxList() {
    const container = document.getElementById('inbox-ideas-list');
    if (!container) return;

    const rawIdeas = AppState.rawIdeas || [];
    const countEl = document.getElementById('inbox-ideas-count');
    if (countEl) countEl.textContent = `(${rawIdeas.length} أفكار سريعة غير معينة)`;

    if (rawIdeas.length === 0) {
        container.innerHTML = `
            <div class="py-10 text-center text-slate-400 space-y-2">
                <i class="fa-solid fa-inbox text-3xl text-slate-300"></i>
                <p class="font-bold text-xs text-slate-600">صندوق الأفكار فارغ حالياً</p>
                <p class="text-[11px] text-slate-400">سجل أي فكرة تخطر ببالك في ثوانٍ ثم عينها للعميل المناسب لاحقاً.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = rawIdeas.map(idea => `
        <div class="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-colors">
            <div class="space-y-1 min-w-0 flex-1">
                <h4 class="font-bold text-slate-900 text-xs break-words">${idea.title}</h4>
                ${idea.notes ? `<p class="text-[11px] text-slate-500 break-words">${idea.notes}</p>` : ''}
                <span class="text-[10px] text-slate-400 font-semibold block pt-0.5"><i class="fa-solid fa-clock ml-1 text-slate-300"></i>${idea.createdAt || 'اليوم'}</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                <button onclick="convertRawIdeaToContent('${idea.id}')" class="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1">
                    <i class="fa-solid fa-wand-magic-sparkles text-[10px]"></i> تحويل لمحتوى ↗
                </button>
                <button onclick="deleteRawIdea('${idea.id}')" class="w-7 h-7 rounded-lg bg-slate-200/70 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center text-xs cursor-pointer transition-colors" title="حذف الفكرة">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function handleQuickInboxSubmit(e) {
    e.preventDefault();
    const titleInput = document.getElementById('inbox-quick-title');
    const notesInput = document.getElementById('inbox-quick-notes');

    const title = titleInput ? titleInput.value.trim() : '';
    const notes = notesInput ? notesInput.value.trim() : '';

    if (!title) return;

    if (!Array.isArray(AppState.rawIdeas)) AppState.rawIdeas = [];

    const newIdea = {
        id: 'raw-' + Date.now(),
        title: title,
        notes: notes,
        createdAt: new Date().toISOString().slice(0, 10)
    };

    AppState.rawIdeas.unshift(newIdea);
    saveState();
    if (titleInput) titleInput.value = '';
    if (notesInput) notesInput.value = '';
    renderIdeaInboxList();
    showToast('success', 'تم حفظ الفكرة في Inbox 💡', 'تم تدوين الفكرة بنجاح في صندوق الأفكار السريعة.');
}

function convertRawIdeaToContent(rawId) {
    const idea = (AppState.rawIdeas || []).find(i => i.id === rawId);
    if (!idea) return;

    closeModal('idea-inbox-modal');
    openNewContentModal();

    const titleInput = document.getElementById('cnt-title');
    if (titleInput) titleInput.value = idea.title;

    const hookInput = document.getElementById('cnt-hook');
    if (hookInput && idea.notes) hookInput.value = idea.notes;

    AppState.rawIdeas = (AppState.rawIdeas || []).filter(i => i.id !== rawId);
    saveState();
}

function deleteRawIdea(rawId) {
    if (confirm("هل أنت متأكد من حذف هذه الفكرة من Inbox؟")) {
        AppState.rawIdeas = (AppState.rawIdeas || []).filter(i => i.id !== rawId);
        saveState();
        renderIdeaInboxList();
        showToast('info', 'تم الحذف', 'تمت إزالة الفكرة من صندوق الوارد.');
    }
}

// Quick Idea Modal (Direct to Content plan with stage '💡 فكرة')
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
    const goal = document.getElementById('quick-idea-goal')?.value || 'Awareness';

    if (!title) return;

    const newIdea = {
        id: 'cnt-' + Date.now(),
        clientId: clientId || null,
        title: title,
        platform: platform,
        type: 'Reels / Short',
        date: AppState.selectedDate || new Date().toISOString().slice(0, 10),
        stage: '💡 فكرة',
        goal: goal,
        hook: '',
        body: '',
        cta: '',
        shootNotes: '',
        shots: [],
        archived: false
    };

    AppState.contentItems.unshift(newIdea);
    saveState();
    renderAll();
    closeModal('quick-idea-modal');
    showToast('success', 'تم حفظ الفكرة 💡', 'تم تسجيل الفكرة بنجاح في خطة المحتوى بحالة (فكرة).');
}

// ================= DYNAMIC CONTENT FORM (PHASE 10) =================
function onContentTypeChange(typeVal) {
    const secVideo = document.getElementById('cnt-fields-video');
    const secDesign = document.getElementById('cnt-fields-design');
    const secCarousel = document.getElementById('cnt-fields-carousel');
    const secStory = document.getElementById('cnt-fields-story');

    if (secVideo) secVideo.classList.add('hidden');
    if (secDesign) secDesign.classList.add('hidden');
    if (secCarousel) secCarousel.classList.add('hidden');
    if (secStory) secStory.classList.add('hidden');

    if (typeVal === 'Single Post / تصميم') {
        if (secDesign) secDesign.classList.remove('hidden');
    } else if (typeVal === 'Carousel / ألبوم') {
        if (secCarousel) secCarousel.classList.remove('hidden');
    } else if (typeVal === 'Story / تفاعل') {
        if (secStory) secStory.classList.remove('hidden');
    } else {
        if (secVideo) secVideo.classList.remove('hidden');
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
    
    const typeSelect = document.getElementById('cnt-type');
    if (typeSelect) {
        typeSelect.value = 'Reels / Short';
        onContentTypeChange('Reels / Short');
    }

    const goalSelect = document.getElementById('cnt-goal');
    if (goalSelect) goalSelect.value = 'Awareness';

    const stageSelect = document.getElementById('cnt-stage');
    if (stageSelect) stageSelect.value = '💡 فكرة';

    openModal('content-modal');
}

function openNewContentForDate(dateStr) {
    openNewContentModal();
    const dateInput = document.getElementById('cnt-date');
    if (dateInput) dateInput.value = dateStr;
}

function editContentItem(itemId) {
    const item = (AppState.contentItems || []).find(i => i.id === itemId);
    if (!item) return;

    openModal('content-modal');
    document.getElementById('cnt-id').value = item.id;
    document.getElementById('cnt-client-id').value = item.clientId || '';
    document.getElementById('cnt-title').value = item.title;
    document.getElementById('cnt-platform').value = item.platform || 'Instagram';
    
    const typeSelect = document.getElementById('cnt-type');
    if (typeSelect) {
        typeSelect.value = item.type || 'Reels / Short';
        onContentTypeChange(item.type || 'Reels / Short');
    }

    const goalSelect = document.getElementById('cnt-goal');
    if (goalSelect) goalSelect.value = item.goal || 'Awareness';

    document.getElementById('cnt-date').value = item.date || new Date().toISOString().slice(0, 10);
    
    const stageSelect = document.getElementById('cnt-stage');
    if (stageSelect) stageSelect.value = item.stage || '💡 فكرة';

    // Populate Dynamic Fields
    const hookEl = document.getElementById('cnt-hook');
    if (hookEl) hookEl.value = item.hook || '';
    const bodyEl = document.getElementById('cnt-body');
    if (bodyEl) bodyEl.value = item.body || '';
    const ctaEl = document.getElementById('cnt-cta');
    if (ctaEl) ctaEl.value = item.cta || '';
    const shootNotesEl = document.getElementById('cnt-shoot-notes');
    if (shootNotesEl) shootNotesEl.value = item.shootNotes || '';

    // Design fields
    const designBriefEl = document.getElementById('cnt-design-brief');
    if (designBriefEl) designBriefEl.value = item.designBrief || '';
    const captionEl = document.getElementById('cnt-caption');
    if (captionEl) captionEl.value = item.caption || '';
    const designCtaEl = document.getElementById('cnt-design-cta');
    if (designCtaEl) designCtaEl.value = item.cta || '';

    // Carousel fields
    const slidesEl = document.getElementById('cnt-slides-outline');
    if (slidesEl) slidesEl.value = item.slidesOutline || '';
    const carCaptionEl = document.getElementById('cnt-carousel-caption');
    if (carCaptionEl) carCaptionEl.value = item.caption || '';
    const carCtaEl = document.getElementById('cnt-carousel-cta');
    if (carCtaEl) carCtaEl.value = item.cta || '';

    // Story fields
    const storyContentEl = document.getElementById('cnt-story-content');
    if (storyContentEl) storyContentEl.value = item.storyContent || '';
    const interactionSelect = document.getElementById('cnt-interaction-type');
    if (interactionSelect) interactionSelect.value = item.interactionType || 'None';
    const storyCtaEl = document.getElementById('cnt-story-cta');
    if (storyCtaEl) storyCtaEl.value = item.cta || '';

    document.getElementById('content-modal-title').textContent = "تعديل قطعة المحتوى";
}

function handleContentSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('cnt-id').value;
    const clientId = document.getElementById('cnt-client-id').value;
    const title = document.getElementById('cnt-title').value.trim();
    const platform = document.getElementById('cnt-platform').value || 'Instagram';
    const type = document.getElementById('cnt-type').value || 'Reels / Short';
    const goal = document.getElementById('cnt-goal')?.value || 'Awareness';
    const date = document.getElementById('cnt-date').value || (AppState.selectedDate || new Date().toISOString().slice(0, 10));
    const stage = document.getElementById('cnt-stage').value || '💡 فكرة';

    let hook = '', body = '', cta = '', shootNotes = '', designBrief = '', caption = '', slidesOutline = '', storyContent = '', interactionType = 'None';

    if (type === 'Single Post / تصميم') {
        designBrief = document.getElementById('cnt-design-brief')?.value.trim() || '';
        caption = document.getElementById('cnt-caption')?.value.trim() || '';
        cta = document.getElementById('cnt-design-cta')?.value.trim() || '';
    } else if (type === 'Carousel / ألبوم') {
        slidesOutline = document.getElementById('cnt-slides-outline')?.value.trim() || '';
        caption = document.getElementById('cnt-carousel-caption')?.value.trim() || '';
        cta = document.getElementById('cnt-carousel-cta')?.value.trim() || '';
    } else if (type === 'Story / تفاعل') {
        storyContent = document.getElementById('cnt-story-content')?.value.trim() || '';
        interactionType = document.getElementById('cnt-interaction-type')?.value || 'None';
        cta = document.getElementById('cnt-story-cta')?.value.trim() || '';
    } else {
        hook = document.getElementById('cnt-hook')?.value.trim() || '';
        body = document.getElementById('cnt-body')?.value.trim() || '';
        cta = document.getElementById('cnt-cta')?.value.trim() || '';
        shootNotes = document.getElementById('cnt-shoot-notes')?.value.trim() || '';
    }

    if (!title) return;

    if (editId) {
        const item = (AppState.contentItems || []).find(i => i.id === editId);
        if (item) {
            item.clientId = clientId;
            item.title = title;
            item.platform = platform;
            item.type = type;
            item.goal = goal;
            item.date = date;
            item.stage = stage;
            item.hook = hook;
            item.body = body;
            item.cta = cta;
            item.shootNotes = shootNotes;
            item.designBrief = designBrief;
            item.caption = caption;
            item.slidesOutline = slidesOutline;
            item.storyContent = storyContent;
            item.interactionType = interactionType;
            showToast("success", "تم التعديل", "تم تعديل قطعة المحتوى بنجاح!");
        }
    } else {
        const newItem = {
            id: 'cnt-' + Date.now(),
            clientId: clientId,
            title: title,
            platform: platform,
            type: type,
            goal: goal,
            date: date,
            stage: stage,
            hook: hook,
            body: body,
            cta: cta,
            shootNotes: shootNotes,
            designBrief: designBrief,
            caption: caption,
            slidesOutline: slidesOutline,
            storyContent: storyContent,
            interactionType: interactionType,
            shots: [],
            archived: false
        };
        AppState.contentItems.unshift(newItem);
        showToast("success", "تمت الإضافة", "تمت إضافة وجدولة المحتوى بنجاح!");
    }

    saveState();
    renderAll();
    closeModal('content-modal');
}

function deleteContentItem(itemId) {
    if (confirm("تحذير: هل أنت متأكد من الحذف النهائي لهذا المحتوى؟")) {
        AppState.contentItems = AppState.contentItems.filter(i => i.id !== itemId);
        saveState();
        renderAll();
        showToast("info", "تم الحذف", "تمت إزالة قطعة المحتوى نهائياً.");
    }
}

function updateItemStage(itemId, newStage) {
    const item = (AppState.contentItems || []).find(i => i.id === itemId);
    if (item) {
        item.stage = newStage;
        saveState();
        renderAll();
        showToast("success", "تم تحديث المرحلة", `أصبحت مرحلة "${item.title.slice(0,25)}..." الآن: ${newStage}`);
    }
}

// ================= ENHANCED TASK MODAL (PHASE 11) =================
function openNewTaskModal() {
    const form = document.getElementById('task-form');
    if (form) form.reset();
    
    const dueDateInput = document.getElementById('task-due-date');
    if (dueDateInput) dueDateInput.value = new Date().toISOString().slice(0, 10);

    const typeSelect = document.getElementById('task-type');
    if (typeSelect) typeSelect.value = 'editing';

    const prioSelect = document.getElementById('task-priority');
    if (prioSelect) prioSelect.value = 'high';

    openModal('task-modal');
    setTimeout(() => {
        const input = document.getElementById('task-title-input');
        if (input) input.focus();
    }, 100);
}

function handleTaskSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('task-title-input')?.value.trim();
    const clientId = document.getElementById('task-client-id')?.value || null;
    const type = document.getElementById('task-type')?.value || 'general';
    const priority = document.getElementById('task-priority')?.value || 'medium';
    const dueDate = document.getElementById('task-due-date')?.value || new Date().toISOString().slice(0, 10);
    const status = document.getElementById('task-status')?.value || 'pending';
    const waitingReason = status === 'waiting' ? (document.getElementById('task-waiting-reason')?.value || 'Waiting for Client') : null;
    const notes = document.getElementById('task-notes')?.value.trim() || '';

    if (!title) return;

    if (!Array.isArray(AppState.tasks)) AppState.tasks = [];

    const newTask = {
        id: 'tsk-' + Date.now(),
        title: title,
        clientId: clientId,
        type: type,
        priority: priority,
        dueDate: dueDate,
        status: status,
        waitingReason: waitingReason,
        notes: notes
    };

    AppState.tasks.unshift(newTask);
    saveState();
    renderAll();
    closeModal('task-modal');
    showToast('success', 'تمت إضافة المهمة 📋', `تم تسجيل مهمة "${title}" بنجاح في نظام المهام.`);
}

// ================= CONTENT PLAN WIZARD (PHASE 10 & 12) =================
function openContentPlanModal(clientId) {
    const client = (AppState.clients || []).find(c => c.id === clientId);
    if (!client) return;

    AppState.editingContentPlanClientId = clientId;
    const modalTitle = document.getElementById('plan-modal-client-name');
    if (modalTitle) modalTitle.textContent = client.name;

    const plan = client.contentPlan || { 
        platforms: ["Instagram", "Facebook"], 
        goal: "Awareness", 
        deliverables: {}, 
        notes: "" 
    };
    
    const metaPlatforms = ["Instagram", "Facebook", "Threads"];
    const otherPlatforms = ["TikTok", "YouTube", "YouTube Shorts", "LinkedIn", "Snapchat", "X (Twitter)", "Google Business Profile"];
    
    const platformsContainer = document.getElementById('plan-platforms-checkboxes');
    if (platformsContainer) {
        platformsContainer.innerHTML = `
            <div class="col-span-full pb-1">
                <span class="text-[11px] font-black text-indigo-700 block mb-1 flex items-center gap-1">
                    <i class="fa-brands fa-meta"></i> منصات Meta الرئيسية:
                </span>
                <div class="grid grid-cols-3 gap-2">
                    ${metaPlatforms.map(p => {
                        const isChecked = plan.platforms && plan.platforms.includes(p);
                        return `
                            <label class="flex items-center gap-2 p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer text-xs font-bold text-indigo-950 transition-colors">
                                <input type="checkbox" name="plan-platform" value="${p}" ${isChecked ? 'checked' : ''} onchange="onPlanPlatformsChange()" class="rounded text-brand-600 focus:ring-brand-500">
                                <span>${p}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
            <div class="col-span-full pt-1">
                <span class="text-[11px] font-black text-slate-500 block mb-1">منصات أخرى:</span>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    ${otherPlatforms.map(p => {
                        const isChecked = plan.platforms && plan.platforms.includes(p);
                        return `
                            <label class="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer text-xs font-bold text-slate-700 transition-colors">
                                <input type="checkbox" name="plan-platform" value="${p}" ${isChecked ? 'checked' : ''} onchange="onPlanPlatformsChange()" class="rounded text-brand-600 focus:ring-brand-500">
                                <span>${p}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    const goalSelect = document.getElementById('plan-goal-select');
    if (goalSelect) goalSelect.value = plan.goal || 'Awareness';

    const notesInput = document.getElementById('plan-notes-input');
    if (notesInput) notesInput.value = plan.notes || '';

    const tplSelect = document.getElementById('plan-template-select');
    if (tplSelect) {
        tplSelect.innerHTML = '<option value="">اختر قالباً جاهزاً (Template) لتعبئة المقترحات...</option>' + 
            CLIENT_TEMPLATES.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    }

    onPlanPlatformsChange();
    openModal('content-plan-modal');
}

function onPlanPlatformsChange() {
    const container = document.getElementById('plan-deliverables-quantities');
    if (!container) return;

    const checkedPlatforms = Array.from(document.querySelectorAll('input[name="plan-platform"]:checked')).map(el => el.value);
    const clientId = AppState.editingContentPlanClientId;
    const client = (AppState.clients || []).find(c => c.id === clientId);
    const existingDeliverables = (client && client.contentPlan && client.contentPlan.deliverables) ? client.contentPlan.deliverables : {};

    if (checkedPlatforms.length === 0) {
        container.innerHTML = `<div class="text-slate-400 py-3 italic text-xs">يرجى تحديد منصة واحدة على الأقل في الخطوة الأولى أعلاه.</div>`;
        return;
    }

    container.innerHTML = checkedPlatforms.map(plat => {
        const platDeliv = existingDeliverables[plat] || {};
        return `
            <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div class="font-bold text-slate-900 text-xs flex items-center justify-between">
                    <span class="flex items-center gap-1.5"><i class="fa-solid fa-layer-group text-brand-600"></i>منصة: ${plat}</span>
                    <span class="text-[10px] text-slate-400">حدد الأعداد والهدف المطلوب</span>
                </div>
                <div class="grid grid-cols-3 gap-2.5 text-xs">
                    <div>
                        <label class="block text-[11px] font-bold text-slate-600 mb-1">فيديوهات / Reels</label>
                        <input type="number" id="deliv-${plat}-reels" value="${platDeliv.reels || platDeliv.videos || ''}" placeholder="0" class="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-brand-500">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-slate-600 mb-1">بوستات / Designs</label>
                        <input type="number" id="deliv-${plat}-posts" value="${platDeliv.posts || ''}" placeholder="0" class="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-brand-500">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-slate-600 mb-1">استوري / Stories</label>
                        <input type="number" id="deliv-${plat}-stories" value="${platDeliv.stories || ''}" placeholder="0" class="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-brand-500">
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function applyPlanTemplate(templateId) {
    if (!templateId) return;
    const tpl = CLIENT_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;

    document.querySelectorAll('input[name="plan-platform"]').forEach(cb => {
        cb.checked = tpl.platforms.includes(cb.value);
    });

    const goalSelect = document.getElementById('plan-goal-select');
    if (goalSelect) goalSelect.value = tpl.goal || 'Awareness';

    const notesInput = document.getElementById('plan-notes-input');
    if (notesInput) notesInput.value = tpl.description || '';

    onPlanPlatformsChange();

    tpl.platforms.forEach(p => {
        const d = tpl.deliverables[p] || {};
        const reelsInput = document.getElementById(`deliv-${p}-reels`);
        if (reelsInput) reelsInput.value = d.reels || d.videos || '';
        const postsInput = document.getElementById(`deliv-${p}-posts`);
        if (postsInput) postsInput.value = d.posts || '';
        const storiesInput = document.getElementById(`deliv-${p}-stories`);
        if (storiesInput) storiesInput.value = d.stories || '';
    });

    showToast("info", "تم تطبيق القالب 🎯", `تم تطبيق مقترحات قالب "${tpl.name}".`);
}

function handleContentPlanSubmit(e) {
    e.preventDefault();
    const clientId = AppState.editingContentPlanClientId;
    const client = (AppState.clients || []).find(c => c.id === clientId);
    if (!client) return;

    const checkedPlatforms = Array.from(document.querySelectorAll('input[name="plan-platform"]:checked')).map(el => el.value);
    const goal = document.getElementById('plan-goal-select')?.value || 'Awareness';
    const notes = document.getElementById('plan-notes-input')?.value.trim() || '';

    const deliverables = {};
    let totalGeneratedCount = 0;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');

    checkedPlatforms.forEach(p => {
        const reels = Number(document.getElementById(`deliv-${p}-reels`)?.value) || 0;
        const posts = Number(document.getElementById(`deliv-${p}-posts`)?.value) || 0;
        const stories = Number(document.getElementById(`deliv-${p}-stories`)?.value) || 0;
        deliverables[p] = { reels, posts, stories };

        const existingReels = (AppState.contentItems || []).filter(i => i.clientId === clientId && i.platform === p && (i.type === 'Reels / Short' || i.type === 'Video')).length;
        const existingPosts = (AppState.contentItems || []).filter(i => i.clientId === clientId && i.platform === p && (i.type === 'Single Post / تصميم' || i.type === 'Carousel / ألبوم')).length;
        const existingStories = (AppState.contentItems || []).filter(i => i.clientId === clientId && i.platform === p && i.type === 'Story / تفاعل').length;

        let dayCounter = 1;
        
        // 1. Generate missing Reels
        for (let r = existingReels; r < reels; r++) {
            const dayPadded = Math.min(28, (dayCounter * 2) + 2).toString().padStart(2, '0');
            const itemDate = `${currentYear}-${currentMonth}-${dayPadded}`;
            AppState.contentItems.push({
                id: 'cnt-' + Date.now() + '-r-' + r,
                clientId: clientId,
                title: `[Reel #${r + 1}] فكرة ريلز جديدة (${p})`,
                platform: p,
                type: 'Reels / Short',
                goal: goal === 'Mix' ? (r % 2 === 0 ? 'Awareness' : 'Sales') : goal,
                date: itemDate,
                stage: '💡 فكرة',
                hook: '',
                body: '',
                cta: '',
                shootNotes: '',
                shots: [],
                archived: false
            });
            totalGeneratedCount++;
            dayCounter++;
        }

        // 2. Generate missing Posts
        for (let pt = existingPosts; pt < posts; pt++) {
            const dayPadded = Math.min(28, (dayCounter * 2) + 3).toString().padStart(2, '0');
            const itemDate = `${currentYear}-${currentMonth}-${dayPadded}`;
            AppState.contentItems.push({
                id: 'cnt-' + Date.now() + '-p-' + pt,
                clientId: clientId,
                title: `[Post #${pt + 1}] تصميم بوست جديد (${p})`,
                platform: p,
                type: 'Single Post / تصميم',
                goal: goal === 'Mix' ? 'Sales' : goal,
                date: itemDate,
                stage: '📋 تخطيط',
                designBrief: '',
                caption: '',
                cta: '',
                shots: [],
                archived: false
            });
            totalGeneratedCount++;
            dayCounter++;
        }

        // 3. Generate missing Stories
        for (let st = existingStories; st < stories; st++) {
            const dayPadded = Math.min(28, (dayCounter * 2) + 1).toString().padStart(2, '0');
            const itemDate = `${currentYear}-${currentMonth}-${dayPadded}`;
            AppState.contentItems.push({
                id: 'cnt-' + Date.now() + '-s-' + st,
                clientId: clientId,
                title: `[Story #${st + 1}] استوري تفاعلي (${p})`,
                platform: p,
                type: 'Story / تفاعل',
                goal: 'Engagement',
                date: itemDate,
                stage: '💡 فكرة',
                storyContent: '',
                interactionType: 'Poll',
                cta: '',
                shots: [],
                archived: false
            });
            totalGeneratedCount++;
            dayCounter++;
        }
    });

    client.contentPlan = {
        platforms: checkedPlatforms,
        goal: goal,
        deliverables: deliverables,
        notes: notes
    };

    saveState();
    renderAll();
    closeModal('content-plan-modal');
    showToast("success", "تم اعتماد وتنظيم الخطة 🚀", `تم حفظ الخطة وتنظيم ${totalGeneratedCount} قطع محتوى في مساحة عمل ${client.name}.`);
}

// ================= EXPENSE HANDLERS =================
function onExpenseTypeChange(typeVal) {
    const catSelect = document.getElementById('expense-category');
    if (!catSelect) return;

    let categories = [];
    if (typeVal === 'personal') {
        categories = [
            { value: "Food", label: "طعام ومشروبات وكافيهات (Food)" },
            { value: "Transportation", label: "مواصلات شخصية وبنزين (Transportation)" },
            { value: "Shopping", label: "تسوق ومشتريات (Shopping)" },
            { value: "Bills", label: "فواتير والتزامات (Bills)" },
            { value: "Other", label: "مصاريف شخصية أخرى (Other)" }
        ];
    } else {
        categories = [
            { value: "Ads", label: "إعلانات وميديا بايينج (Ads)" },
            { value: "Production", label: "إنتاج ومعدات تصوير (Production)" },
            { value: "Design", label: "تصميم ومونتاج (Design)" },
            { value: "Software & Tools", label: "اشتراكات برامج وأدوات (Software & Tools)" },
            { value: "Transportation", label: "مواصلات وانتقالات شغل (Transportation)" },
            { value: "Office / Operations", label: "مقر وتشغيل ومصاريف إدارية (Office / Operations)" },
            { value: "Other", label: "مصاريف بيزنس أخرى (Other)" }
        ];
    }

    catSelect.innerHTML = categories.map(c => `<option value="${c.value}">${c.label}</option>`).join('');
}

function openNewExpenseModal() {
    const form = document.getElementById('expense-form');
    if (form) form.reset();
    
    const dateInput = document.getElementById('expense-date');
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

    const typeSelect = document.getElementById('expense-type');
    if (typeSelect) {
        typeSelect.value = 'business';
        onExpenseTypeChange('business');
    }

    openModal('expense-modal');
    setTimeout(() => {
        const nameInput = document.getElementById('expense-name');
        if (nameInput) nameInput.focus();
    }, 100);
}

function handleExpenseSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('expense-name')?.value.trim();
    const amount = Number(document.getElementById('expense-amount')?.value) || 0;
    const date = document.getElementById('expense-date')?.value || new Date().toISOString().slice(0, 10);
    const type = document.getElementById('expense-type')?.value || 'business';
    const category = document.getElementById('expense-category')?.value || 'Other';
    const notes = document.getElementById('expense-notes')?.value.trim() || '';

    if (!name || amount <= 0) {
        showToast('warning', 'بيانات غير مكتملة', 'يرجى إدخال اسم المصروف وقيمة المبلغ.');
        return;
    }

    if (!Array.isArray(AppState.expenses)) {
        AppState.expenses = [];
    }

    const newExp = {
        id: 'exp-' + Date.now(),
        name: name,
        amount: amount,
        date: date,
        type: type,
        category: category,
        notes: notes
    };

    AppState.expenses.unshift(newExp);
    saveState();
    renderAll();
    closeModal('expense-modal');
    showToast('success', 'تم تسجيل المصروف 💰', `تم تسجيل ${amount.toLocaleString()} ج.م (${type === 'business' ? 'بيزنس' : 'شخصي'} - ${category}) بنجاح.`);
}

// ================= SCRIPT VIEW & COPY =================
function viewFullScript(itemId) {
    const item = (AppState.contentItems || []).find(i => i.id === itemId);
    if (!item) return;

    const client = (AppState.clients || []).find(c => c.id === item.clientId) || { name: 'عميل' };
    AppState.currentScriptViewing = item;

    document.getElementById('view-script-title').textContent = item.title;
    document.getElementById('view-script-client').textContent = `${client.name} • ${item.platform} • ${item.type} • ${item.stage} (${item.goal || 'هدف عام'})`;
    
    const hookLabel = document.getElementById('view-script-hook-label');
    const hookBox = document.getElementById('view-script-hook');
    const bodyLabel = document.getElementById('view-script-body-label');
    const bodyBox = document.getElementById('view-script-body');
    const ctaLabel = document.getElementById('view-script-cta-label');
    const ctaBox = document.getElementById('view-script-cta');

    if (item.type === 'Single Post / تصميم') {
        if (hookLabel) hookLabel.textContent = "بريف التصميم المطلوب للمصمم (Design Brief) 🎨:";
        if (hookBox) hookBox.textContent = item.designBrief || 'لا يوجد بريف تصميم مكتوب';
        if (bodyLabel) bodyLabel.textContent = "كابشن البوست المصاحب (Caption):";
        if (bodyBox) bodyBox.textContent = item.caption || 'لا يوجد كابشن مكتوب';
        if (ctaBox) ctaBox.textContent = item.cta || 'لا توجد دعوة لاتخاذ إجراء';
    } else if (item.type === 'Carousel / ألبوم') {
        if (hookLabel) hookLabel.textContent = "مخطط ونقاط الشرائح (Slides Outline) 📑:";
        if (hookBox) hookBox.textContent = item.slidesOutline || 'لا يوجد مخطط شرائح مكتوب';
        if (bodyLabel) bodyLabel.textContent = "كابشن الألبوم (Caption):";
        if (bodyBox) bodyBox.textContent = item.caption || 'لا يوجد كابشن مكتوب';
        if (ctaBox) ctaBox.textContent = item.cta || 'احفظ البوست وشاركه';
    } else if (item.type === 'Story / تفاعل') {
        if (hookLabel) hookLabel.textContent = "نوع التفاعل المرفق (Sticker / Interaction):";
        if (hookBox) hookBox.textContent = `نوع التفاعل: ${item.interactionType || 'None'}`;
        if (bodyLabel) bodyLabel.textContent = "محتوى وفكرة الاستوري (Story Content) 📱:";
        if (bodyBox) bodyBox.textContent = item.storyContent || 'لا توجد تفاصيل للمحتوى';
        if (ctaBox) ctaBox.textContent = item.cta || 'اسحب لأعلى / تواصل معنا';
    } else {
        if (hookLabel) hookLabel.textContent = "الهوك الافتتاحي (Hook) ⚡:";
        if (hookBox) hookBox.textContent = item.hook || 'لا يوجد هوك مكتوب لهذا المحتوى';
        if (bodyLabel) bodyLabel.textContent = "متن الاسكريبت والسيناريو (Script Body) 📝:";
        if (bodyBox) bodyBox.textContent = item.body || 'لا توجد تفاصيل للمتن';
        if (ctaBox) ctaBox.textContent = item.cta || 'لا توجد دعوة لاتخاذ إجراء';
    }

    openModal('script-view-modal');
}

function copyCurrentScript() {
    if (!AppState.currentScriptViewing) return;
    const item = AppState.currentScriptViewing;
    const text = `📌 ${item.title}\n🎯 الهدف: ${item.goal || 'Awareness'}\n\n⚡ الهوك / المخطط:\n${item.hook || item.designBrief || item.slidesOutline || item.storyContent || '-'}\n\n📝 متن الاسكريبت / الكابشن:\n${item.body || item.caption || '-'}\n\n📢 الـ CTA:\n${item.cta || '-'}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast("success", "تم النسخ بنجاح! 📋", "تم نسخ التفاصيل بالكامل للحافظة.");
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

// ================= INTERCONNECTED NAVIGATION HELPERS =================
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
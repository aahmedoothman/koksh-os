/**
 * ==========================================================================
 * Koksh Workspace OS — Global Search & Command Bar (Ctrl + K) Module
 * Phase 7: Universal Search & Keyboard Navigation
 * ==========================================================================
 */

let selectedCommandIndex = 0;
let currentCommandResults = [];

function openCommandBar() {
    const modal = document.getElementById('modal-command-bar');
    if (!modal) return;

    modal.classList.remove('hidden');
    selectedCommandIndex = 0;

    const input = document.getElementById('command-search-input');
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 50);
    }

    renderCommandResults('');
}

function closeCommandBar() {
    const modal = document.getElementById('modal-command-bar');
    if (modal) modal.classList.add('hidden');
    selectedCommandIndex = 0;
    currentCommandResults = [];
}

function onCommandSearchInput(val) {
    selectedCommandIndex = 0;
    renderCommandResults(val);
}

function renderCommandResults(query) {
    const container = document.getElementById('command-results-container');
    if (!container) return;

    const q = (query || '').trim().toLowerCase();
    currentCommandResults = [];

    // ================= 1. EMPTY QUERY: SHOW QUICK ACTIONS =================
    if (!q) {
        const quickActions = [
            {
                type: 'action',
                title: 'إضافة قطعة محتوى جديدة',
                subtitle: 'فتح نافذة إضافة المحتوى مع تفاصيل الاسكريبت',
                icon: 'fa-solid fa-layer-group text-indigo-600 bg-indigo-50',
                badge: 'محتوى',
                badgeColor: 'bg-indigo-100 text-indigo-800',
                handler: () => { closeCommandBar(); openNewContentModal(); }
            },
            {
                type: 'action',
                title: 'تدوين فكرة سريعة 💡',
                subtitle: 'حفظ فكرة فورية في ثوانٍ بحالة (فكرة)',
                icon: 'fa-solid fa-lightbulb text-amber-600 bg-amber-50',
                badge: 'فكرة',
                badgeColor: 'bg-amber-100 text-amber-800',
                handler: () => { closeCommandBar(); openQuickIdeaModal(); }
            },
            {
                type: 'action',
                title: 'إضافة مهمة عاجلة',
                subtitle: 'تسجيل مهمة جديدة في قائمة التركيز واليوم',
                icon: 'fa-solid fa-check-double text-purple-600 bg-purple-50',
                badge: 'مهمة',
                badgeColor: 'bg-purple-100 text-purple-800',
                handler: () => { closeCommandBar(); openNewTaskModal(); }
            },
            {
                type: 'action',
                title: 'حجز جلسة تصوير',
                subtitle: 'إعداد جلسة تصوير جديدة وموقعها ومعداتها',
                icon: 'fa-solid fa-video text-rose-600 bg-rose-50',
                badge: 'تصوير',
                badgeColor: 'bg-rose-100 text-rose-800',
                handler: () => { closeCommandBar(); openNewShootModal(); }
            },
            {
                type: 'action',
                title: 'إضافة عميل جديد',
                subtitle: 'تسجيل عميل وباقة اشتراك ومجلد Drive',
                icon: 'fa-solid fa-user-plus text-blue-600 bg-blue-50',
                badge: 'عميل',
                badgeColor: 'bg-blue-100 text-blue-800',
                handler: () => { closeCommandBar(); openNewClientModal(); }
            },
            {
                type: 'action',
                title: 'تسجيل دفعة مالية',
                subtitle: 'تسجيل تحصيل أو قسط من عميل',
                icon: 'fa-solid fa-hand-holding-dollar text-emerald-600 bg-emerald-50',
                badge: 'مالية',
                badgeColor: 'bg-emerald-100 text-emerald-800',
                handler: () => { closeCommandBar(); openNewPaymentModal(); }
            }
        ];

        currentCommandResults = quickActions;

        container.innerHTML = `
            <div class="space-y-1">
                <div class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    إجراءات سريعة واختصارات (Quick Actions)
                </div>
                ${quickActions.map((act, idx) => `
                    <div id="cmd-item-${idx}" onclick="executeCommandIndex(${idx})" class="cmd-result-item p-2.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${idx === selectedCommandIndex ? 'bg-indigo-50 border border-brand-200/80 shadow-2xs' : 'hover:bg-slate-50 border border-transparent'}">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="w-8 h-8 rounded-xl ${act.icon.split(' ').slice(2).join(' ')} flex items-center justify-center text-xs shrink-0 font-bold">
                                <i class="${act.icon.split(' ').slice(0, 2).join(' ')}"></i>
                            </div>
                            <div class="min-w-0">
                                <span class="font-bold text-slate-900 text-xs block truncate">${act.title}</span>
                                <span class="text-[11px] text-slate-400 font-medium truncate block">${act.subtitle}</span>
                            </div>
                        </div>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${act.badgeColor} shrink-0">${act.badge}</span>
                    </div>
                `).join('')}
            </div>
        `;
        return;
    }

    // ================= 2. SEARCH ACROSS ALL ENTITIES =================
    const matchedClients = AppState.clients.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) || 
        (c.niche && c.niche.toLowerCase().includes(q))
    );

    const matchedContent = AppState.contentItems.filter(i => {
        const client = AppState.clients.find(c => c.id === i.clientId) || { name: '' };
        return (i.title && i.title.toLowerCase().includes(q)) ||
               (i.hook && i.hook.toLowerCase().includes(q)) ||
               (i.platform && i.platform.toLowerCase().includes(q)) ||
               (client.name && client.name.toLowerCase().includes(q));
    });

    const matchedTasks = AppState.urgentTasks.filter(t => 
        t.text && t.text.toLowerCase().includes(q)
    );

    const matchedShoots = AppState.shootSessions.filter(s => {
        const client = AppState.clients.find(c => c.id === s.clientId) || { name: '' };
        return (client.name && client.name.toLowerCase().includes(q)) ||
               (s.location && s.location.toLowerCase().includes(q)) ||
               (s.notes && s.notes.toLowerCase().includes(q)) ||
               (s.date && s.date.includes(q));
    });

    const totalMatches = matchedClients.length + matchedContent.length + matchedTasks.length + matchedShoots.length;

    // ================= 3. EMPTY STATE =================
    if (totalMatches === 0) {
        container.innerHTML = `
            <div class="text-center py-12 space-y-2">
                <i class="fa-solid fa-magnifying-glass text-3xl text-slate-300"></i>
                <h4 class="font-bold text-slate-700 text-sm">لا توجد نتائج مطابقة لـ "${query}"</h4>
                <p class="text-xs text-slate-400">جرب البحث بكلمة أخرى مثل اسم العميل، عنوان الريلز، أو التاريخ.</p>
            </div>
        `;
        return;
    }

    // Build unified index list for keyboard navigation
    matchedClients.forEach(c => {
        currentCommandResults.push({
            type: 'client',
            id: c.id,
            handler: () => { closeCommandBar(); navigateToClientWorkspace(c.id); }
        });
    });

    matchedContent.forEach(item => {
        currentCommandResults.push({
            type: 'content',
            id: item.id,
            handler: () => { closeCommandBar(); editContentItem(item.id); }
        });
    });

    matchedShoots.forEach(s => {
        currentCommandResults.push({
            type: 'shoot',
            id: s.id,
            handler: () => { closeCommandBar(); navigateToShootSession(s.id); }
        });
    });

    matchedTasks.forEach(t => {
        currentCommandResults.push({
            type: 'task',
            id: t.id,
            handler: () => {
                closeCommandBar();
                if (t.clientId) {
                    navigateToClientWorkspace(t.clientId);
                } else if (t.contentId) {
                    navigateToContent(t.contentId);
                } else {
                    switchTab('today');
                }
            }
        });
    });

    let runningIndex = 0;
    let html = '<div class="space-y-4">';

    // Render Clients Group
    if (matchedClients.length > 0) {
        html += `
            <div class="space-y-1">
                <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-users text-blue-500"></i>
                    <span>العملاء (${matchedClients.length})</span>
                </div>
                ${matchedClients.map(c => {
                    const idx = runningIndex++;
                    return `
                        <div id="cmd-item-${idx}" onclick="executeCommandIndex(${idx})" class="cmd-result-item p-2.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${idx === selectedCommandIndex ? 'bg-indigo-50 border border-brand-200/80 shadow-2xs' : 'hover:bg-slate-50 border border-transparent'}">
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                    ${c.name.charAt(0)}
                                </div>
                                <div class="min-w-0">
                                    <span class="font-bold text-slate-900 text-xs block truncate">${c.name}</span>
                                    <span class="text-[11px] text-slate-400 font-medium truncate block">${c.niche || 'عميل'} • اشتراك: ${(Number(c.retainer)||0).toLocaleString()} ج.م</span>
                                </div>
                            </div>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 shrink-0">مساحة العميل ↗</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Render Content Group
    if (matchedContent.length > 0) {
        html += `
            <div class="space-y-1">
                <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-layer-group text-indigo-500"></i>
                    <span>المحتوى والاسكريبتات (${matchedContent.length})</span>
                </div>
                ${matchedContent.map(item => {
                    const idx = runningIndex++;
                    const client = AppState.clients.find(c => c.id === item.clientId) || { name: '' };
                    return `
                        <div id="cmd-item-${idx}" onclick="executeCommandIndex(${idx})" class="cmd-result-item p-2.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${idx === selectedCommandIndex ? 'bg-indigo-50 border border-brand-200/80 shadow-2xs' : 'hover:bg-slate-50 border border-transparent'}">
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                                    <i class="fa-solid fa-file-lines"></i>
                                </div>
                                <div class="min-w-0">
                                    <span class="font-bold text-slate-900 text-xs block truncate">${item.title}</span>
                                    <span class="text-[11px] text-slate-400 font-medium truncate block">${client.name} • ${item.platform} • تاريخ: ${item.date}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 shrink-0">
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">${item.stage}</span>
                                <span class="text-[10px] text-slate-400">فتح ↗</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Render Shoots Group
    if (matchedShoots.length > 0) {
        html += `
            <div class="space-y-1">
                <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-video text-rose-500"></i>
                    <span>جلسات التصوير (${matchedShoots.length})</span>
                </div>
                ${matchedShoots.map(s => {
                    const idx = runningIndex++;
                    const client = AppState.clients.find(c => c.id === s.clientId) || { name: 'عميل' };
                    return `
                        <div id="cmd-item-${idx}" onclick="executeCommandIndex(${idx})" class="cmd-result-item p-2.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${idx === selectedCommandIndex ? 'bg-indigo-50 border border-brand-200/80 shadow-2xs' : 'hover:bg-slate-50 border border-transparent'}">
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                                    <i class="fa-solid fa-video"></i>
                                </div>
                                <div class="min-w-0">
                                    <span class="font-bold text-slate-900 text-xs block truncate">${s.date} (${s.time}) • ${s.location}</span>
                                    <span class="text-[11px] text-slate-400 font-medium truncate block">جلسة تصوير: ${client.name}</span>
                                </div>
                            </div>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 shrink-0">استوديو التصوير ↗</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Render Tasks Group
    if (matchedTasks.length > 0) {
        html += `
            <div class="space-y-1">
                <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-check-double text-purple-500"></i>
                    <span>المهام العاجلة (${matchedTasks.length})</span>
                </div>
                ${matchedTasks.map(t => {
                    const idx = runningIndex++;
                    return `
                        <div id="cmd-item-${idx}" onclick="executeCommandIndex(${idx})" class="cmd-result-item p-2.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${idx === selectedCommandIndex ? 'bg-indigo-50 border border-brand-200/80 shadow-2xs' : 'hover:bg-slate-50 border border-transparent'}">
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                                    <i class="fa-solid fa-check"></i>
                                </div>
                                <div class="min-w-0">
                                    <span class="font-bold text-slate-900 text-xs block truncate ${t.done ? 'line-through text-slate-400' : ''}">${t.text}</span>
                                    <span class="text-[10px] text-purple-700 font-semibold">${t.done ? 'مكتملة ✓' : 'معلقة'}</span>
                                </div>
                            </div>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 shrink-0">عرض ↗</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

function executeCommandIndex(idx) {
    if (currentCommandResults && currentCommandResults[idx]) {
        currentCommandResults[idx].handler();
    }
}

function updateCommandItemHighlight() {
    document.querySelectorAll('.cmd-result-item').forEach((el, idx) => {
        if (idx === selectedCommandIndex) {
            el.className = "cmd-result-item p-2.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors bg-indigo-50 border border-brand-200/80 shadow-2xs";
            el.scrollIntoView({ block: 'nearest' });
        } else {
            el.className = "cmd-result-item p-2.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors hover:bg-slate-50 border border-transparent";
        }
    });
}

// Keyboard Navigation Listener
window.addEventListener('keydown', (e) => {
    // 1. Global Ctrl+K / Cmd+K Shortcut
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        const modal = document.getElementById('modal-command-bar');
        if (modal && !modal.classList.contains('hidden')) {
            closeCommandBar();
        } else {
            openCommandBar();
        }
        return;
    }

    // 2. Command Bar Active Keyboard Navigation
    const modal = document.getElementById('modal-command-bar');
    if (modal && !modal.classList.contains('hidden')) {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeCommandBar();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentCommandResults.length > 0) {
                selectedCommandIndex = (selectedCommandIndex + 1) % currentCommandResults.length;
                updateCommandItemHighlight();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentCommandResults.length > 0) {
                selectedCommandIndex = (selectedCommandIndex - 1 + currentCommandResults.length) % currentCommandResults.length;
                updateCommandItemHighlight();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            executeCommandIndex(selectedCommandIndex);
        }
    }
});
// Additional Views (History, Progress, Import/Export)

// History Screen
Views.renderHistory = async function() {
    const container = document.getElementById('app');
    container.innerHTML = '';
    
    const header = createHeader('WORKOUT HISTORY', true);
    container.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'content-container';
    
    // Export PDF button
    const exportBtn = createButton('📄 EXPORT PDF', 'btn-warning', async () => {
        try {
            const sessions = await db.getAllWorkoutSessions();
            if (sessions.length === 0) {
                showToast('No workout history to export', 'warning');
                return;
            }
            
            showToast('Generating PDF...', 'warning');
            await exportHistoryToPDF(sessions, db);
            showToast('PDF exported successfully!', 'success');
        } catch (error) {
            console.error('PDF export failed:', error);
            showToast('Failed to export PDF: ' + error.message, 'error');
        }
    });
    exportBtn.style.marginBottom = 'var(--spacing-lg)';
    content.appendChild(exportBtn);
    
    const listContainer = document.createElement('div');
    content.appendChild(listContainer);
    
    async function renderWorkouts() {
        listContainer.innerHTML = '';
        const sessions = await db.getAllWorkoutSessions();
        
        if (sessions.length === 0) {
            listContainer.appendChild(createEmptyState('📅', 'No workout history yet'));
            return;
        }
        
        for (const session of sessions) {
            const card = createCard('');
            
            // Header section
            const headerSection = document.createElement('div');
            headerSection.className = 'flex flex-between mb-sm';
            headerSection.style.alignItems = 'flex-start';
            
            const leftSection = document.createElement('div');
            
            const dateEl = document.createElement('div');
            dateEl.style.fontSize = '16px';
            dateEl.style.fontWeight = '700';
            dateEl.textContent = formatDate(session.date);
            
            const categoryBadge = document.createElement('div');
            categoryBadge.style.display = 'inline-block';
            categoryBadge.style.padding = '4px 12px';
            categoryBadge.style.borderRadius = '20px';
            categoryBadge.style.fontSize = '12px';
            categoryBadge.style.fontWeight = '700';
            categoryBadge.style.textTransform = 'uppercase';
            categoryBadge.style.marginTop = '4px';
            
            if (session.categoryId) {
                const category = await db.getCategory(session.categoryId);
                if (category) {
                    categoryBadge.style.background = category.color;
                    categoryBadge.style.color = '#fff';
                    categoryBadge.textContent = category.name;
                }
            } else {
                categoryBadge.style.background = 'var(--color-accent-purple)';
                categoryBadge.style.color = '#fff';
                categoryBadge.textContent = session.categoryName || 'Custom';
            }
            
            const summaryEl = document.createElement('div');
            summaryEl.style.fontSize = '14px';
            summaryEl.style.color = 'var(--color-text-secondary)';
            summaryEl.style.marginTop = '4px';
            summaryEl.textContent = `${session.completedCount}/${session.totalCount} ✓ | ${session.duration} min`;
            
            leftSection.appendChild(dateEl);
            leftSection.appendChild(categoryBadge);
            
            // Deload badge
            if (session.isDeloadWeek) {
                const deloadBadge = document.createElement('div');
                deloadBadge.style.display = 'inline-block';
                deloadBadge.style.padding = '4px 12px';
                deloadBadge.style.borderRadius = '20px';
                deloadBadge.style.fontSize = '11px';
                deloadBadge.style.fontWeight = '700';
                deloadBadge.style.textTransform = 'uppercase';
                deloadBadge.style.marginTop = '4px';
                deloadBadge.style.marginLeft = '8px';
                deloadBadge.style.background = 'var(--color-accent-warning)';
                deloadBadge.style.color = '#000';
                deloadBadge.textContent = '🔄 DELOAD';
                leftSection.appendChild(deloadBadge);
            }
            
            leftSection.appendChild(summaryEl);
            
            const deleteBtn = createButton('🗑️', 'btn-icon btn-danger', async () => {
                const confirmed = await confirm(
                    'Delete Workout?',
                    `Delete workout from ${formatDate(session.date)}?`
                );
                if (confirmed) {
                    await db.deleteWorkoutSession(session.id);
                    await renderWorkouts();
                    showToast('Workout deleted', 'success');
                }
            });
            
            headerSection.appendChild(leftSection);
            headerSection.appendChild(deleteBtn);
            
            card.appendChild(headerSection);
            
            // Divider
            const divider = document.createElement('div');
            divider.style.height = '1px';
            divider.style.background = 'rgba(255, 255, 255, 0.1)';
            divider.style.margin = 'var(--spacing-sm) 0';
            card.appendChild(divider);
            
            // Exercise list
            const records = await db.getWorkoutExerciseRecords(session.id);
            for (const record of records) {
                const exerciseEl = document.createElement('div');
                exerciseEl.style.marginBottom = 'var(--spacing-xs)';
                
                const nameEl = document.createElement('div');
                nameEl.style.fontSize = '15px';
                nameEl.style.fontWeight = '700';
                nameEl.innerHTML = record.completed ? '✓ ' : '';
                nameEl.innerHTML += record.exerciseName;
                nameEl.style.color = record.completed ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)';
                
                const detailsEl = document.createElement('div');
                detailsEl.style.fontSize = '13px';
                detailsEl.style.color = 'var(--color-text-tertiary)';
                const detailsParts = [];
                if (record.sets) detailsParts.push(`${record.sets}×${record.reps}`);
                if (record.weight) detailsParts.push(record.weight);
                detailsEl.textContent = detailsParts.join(' | ');
                
                exerciseEl.appendChild(nameEl);
                if (detailsParts.length > 0) exerciseEl.appendChild(detailsEl);
                
                if (record.notes) {
                    const notesEl = document.createElement('div');
                    notesEl.style.fontSize = '13px';
                    notesEl.style.fontStyle = 'italic';
                    notesEl.style.color = 'var(--color-text-tertiary)';
                    notesEl.textContent = `• ${record.notes}`;
                    exerciseEl.appendChild(notesEl);
                }
                
                if (record.workoutNotes) {
                    const workoutNotesEl = document.createElement('div');
                    workoutNotesEl.style.fontSize = '13px';
                    workoutNotesEl.style.fontWeight = '600';
                    workoutNotesEl.style.color = 'var(--color-accent-warning)';
                    workoutNotesEl.textContent = `Note: ${record.workoutNotes}`;
                    exerciseEl.appendChild(workoutNotesEl);
                }
                
                card.appendChild(exerciseEl);
            }
            
            listContainer.appendChild(card);
        }
    }
    
    await renderWorkouts();
    container.appendChild(content);
};

// Exercise Progress Screen
Views.renderExerciseProgress = async function(params) {
    const { id } = params;
    const exercise = await db.getExercise(id);
    
    if (!exercise) {
        showToast('Exercise not found', 'error');
        router.back();
        return;
    }
    
    const container = document.getElementById('app');
    container.innerHTML = '';
    
    const header = createHeader('EXERCISE PROGRESS', true);
    container.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'content-container';
    
    // Exercise name
    const nameEl = document.createElement('h2');
    nameEl.textContent = exercise.name;
    nameEl.style.marginBottom = 'var(--spacing-lg)';
    content.appendChild(nameEl);
    
    // Stats
    const history = await db.getExerciseHistory(id);
    const totalSessions = history.length;
    const lastPerformed = history.length > 0 ? history[0].date : null;
    
    const statsGrid = document.createElement('div');
    statsGrid.className = 'stats-grid mb-lg';
    
    statsGrid.appendChild(createStatCard(totalSessions, 'Total Sessions'));
    statsGrid.appendChild(createStatCard(formatDate(lastPerformed), 'Last Performed'));
    
    content.appendChild(statsGrid);
    
    // Personal Record section
    const pr = findPersonalRecord(history);
    
    const prCard = createCard('');
    prCard.style.background = 'linear-gradient(135deg, rgba(255, 170, 0, 0.2), rgba(255, 136, 0, 0.2))';
    prCard.style.border = '2px solid var(--color-accent-warning)';
    
    const prTitle = document.createElement('div');
    prTitle.style.fontSize = '24px';
    prTitle.style.fontWeight = '900';
    prTitle.style.color = 'var(--color-accent-warning)';
    prTitle.style.marginBottom = 'var(--spacing-sm)';
    prTitle.textContent = '🏆 PERSONAL RECORD';
    
    const prDetails = document.createElement('div');
    prDetails.style.fontSize = '28px';
    prDetails.style.fontWeight = '700';
    prDetails.style.marginBottom = 'var(--spacing-xs)';
    
    const prDate = document.createElement('div');
    prDate.style.fontSize = '20px';
    prDate.style.color = 'var(--color-text-secondary)';
    
    if (pr) {
        const detailsParts = [];
        if (pr.sets) detailsParts.push(`${pr.sets} sets`);
        if (pr.reps) detailsParts.push(`${pr.reps} reps`);
        if (pr.weight) detailsParts.push(pr.weight);
        prDetails.textContent = detailsParts.join(' × ');
        prDate.textContent = `Set on: ${formatDate(pr.date)}`;
    } else {
        prDetails.textContent = 'No PR set yet';
        prDate.textContent = 'Complete a workout to set your first record';
    }
    
    prCard.appendChild(prTitle);
    prCard.appendChild(prDetails);
    prCard.appendChild(prDate);
    content.appendChild(prCard);
    
    // History section
    const historyTitle = document.createElement('h3');
    historyTitle.textContent = 'HISTORY';
    historyTitle.style.marginTop = 'var(--spacing-xl)';
    historyTitle.style.marginBottom = 'var(--spacing-md)';
    content.appendChild(historyTitle);
    
    const historyContainer = document.createElement('div');
    
    if (history.length === 0) {
        historyContainer.appendChild(createEmptyState('📊', 'No history yet'));
    } else {
        for (const record of history) {
            const recordCard = createCard('');
            
            const recordHeader = document.createElement('div');
            recordHeader.className = 'flex flex-between mb-sm';
            
            const dateEl = document.createElement('div');
            dateEl.style.fontSize = '22px';
            dateEl.style.fontWeight = '700';
            if (pr && record.id === pr.id) {
                dateEl.innerHTML = '🏆 ';
            }
            dateEl.innerHTML += formatDate(record.date);
            
            recordHeader.appendChild(dateEl);
            recordCard.appendChild(recordHeader);
            
            const detailsEl = document.createElement('div');
            detailsEl.style.fontSize = '20px';
            detailsEl.style.color = 'var(--color-text-primary)';
            const detailsParts = [];
            if (record.weight) detailsParts.push(`Weight: ${record.weight}`);
            if (record.sets) detailsParts.push(`Sets: ${record.sets}`);
            if (record.reps) detailsParts.push(`Reps: ${record.reps}`);
            detailsEl.textContent = detailsParts.join(' | ');
            recordCard.appendChild(detailsEl);
            
            if (record.notes) {
                const notesEl = document.createElement('div');
                notesEl.style.fontSize = '18px';
                notesEl.style.fontStyle = 'italic';
                notesEl.style.color = 'var(--color-text-secondary)';
                notesEl.style.marginTop = 'var(--spacing-sm)';
                notesEl.textContent = `Notes: ${record.notes}`;
                recordCard.appendChild(notesEl);
            }
            
            historyContainer.appendChild(recordCard);
        }
    }
    
    content.appendChild(historyContainer);
    container.appendChild(content);
};

// Import/Export Screen
Views.renderImportExport = async function() {
    const container = document.getElementById('app');
    container.innerHTML = '';
    
    const header = createHeader('BACKUP & RESTORE', true);
    container.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'content-container';
    
    // Export section
    const exportTitle = document.createElement('h2');
    exportTitle.textContent = 'EXPORT DATA';
    exportTitle.style.marginBottom = 'var(--spacing-sm)';
    content.appendChild(exportTitle);
    
    const exportDesc = document.createElement('div');
    exportDesc.style.fontSize = '16px';
    exportDesc.style.color = 'var(--color-text-secondary)';
    exportDesc.style.marginBottom = 'var(--spacing-md)';
    exportDesc.textContent = 'Create a backup of all your exercises, categories, and workout history.';
    content.appendChild(exportDesc);
    
    const exportBtn = createButton('EXPORT TO FILE', 'btn-large btn-primary', async () => {
        const data = await db.exportData();
        const date = new Date().toISOString().split('T')[0];
        const filename = `fittrack_backup_${date}.json`;
        exportToJSON(data, filename);
        showToast('Backup exported successfully', 'success');
    });
    content.appendChild(exportBtn);
    
    // Divider
    const divider1 = document.createElement('div');
    divider1.style.height = '2px';
    divider1.style.background = 'rgba(255, 255, 255, 0.1)';
    divider1.style.margin = 'var(--spacing-xl) 0';
    content.appendChild(divider1);
    
    // Import section
    const importTitle = document.createElement('h2');
    importTitle.textContent = 'IMPORT DATA';
    importTitle.style.marginBottom = 'var(--spacing-sm)';
    content.appendChild(importTitle);
    
    const importWarning = document.createElement('div');
    importWarning.style.fontSize = '18px';
    importWarning.style.fontWeight = '700';
    importWarning.style.color = 'var(--color-accent-danger)';
    importWarning.style.marginBottom = 'var(--spacing-sm)';
    importWarning.textContent = '⚠️ WARNING: Importing will replace ALL current data!';
    content.appendChild(importWarning);
    
    const importDesc = document.createElement('div');
    importDesc.style.fontSize = '16px';
    importDesc.style.color = 'var(--color-text-secondary)';
    importDesc.style.marginBottom = 'var(--spacing-md)';
    importDesc.textContent = 'Restore a previously saved backup file.';
    content.appendChild(importDesc);
    
    const importBtn = createButton('IMPORT FROM FILE', 'btn-large btn-warning', async () => {
        try {
            const data = await importFromJSON();
            
            const confirmed = await confirm(
                'Import Data?',
                'This will replace all your current data with the imported backup. Are you sure?'
            );
            
            if (confirmed) {
                await db.importData(data);
                showToast('Backup imported successfully', 'success');
                router.navigate('home');
            }
        } catch (error) {
            showToast(error, 'error');
        }
    });
    content.appendChild(importBtn);
    
    // Divider
    const divider2 = document.createElement('div');
    divider2.style.height = '2px';
    divider2.style.background = 'rgba(255, 255, 255, 0.1)';
    divider2.style.margin = 'var(--spacing-xl) 0';
    content.appendChild(divider2);
    
    // Backup info section
    const infoTitle = document.createElement('h2');
    infoTitle.textContent = 'BACKUP INFO';
    infoTitle.style.marginBottom = 'var(--spacing-md)';
    content.appendChild(infoTitle);
    
    const statsGrid = document.createElement('div');
    statsGrid.className = 'stats-grid';
    
    const exercises = await db.getAllExercises();
    const categories = await db.getAllCategories();
    const workouts = await db.getAllWorkoutSessions();
    const records = await db.getAll('workoutExerciseRecords');
    
    statsGrid.appendChild(createStatCard(exercises.length, 'Exercises'));
    statsGrid.appendChild(createStatCard(categories.length, 'Categories'));
    statsGrid.appendChild(createStatCard(workouts.length, 'Workouts'));
    statsGrid.appendChild(createStatCard(records.length, 'Records'));
    
    content.appendChild(statsGrid);
    
    // Divider
    const divider3 = document.createElement('div');
    divider3.style.height = '2px';
    divider3.style.background = 'rgba(255, 255, 255, 0.1)';
    divider3.style.margin = 'var(--spacing-xl) 0';
    content.appendChild(divider3);
    
    // Tips section
    const tipsTitle = document.createElement('h2');
    tipsTitle.textContent = 'TIPS';
    tipsTitle.style.marginBottom = 'var(--spacing-md)';
    content.appendChild(tipsTitle);
    
    const tipsText = document.createElement('div');
    tipsText.style.fontSize = '18px';
    tipsText.style.lineHeight = '1.8';
    tipsText.style.color = 'var(--color-text-secondary)';
    tipsText.innerHTML = `
        • Export your data regularly to prevent data loss<br>
        • You can transfer backup files between devices<br>
        • Backup files are in JSON format<br>
        • Keep your most recent backup in a safe place
    `;
    content.appendChild(tipsText);
    
    container.appendChild(content);
};

// All View/Screen Implementations

const Views = {
    // Main Home Screen
    async renderHome() {
        const container = document.getElementById('app');
        container.innerHTML = '';
        
        const header = createHeader('FITTRACK');
        container.appendChild(header);
        
        const content = document.createElement('div');
        content.className = 'content-container';
        
        // Check if this should be a deload week
        const isDeload = await shouldDeload();
        if (isDeload) {
            const deloadPercent = await db.getSetting('deloadPercent', 50);
            const deloadBanner = document.createElement('div');
            deloadBanner.style.padding = '20px';
            deloadBanner.style.background = 'linear-gradient(135deg, rgba(255, 170, 0, 0.15), rgba(255, 140, 0, 0.15))';
            deloadBanner.style.border = '3px solid var(--color-accent-warning)';
            deloadBanner.style.borderRadius = 'var(--border-radius)';
            deloadBanner.style.marginBottom = 'var(--spacing-lg)';
            deloadBanner.style.textAlign = 'center';
            deloadBanner.style.animation = 'pulse 2s ease-in-out infinite';
            
            const deloadIcon = document.createElement('div');
            deloadIcon.style.fontSize = '40px';
            deloadIcon.style.marginBottom = '8px';
            deloadIcon.textContent = '🔄';
            
            const deloadTitle = document.createElement('div');
            deloadTitle.style.fontSize = '24px';
            deloadTitle.style.fontWeight = '900';
            deloadTitle.style.color = 'var(--color-accent-warning)';
            deloadTitle.style.marginBottom = '4px';
            deloadTitle.textContent = 'DELOAD WEEK';
            
            const deloadText = document.createElement('div');
            deloadText.style.fontSize = '15px';
            deloadText.style.color = 'var(--color-text-secondary)';
            deloadText.style.fontWeight = '600';
            deloadText.textContent = `All weights will be reduced by ${deloadPercent}% for recovery`;
            
            deloadBanner.appendChild(deloadIcon);
            deloadBanner.appendChild(deloadTitle);
            deloadBanner.appendChild(deloadText);
            content.appendChild(deloadBanner);
        }
        
        // Custom Workout Button
        const customBtn = createButton('CUSTOM WORKOUT', 'btn-large btn-purple', () => {
            router.navigate('custom-workout');
        });
        content.appendChild(customBtn);
        
        // Category Buttons
        const categories = await db.getAllCategories();
        console.log('Categories loaded:', categories.length);
        for (const category of categories) {
            console.log(`Category: ${category.name}, isRandom: ${category.isRandom}`);
            const btn = createButton(category.name, 'btn-large', () => {
                console.log(`Clicked category: ${category.name}, isRandom: ${category.isRandom}`);
                // Check if random selection or manual selection
                if (category.isRandom === false) {
                    console.log('Navigating to selectExercises with categoryId:', category.id);
                    router.navigate('selectExercises', { categoryId: category.id });
                } else {
                    console.log('Navigating to workout with categoryId:', category.id);
                    router.navigate('workout', { categoryId: category.id });
                }
            });
            btn.style.background = `linear-gradient(135deg, ${category.color}, ${shadeColor(category.color, -20)})`;
            content.appendChild(btn);
        }
        
        // Utility Buttons
        const utilityContainer = document.createElement('div');
        utilityContainer.className = 'flex gap-sm mt-lg';
        utilityContainer.style.flexWrap = 'wrap';
        
        const manageBtn = createButton('MANAGE EXERCISES', 'btn-secondary', () => {
            router.navigate('manage-exercises');
        });
        manageBtn.style.flex = '1';
        manageBtn.style.minWidth = '120px';
        
        const historyBtn = createButton('HISTORY', 'btn-secondary', () => {
            router.navigate('history');
        });
        historyBtn.style.flex = '1';
        historyBtn.style.minWidth = '120px';
        
        const setupBtn = createButton('SETUP CATEGORIES', 'btn-secondary', () => {
            router.navigate('setup');
        });
        setupBtn.style.flex = '1';
        setupBtn.style.minWidth = '120px';
        
        utilityContainer.appendChild(manageBtn);
        utilityContainer.appendChild(historyBtn);
        utilityContainer.appendChild(setupBtn);
        
        content.appendChild(utilityContainer);
        
        // Version footer
        const versionFooter = document.createElement('div');
        versionFooter.style.textAlign = 'center';
        versionFooter.style.marginTop = 'var(--spacing-xl)';
        versionFooter.style.paddingTop = 'var(--spacing-lg)';
        versionFooter.style.borderTop = '1px solid rgba(255, 255, 255, 0.05)';
        versionFooter.style.fontSize = '11px';
        versionFooter.style.color = 'var(--color-text-tertiary)';
        versionFooter.style.fontWeight = '600';
        versionFooter.innerHTML = `FitTrack <span style="color: var(--color-accent-primary);">v${APP_VERSION}</span> • Build ${APP_BUILD}`;
        content.appendChild(versionFooter);
        
        container.appendChild(content);
    },

    // Custom Workout Selection Screen
    async renderCustomWorkout() {
        const container = document.getElementById('app');
        container.innerHTML = '';
        
        const header = createHeader('CUSTOM WORKOUT', true);
        container.appendChild(header);
        
        const content = document.createElement('div');
        content.className = 'content-container';
        
        // Selection counter
        const counter = document.createElement('div');
        counter.className = 'text-center mb-lg';
        counter.style.fontSize = '20px';
        counter.style.fontWeight = '700';
        counter.style.color = 'var(--color-accent-primary)';
        counter.textContent = '0 exercises selected';
        content.appendChild(counter);
        
        // Action buttons (at top for easy access)
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'flex gap-sm';
        actionsContainer.style.flexWrap = 'wrap';
        actionsContainer.style.marginBottom = 'var(--spacing-md)';
        
        const selectAllBtn = createButton('SELECT ALL', 'btn-secondary', () => {
            filteredExercises.forEach(e => selectedIds.add(e.id));
            counter.textContent = `${selectedIds.size} exercise${selectedIds.size !== 1 ? 's' : ''} selected`;
            renderExerciseList();
        });
        selectAllBtn.style.flex = '1';
        
        const clearAllBtn = createButton('CLEAR ALL', 'btn-warning', () => {
            selectedIds.clear();
            counter.textContent = '0 exercises selected';
            renderExerciseList();
        });
        clearAllBtn.style.flex = '1';
        
        content.appendChild(actionsContainer);
        
        const startBtn = createButton('START WORKOUT', 'btn-large btn-primary', () => {
            if (selectedIds.size === 0) {
                showToast('Please select at least one exercise', 'warning');
                return;
            }
            router.navigate('workout', { 
                categoryId: null, 
                customExerciseIds: Array.from(selectedIds) 
            });
        });
        content.appendChild(startBtn);
        
        // Search bar
        let allExercises = await db.getAllExercises();
        let filteredExercises = [...allExercises];
        let selectedIds = new Set();
        
        const searchBar = createSearchBar('Search exercises...', async (query) => {
            const lowerQuery = query.toLowerCase();
            filteredExercises = allExercises.filter(exercise => {
                const nameMatch = exercise.name.toLowerCase().includes(lowerQuery);
                const notesMatch = exercise.notes && exercise.notes.toLowerCase().includes(lowerQuery);
                return nameMatch || notesMatch;
            });
            renderExerciseList();
        });
        content.appendChild(searchBar);
        
        // Exercise list container
        const listContainer = document.createElement('div');
        listContainer.style.marginBottom = 'var(--spacing-xl)';
        content.appendChild(listContainer);
        
        async function renderExerciseList() {
            listContainer.innerHTML = '';
            
            if (filteredExercises.length === 0) {
                listContainer.appendChild(createEmptyState('🏋️', 'No exercises found'));
                return;
            }
            
            for (const exercise of filteredExercises) {
                const card = createCard('');
                card.style.cursor = 'pointer';
                
                const itemContainer = document.createElement('div');
                itemContainer.className = 'exercise-item';
                
                const checkbox = createCheckbox(selectedIds.has(exercise.id), (checked) => {
                    if (checked) {
                        selectedIds.add(exercise.id);
                    } else {
                        selectedIds.delete(exercise.id);
                    }
                    counter.textContent = `${selectedIds.size} exercise${selectedIds.size !== 1 ? 's' : ''} selected`;
                });
                
                const details = document.createElement('div');
                details.className = 'exercise-details';
                
                const name = document.createElement('div');
                name.className = 'exercise-name';
                name.textContent = exercise.name;
                
                const categories = await db.getExerciseCategories(exercise.id);
                const categoriesEl = document.createElement('div');
                categoriesEl.className = 'exercise-meta';
                categoriesEl.style.display = 'flex';
                categoriesEl.style.gap = '4px';
                categoriesEl.style.flexWrap = 'wrap';
                categories.forEach(cat => {
                    categoriesEl.appendChild(createCategoryBadge(cat));
                });
                
                const meta = document.createElement('div');
                meta.className = 'exercise-meta';
                meta.textContent = `Last: ${formatDate(exercise.lastUsedDate)}`;
                
                const stats = document.createElement('div');
                stats.className = 'exercise-stats';
                const statsParts = [];
                if (exercise.sets) statsParts.push(`${exercise.sets} sets`);
                if (exercise.reps) statsParts.push(`${exercise.reps} reps`);
                if (exercise.weight) statsParts.push(exercise.weight);
                stats.textContent = statsParts.join(' × ');
                
                details.appendChild(name);
                details.appendChild(categoriesEl);
                details.appendChild(meta);
                if (statsParts.length > 0) details.appendChild(stats);
                
                itemContainer.appendChild(checkbox);
                itemContainer.appendChild(details);
                
                card.appendChild(itemContainer);
                
                card.onclick = (e) => {
                    if (e.target !== checkbox) {
                        checkbox.click();
                    }
                };
                
                listContainer.appendChild(card);
            }
        }
        
        await renderExerciseList();
        
        container.appendChild(content);
    },

    // Select Exercises Screen (for non-random categories)
    async renderSelectExercises(params) {
        console.log('renderSelectExercises called with params:', params);
        const { categoryId } = params;
        console.log('categoryId extracted:', categoryId);
        const category = await db.getCategory(categoryId);
        console.log('category loaded:', category);
        
        const container = document.getElementById('app');
        container.innerHTML = '';
        console.log('container cleared');
        
        const header = createHeader(`SELECT EXERCISES - ${category.name}`, true);
        container.appendChild(header);
        console.log('header added');
        
        const content = document.createElement('div');
        content.className = 'content-container';
        
        // Get all exercises in this category
        console.log('About to call getCategoryExercises with:', categoryId);
        const allExercises = await db.getCategoryExercises(categoryId);
        console.log('allExercises loaded:', allExercises.length);
        const selectedIds = new Set();
        
        // Counter
        const counter = document.createElement('div');
        counter.style.padding = 'var(--spacing-md)';
        counter.style.textAlign = 'center';
        counter.style.fontSize = '18px';
        counter.style.fontWeight = '700';
        counter.style.color = 'var(--color-accent-primary)';
        counter.textContent = '0 exercises selected';
        content.appendChild(counter);
        
        // Action buttons (at top for easy access)
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'flex gap-sm';
        actionsContainer.style.flexWrap = 'wrap';
        actionsContainer.style.marginBottom = 'var(--spacing-md)';
        
        const selectAllBtn = createButton('SELECT ALL', 'btn-secondary', async () => {
            allExercises.forEach(e => selectedIds.add(e.id));
            counter.textContent = `${selectedIds.size} exercise${selectedIds.size !== 1 ? 's' : ''} selected`;
            await renderExerciseList();
        });
        selectAllBtn.style.flex = '1';
        
        const clearAllBtn = createButton('CLEAR ALL', 'btn-warning', async () => {
            selectedIds.clear();
            counter.textContent = '0 exercises selected';
            await renderExerciseList();
        });
        clearAllBtn.style.flex = '1';
        
        actionsContainer.appendChild(selectAllBtn);
        actionsContainer.appendChild(clearAllBtn);
        content.appendChild(actionsContainer);
        
        const startBtn = createButton('START WORKOUT', 'btn-large btn-primary', () => {
            if (selectedIds.size === 0) {
                showToast('Please select at least one exercise', 'warning');
                return;
            }
            router.navigate('workout', { 
                categoryId: categoryId,
                customExerciseIds: Array.from(selectedIds)
            });
        });
        content.appendChild(startBtn);
        
        // Exercise list
        const listContainer = document.createElement('div');
        listContainer.className = 'flex flex-column gap-sm';
        content.appendChild(listContainer);
        
        const renderExerciseList = async () => {
            listContainer.innerHTML = '';
            
            for (const exercise of allExercises) {
                const card = document.createElement('div');
                card.className = 'card';
                card.style.cursor = 'pointer';
                card.style.transition = 'all 0.2s ease';
                
                const itemContainer = document.createElement('div');
                itemContainer.style.display = 'flex';
                itemContainer.style.gap = '16px';
                itemContainer.style.alignItems = 'flex-start';
                
                const checkbox = createCheckbox(selectedIds.has(exercise.id), (checked) => {
                    if (checked) {
                        selectedIds.add(exercise.id);
                    } else {
                        selectedIds.delete(exercise.id);
                    }
                    counter.textContent = `${selectedIds.size} exercise${selectedIds.size !== 1 ? 's' : ''} selected`;
                });
                checkbox.style.marginTop = '4px';
                
                const details = document.createElement('div');
                details.style.flex = '1';
                
                const name = document.createElement('div');
                name.style.fontSize = '18px';
                name.style.fontWeight = '700';
                name.style.marginBottom = '4px';
                name.textContent = exercise.name;
                
                // Last used date
                const lastUsed = document.createElement('div');
                lastUsed.style.fontSize = '14px';
                lastUsed.style.color = 'var(--color-text-secondary)';
                if (exercise.lastUsedDate && exercise.lastUsedDate > 0) {
                    lastUsed.textContent = `Last used: ${formatDate(exercise.lastUsedDate)}`;
                } else {
                    lastUsed.textContent = 'Last used: never';
                }
                
                // Exercise stats
                const meta = document.createElement('div');
                meta.style.fontSize = '14px';
                meta.style.color = 'var(--color-text-tertiary)';
                meta.style.marginTop = '4px';
                
                const statsParts = [];
                if (exercise.sets) statsParts.push(`${exercise.sets} sets`);
                if (exercise.reps) statsParts.push(`${exercise.reps} reps`);
                if (exercise.weight) statsParts.push(exercise.weight);
                
                const stats = document.createElement('div');
                stats.style.fontSize = '14px';
                stats.style.color = 'var(--color-text-secondary)';
                stats.style.marginTop = '4px';
                stats.textContent = statsParts.join(' × ');
                
                details.appendChild(name);
                details.appendChild(lastUsed);
                if (statsParts.length > 0) details.appendChild(stats);
                
                itemContainer.appendChild(checkbox);
                itemContainer.appendChild(details);
                
                card.appendChild(itemContainer);
                
                card.onclick = (e) => {
                    if (e.target !== checkbox) {
                        checkbox.click();
                    }
                };
                
                listContainer.appendChild(card);
            }
        };
        
        await renderExerciseList();
        
        container.appendChild(content);
    },

    // Workout Screen
    async renderWorkout(params) {
        const { categoryId, customExerciseIds } = params;
        
        const container = document.getElementById('app');
        container.innerHTML = '';
        
        let categoryName = 'Custom';
        let exercises = [];
        
        // Check if custom exercise IDs were provided (from custom workout OR manual category selection)
        if (customExerciseIds && customExerciseIds.length > 0) {
            // Load the specific exercises chosen by user
            for (const id of customExerciseIds) {
                const exercise = await db.getExercise(id);
                if (exercise) exercises.push(exercise);
            }
            
            // If there's a category, use its name
            if (categoryId) {
                const category = await db.getCategory(categoryId);
                categoryName = category.name;
            }
        } else if (categoryId) {
            // Load category exercises with automatic rotation
            const category = await db.getCategory(categoryId);
            categoryName = category.name;
            const allExercises = await db.getCategoryExercises(categoryId);
            exercises = selectExercisesForWorkout(
                allExercises,
                category.rotationFrequency,
                category.exercisesPerWorkout
            );
        } else {
            // No exercises selected - shouldn't happen
            console.error('No categoryId or customExerciseIds provided to workout');
        }
        
        const header = createHeader(`${categoryName.toUpperCase()} WORKOUT`, true);
        container.appendChild(header);
        
        const content = document.createElement('div');
        content.className = 'content-container';
        
        // Check if this should be a deload week
        const isDeload = await shouldDeload();
        
        if (isDeload) {
            const deloadPercent = await db.getSetting('deloadPercent', 50);
            exercises = await applyDeload(exercises, deloadPercent);
            
            // Show deload notification banner
            const deloadAlert = document.createElement('div');
            deloadAlert.style.padding = '16px';
            deloadAlert.style.background = 'linear-gradient(135deg, rgba(255, 170, 0, 0.2), rgba(255, 140, 0, 0.2))';
            deloadAlert.style.border = '2px solid var(--color-accent-warning)';
            deloadAlert.style.borderRadius = 'var(--border-radius)';
            deloadAlert.style.marginBottom = 'var(--spacing-lg)';
            deloadAlert.style.textAlign = 'center';
            
            const deloadIcon = document.createElement('div');
            deloadIcon.style.fontSize = '32px';
            deloadIcon.style.marginBottom = '8px';
            deloadIcon.textContent = '🔄';
            
            const deloadText = document.createElement('div');
            deloadText.style.fontSize = '18px';
            deloadText.style.fontWeight = '700';
            deloadText.style.color = 'var(--color-accent-warning)';
            deloadText.textContent = 'DELOAD WEEK';
            
            const deloadSubtext = document.createElement('div');
            deloadSubtext.style.fontSize = '14px';
            deloadSubtext.style.color = 'var(--color-text-secondary)';
            deloadSubtext.style.marginTop = '4px';
            deloadSubtext.textContent = `All weights reduced by ${deloadPercent}% for recovery`;
            
            deloadAlert.appendChild(deloadIcon);
            deloadAlert.appendChild(deloadText);
            deloadAlert.appendChild(deloadSubtext);
            content.appendChild(deloadAlert);
        }
        
        const startTime = Date.now();
        const completedSet = new Set();
        const adjustedWeights = new Map();
        const adjustedTimers = new Map();
        const adjustedRestTimers = new Map();
        const workoutNotes = new Map();
        const timers = new Map();
        
        // Store timers globally so they can be stopped when navigating away
        window.activeTimers = timers;
        
        // Progress indicator
        const progressEl = document.createElement('div');
        progressEl.className = 'text-center mb-lg';
        progressEl.style.fontSize = '28px';
        progressEl.style.fontWeight = '900';
        progressEl.style.color = 'var(--color-accent-primary)';
        content.appendChild(progressEl);
        
        function updateProgress() {
            progressEl.textContent = `Progress: ${completedSet.size}/${exercises.length} ✓`;
        }
        updateProgress();
        
        // Exercise list
        const listContainer = document.createElement('div');
        content.appendChild(listContainer);
        
        async function renderExercises() {
            listContainer.innerHTML = '';
            
            // Sort: incomplete first, completed last
            const sorted = [...exercises].sort((a, b) => {
                const aCompleted = completedSet.has(a.id);
                const bCompleted = completedSet.has(b.id);
                if (aCompleted === bCompleted) return 0;
                return aCompleted ? 1 : -1;
            });
            
            for (const exercise of sorted) {
                const card = createCard('');
                const isCompleted = completedSet.has(exercise.id);
                
                if (isCompleted) {
                    card.style.opacity = '0.6';
                }
                
                const itemContainer = document.createElement('div');
                
                // Checkbox
                const checkboxContainer = document.createElement('div');
                checkboxContainer.className = 'checkbox-container';
                checkboxContainer.style.justifyContent = 'flex-start';
                
                const checkbox = createCheckbox(isCompleted, async (checked) => {
                    if (checked) {
                        // Animate card sliding down before re-render
                        const card = itemContainer;
                        card.style.transition = 'all 0.5s ease-out';
                        card.style.opacity = '0.5';
                        card.style.transform = 'translateY(20px)';
                        
                        // Wait for animation
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        completedSet.add(exercise.id);
                        // Stop timer if this exercise has one
                        const timer = timers.get(exercise.id);
                        if (timer) {
                            timer.stop();
                            // Save current timer values before re-render
                            adjustedTimers.set(exercise.id, timer.getValue());
                            adjustedRestTimers.set(exercise.id, timer.getRestValue());
                        }
                    } else {
                        completedSet.delete(exercise.id);
                    }
                    updateProgress();
                    renderExercises();
                });
                checkbox.style.width = '36px';  // Reduced from 50px
                checkbox.style.height = '36px'; // Reduced from 50px
                checkbox.style.transform = 'scale(1.0)'; // Reduced from 1.3
                
                const nameEl = document.createElement('div');
                nameEl.style.fontSize = '20px';
                nameEl.style.fontWeight = '700';
                nameEl.textContent = exercise.name;
                
                checkboxContainer.appendChild(checkbox);
                checkboxContainer.appendChild(nameEl);
                itemContainer.appendChild(checkboxContainer);
                
                // Progression suggestion and progress
                const history = await db.getExerciseHistory(exercise.id);
                const progressionThreshold = exercise.progressionThreshold || 3;
                const progressionIncrement = exercise.progressionIncrement || 5;
                const isTimedExercise = exercise.timerSeconds > 0;
                
                // Only count progression if exercise has been used (lastUsedDate > 0)
                // This prevents orphaned history entries from showing incorrect counts
                const hasBeenUsed = exercise.lastUsedDate && exercise.lastUsedDate > 0;
                const consecutiveCount = hasBeenUsed ? countConsecutiveCompletions(history, exercise.weight) : 0;
                
                const suggestion = calculateProgression(
                    history, 
                    exercise.weight, 
                    progressionThreshold,
                    isTimedExercise,
                    exercise.timerSeconds,
                    progressionIncrement
                );
                
                // Show progression progress
                if ((exercise.weight && !isTimedExercise) || isTimedExercise) {
                    const progressInfo = document.createElement('div');
                    progressInfo.style.fontSize = '14px';
                    progressInfo.style.fontWeight = '600';
                    progressInfo.style.marginTop = '4px';
                    progressInfo.style.marginBottom = '4px';
                    
                    if (suggestion) {
                        progressInfo.style.color = 'var(--color-accent-warning)';
                        progressInfo.textContent = `🔥 ${consecutiveCount}/${progressionThreshold} completions - Ready to progress!`;
                    } else {
                        progressInfo.style.color = 'var(--color-text-secondary)';
                        const progressType = isTimedExercise ? 'time' : 'weight';
                        progressInfo.textContent = `Progress: ${consecutiveCount}/${progressionThreshold} completions at current ${progressType}`;
                    }
                    itemContainer.appendChild(progressInfo);
                }
                
                if (suggestion) {
                    const alert = document.createElement('div');
                    alert.className = 'progression-alert';
                    alert.textContent = `💡 Ready to progress! Try ${suggestion}`;
                    itemContainer.appendChild(alert);
                    
                    // Auto-adjust weight or timer
                    if (isTimedExercise) {
                        // Don't auto-adjust timer, just show suggestion
                    } else if (!adjustedWeights.has(exercise.id)) {
                        adjustedWeights.set(exercise.id, suggestion);
                    }
                }
                
                // Exercise details
                const detailsContainer = document.createElement('div');
                detailsContainer.style.marginTop = 'var(--spacing-sm)';
                
                if (exercise.sets) {
                    const setsEl = document.createElement('div');
                    setsEl.style.fontSize = '16px';
                    setsEl.style.marginBottom = '4px';
                    setsEl.textContent = `Sets: ${exercise.sets}`;
                    detailsContainer.appendChild(setsEl);
                }
                
                if (exercise.reps) {
                    const repsEl = document.createElement('div');
                    repsEl.style.fontSize = '16px';
                    repsEl.style.marginBottom = '4px';
                    repsEl.textContent = `Reps: ${exercise.reps}`;
                    detailsContainer.appendChild(repsEl);
                }
                
                // Weight adjustment (only if no timer and has weight)
                if (!exercise.timerSeconds && exercise.weight) {
                    const currentWeight = adjustedWeights.get(exercise.id) || exercise.weight;
                    
                    if (currentWeight.toLowerCase() === 'bodyweight') {
                        // Show bodyweight indicator
                        const bodyweightEl = document.createElement('div');
                        bodyweightEl.style.padding = '12px';
                        bodyweightEl.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 204, 255, 0.1))';
                        bodyweightEl.style.borderRadius = 'var(--border-radius-sm)';
                        bodyweightEl.style.border = '2px solid var(--color-accent-primary)';
                        bodyweightEl.style.textAlign = 'center';
                        bodyweightEl.style.margin = 'var(--spacing-sm) 0';
                        bodyweightEl.innerHTML = '<span style="font-size: 18px; font-weight: 700; color: var(--color-accent-primary);">💪 BODYWEIGHT EXERCISE</span>';
                        detailsContainer.appendChild(bodyweightEl);
                    } else {
                        const weightComp = createWeightAdjustment(currentWeight, (newWeight) => {
                            adjustedWeights.set(exercise.id, newWeight);
                        });
                        detailsContainer.appendChild(weightComp.element);
                    }
                }
                
                if (exercise.notes) {
                    const notesEl = document.createElement('div');
                    notesEl.style.fontSize = '14px';
                    notesEl.style.fontStyle = 'italic';
                    notesEl.style.color = 'var(--color-text-secondary)';
                    notesEl.style.marginTop = '8px';
                    notesEl.textContent = `Notes: ${exercise.notes}`;
                    detailsContainer.appendChild(notesEl);
                }
                
                itemContainer.appendChild(detailsContainer);
                
                // Timer section (if exercise has timer)
                if (exercise.timerSeconds) {
                    const currentTimerSeconds = adjustedTimers.get(exercise.id) || exercise.timerSeconds;
                    const currentRestSeconds = adjustedRestTimers.get(exercise.id) || exercise.restTimerSeconds || 0;
                    const timerComp = createTimer(currentTimerSeconds, currentRestSeconds, () => {
                        checkbox.click(); // Auto-complete on timer finish
                    });
                    timers.set(exercise.id, timerComp);
                    
                    // Update adjusted timer values on any change
                    const originalGetValue = timerComp.getValue;
                    const originalGetRestValue = timerComp.getRestValue;
                    timerComp.getValue = () => {
                        const value = originalGetValue();
                        adjustedTimers.set(exercise.id, value);
                        return value;
                    };
                    timerComp.getRestValue = () => {
                        const value = originalGetRestValue();
                        adjustedRestTimers.set(exercise.id, value);
                        return value;
                    };
                    
                    itemContainer.appendChild(timerComp.element);
                }
                
                // Expandable details section
                const expandBtn = createButton('▼ SHOW DETAILS', 'btn-small btn-secondary', null);
                expandBtn.style.width = '100%';
                expandBtn.style.marginTop = 'var(--spacing-sm)';
                
                const expandableSection = document.createElement('div');
                expandableSection.className = 'hidden';
                expandableSection.style.marginTop = 'var(--spacing-md)';
                
                // Exercise image
                if (exercise.imagePath) {
                    const img = document.createElement('img');
                    img.src = exercise.imagePath;
                    img.style.width = '100%';
                    img.style.maxWidth = '400px';
                    img.style.height = '200px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = 'var(--border-radius-sm)';
                    img.style.display = 'block';
                    img.style.margin = '0 auto var(--spacing-md)';
                    expandableSection.appendChild(img);
                }
                
                // Video embed
                if (exercise.videoLink) {
                    const videoContainer = document.createElement('div');
                    videoContainer.style.position = 'relative';
                    videoContainer.style.paddingBottom = '56.25%'; // 16:9 aspect ratio
                    videoContainer.style.height = '0';
                    videoContainer.style.overflow = 'hidden';
                    videoContainer.style.maxWidth = '100%';
                    videoContainer.style.marginBottom = 'var(--spacing-md)';
                    videoContainer.style.borderRadius = 'var(--border-radius-sm)';
                    videoContainer.style.background = '#000';
                    
                    // Convert YouTube URL to embed format
                    let embedUrl = exercise.videoLink;
                    if (embedUrl.includes('youtube.com/watch')) {
                        const videoId = new URL(embedUrl).searchParams.get('v');
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    } else if (embedUrl.includes('youtu.be/')) {
                        const videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    } else if (embedUrl.includes('vimeo.com/')) {
                        const videoId = embedUrl.split('vimeo.com/')[1].split('?')[0];
                        embedUrl = `https://player.vimeo.com/video/${videoId}`;
                    }
                    
                    const iframe = document.createElement('iframe');
                    iframe.src = embedUrl;
                    iframe.style.position = 'absolute';
                    iframe.style.top = '0';
                    iframe.style.left = '0';
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.border = 'none';
                    iframe.setAttribute('allowfullscreen', '');
                    iframe.setAttribute('loading', 'lazy');
                    
                    videoContainer.appendChild(iframe);
                    expandableSection.appendChild(videoContainer);
                }
                
                // Workout notes input
                const notesLabel = document.createElement('label');
                notesLabel.className = 'form-label';
                notesLabel.textContent = 'Workout Notes';
                expandableSection.appendChild(notesLabel);
                
                const notesInput = document.createElement('textarea');
                notesInput.className = 'form-input';
                notesInput.placeholder = 'Add notes for this exercise...';
                notesInput.value = workoutNotes.get(exercise.id) || '';
                notesInput.oninput = () => {
                    workoutNotes.set(exercise.id, notesInput.value);
                };
                expandableSection.appendChild(notesInput);
                
                expandBtn.onclick = () => {
                    if (expandableSection.classList.contains('hidden')) {
                        expandableSection.classList.remove('hidden');
                        expandBtn.textContent = '▲ HIDE DETAILS';
                    } else {
                        expandableSection.classList.add('hidden');
                        expandBtn.textContent = '▼ SHOW DETAILS';
                    }
                };
                
                itemContainer.appendChild(expandBtn);
                itemContainer.appendChild(expandableSection);
                
                card.appendChild(itemContainer);
                listContainer.appendChild(card);
            }
        }
        
        await renderExercises();
        
        // Bottom buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'flex flex-column gap-md mt-lg';
        
        // Add random exercise button (only for category workouts)
        if (categoryId) {
            const addRandomBtn = createButton('➕ ADD RANDOM EXERCISE', 'btn-secondary', async () => {
                const category = await db.getCategory(categoryId);
                const allExercises = await db.getCategoryExercises(categoryId);
                const currentIds = new Set(exercises.map(e => e.id));
                const available = allExercises.filter(e => !currentIds.has(e.id));
                
                if (available.length === 0) {
                    showToast('All exercises from this category are already in the workout', 'warning');
                    return;
                }
                
                // Prioritize exercises not used recently
                available.sort((a, b) => a.lastUsedDate - b.lastUsedDate);
                const newExercise = available[0];
                
                exercises.push(newExercise);
                showToast(`Added: ${newExercise.name}`, 'success');
                await renderExercises();
                
                // Scroll to bottom
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            });
            buttonsContainer.appendChild(addRandomBtn);
        }
        
        // Complete workout button
        const completeBtn = createButton('COMPLETE WORKOUT', 'btn-large btn-primary', async () => {
            // Stop all timers
            timers.forEach(timer => timer.stop());
            
            const duration = Math.floor((Date.now() - startTime) / 1000 / 60);
            
            // Create workout session
            const sessionId = await db.addWorkoutSession({
                date: Date.now(),
                categoryId: categoryId || null,
                categoryName: categoryName,
                duration: duration,
                completedCount: completedSet.size,
                totalCount: exercises.length,
                isDeloadWeek: isDeload
            });
            
            // If was deload week, update last deload date
            if (isDeload) {
                await db.setSetting('lastDeloadDate', Date.now());
            }
            
            // Save exercise records and history
            for (const exercise of exercises) {
                const completed = completedSet.has(exercise.id);
                const finalWeight = adjustedWeights.get(exercise.id) || exercise.weight;
                
                // Get adjusted timer values properly
                const timer = timers.get(exercise.id);
                const finalTimer = timer ? timer.getValue() : exercise.timerSeconds;
                const finalRestTimer = timer ? timer.getRestValue() : (exercise.restTimerSeconds || 0);
                
                const notes = workoutNotes.get(exercise.id) || '';
                
                // Add workout record
                await db.addWorkoutExerciseRecord({
                    workoutSessionId: sessionId,
                    exerciseName: exercise.name,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    weight: finalWeight,
                    notes: exercise.notes,
                    timerSeconds: finalTimer,
                    completed: completed,
                    workoutNotes: notes
                });
                
                // Add to exercise history
                await db.addExerciseHistory({
                    exerciseId: exercise.id,
                    exerciseName: exercise.name,
                    date: Date.now(),
                    weight: finalWeight,
                    reps: exercise.reps,
                    sets: exercise.sets,
                    timerSeconds: finalTimer,
                    notes: notes,
                    personalRecord: false,
                    completed: completed
                });
                
                // Update exercise
                if (completed) {
                    exercise.lastUsedDate = Date.now();
                    exercise.workoutsSinceLastUse = 0;
                    exercise.weight = finalWeight; // Save adjusted weight
                    exercise.timerSeconds = finalTimer; // Save adjusted timer
                    exercise.restTimerSeconds = finalRestTimer; // Save adjusted rest timer
                    await db.updateExercise(exercise);
                }
            }
            
            // Update workoutsSinceLastUse for non-used exercises in category
            if (categoryId) {
                const allExercises = await db.getCategoryExercises(categoryId);
                const usedIds = new Set(exercises.map(e => e.id));
                for (const ex of allExercises) {
                    if (!usedIds.has(ex.id)) {
                        ex.workoutsSinceLastUse++;
                        await db.updateExercise(ex);
                    }
                }
            }
            
            showToast(`Workout complete! Duration: ${duration} minutes`, 'success');
            router.navigate('home');
        });
        buttonsContainer.appendChild(completeBtn);
        
        content.appendChild(buttonsContainer);
        container.appendChild(content);
    },

    // Manage Exercises Screen
    async renderManageExercises() {
        const container = document.getElementById('app');
        container.innerHTML = '';
        
        const header = createHeader('MANAGE EXERCISES', true);
        container.appendChild(header);
        
        const content = document.createElement('div');
        content.className = 'content-container';
        
        // Add button
        const addBtnContainer = document.createElement('div');
        addBtnContainer.className = 'flex flex-between mb-lg';
        addBtnContainer.style.alignItems = 'center';
        
        const titleEl = document.createElement('h2');
        titleEl.textContent = 'ALL EXERCISES';
        titleEl.style.margin = '0';
        
        const addBtn = createButton('+', 'btn-icon btn-primary', () => {
            router.navigate('add-edit-exercise', { id: null });
        });
        
        addBtnContainer.appendChild(titleEl);
        addBtnContainer.appendChild(addBtn);
        content.appendChild(addBtnContainer);
        
        // Search and filter
        let allExercises = await db.getAllExercises();
        let filteredExercises = [...allExercises];
        let selectedCategoryId = null;
        
        const searchBar = createSearchBar('Search exercises...', (query) => {
            filterExercises(query, selectedCategoryId);
        });
        content.appendChild(searchBar);
        
        // Category filter
        const filterContainer = document.createElement('div');
        filterContainer.className = 'form-group';
        
        const filterLabel = document.createElement('label');
        filterLabel.className = 'form-label';
        filterLabel.textContent = 'Filter by Category';
        
        const filterSelect = document.createElement('select');
        filterSelect.className = 'form-input';
        
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'All Categories';
        filterSelect.appendChild(allOption);
        
        const categories = await db.getAllCategories();
        for (const cat of categories) {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            filterSelect.appendChild(option);
        }
        
        filterSelect.onchange = (e) => {
            selectedCategoryId = e.target.value ? parseInt(e.target.value) : null;
            filterExercises(searchBar.querySelector('input').value, selectedCategoryId);
        };
        
        filterContainer.appendChild(filterLabel);
        filterContainer.appendChild(filterSelect);
        content.appendChild(filterContainer);
        
        const listContainer = document.createElement('div');
        content.appendChild(listContainer);
        
        async function filterExercises(query, catId) {
            const lowerQuery = query.toLowerCase();
            filteredExercises = allExercises.filter(exercise => {
                const nameMatch = !query || exercise.name.toLowerCase().includes(lowerQuery);
                const notesMatch = !query || (exercise.notes && exercise.notes.toLowerCase().includes(lowerQuery));
                const textMatch = nameMatch || notesMatch;
                
                if (!catId) return textMatch;
                
                // Check if exercise has this category - need to do this sync
                return textMatch;
            });
            
            // Additional category filtering
            if (catId) {
                const filtered = [];
                for (const exercise of filteredExercises) {
                    const cats = await db.getExerciseCategories(exercise.id);
                    if (cats.some(c => c.id === catId)) {
                        filtered.push(exercise);
                    }
                }
                filteredExercises = filtered;
            }
            
            await renderExercises();
        }
        
        async function renderExercises() {
            listContainer.innerHTML = '';
            
            if (filteredExercises.length === 0) {
                listContainer.appendChild(createEmptyState('🏋️', 'No exercises found'));
                return;
            }
            
            for (const exercise of filteredExercises) {
                const card = createCard('');
                
                const itemContainer = document.createElement('div');
                itemContainer.className = 'exercise-item';
                
                const details = document.createElement('div');
                details.className = 'exercise-details';
                
                const name = document.createElement('div');
                name.className = 'exercise-name';
                name.textContent = exercise.name;
                
                const categories = await db.getExerciseCategories(exercise.id);
                const categoriesEl = document.createElement('div');
                categoriesEl.className = 'exercise-meta';
                categoriesEl.style.display = 'flex';
                categoriesEl.style.gap = '4px';
                categoriesEl.style.flexWrap = 'wrap';
                categories.forEach(cat => {
                    categoriesEl.appendChild(createCategoryBadge(cat));
                });
                
                const meta = document.createElement('div');
                meta.className = 'exercise-meta';
                if (exercise.lastUsedDate) {
                    meta.textContent = `Last: ${formatDate(exercise.lastUsedDate)}`;
                }
                
                const stats = document.createElement('div');
                stats.className = 'exercise-stats';
                const statsParts = [];
                if (exercise.sets) statsParts.push(`${exercise.sets} sets`);
                if (exercise.reps) statsParts.push(`${exercise.reps} reps`);
                if (exercise.weight) statsParts.push(exercise.weight);
                stats.textContent = statsParts.join(' × ');
                
                details.appendChild(name);
                details.appendChild(categoriesEl);
                if (exercise.lastUsedDate) details.appendChild(meta);
                if (statsParts.length > 0) details.appendChild(stats);
                
                if (exercise.notes) {
                    const notes = document.createElement('div');
                    notes.style.fontSize = '12px';
                    notes.style.fontStyle = 'italic';
                    notes.style.color = 'var(--color-text-tertiary)';
                    notes.style.marginTop = '4px';
                    notes.textContent = exercise.notes.substring(0, 100) + (exercise.notes.length > 100 ? '...' : '');
                    details.appendChild(notes);
                }
                
                const actions = document.createElement('div');
                actions.className = 'exercise-actions';
                
                const progressBtn = createButton('📊', 'btn-icon btn-primary', () => {
                    router.navigate('exercise-progress', { id: exercise.id });
                });
                
                const editBtn = createButton('✏️', 'btn-icon btn-secondary', () => {
                    router.navigate('add-edit-exercise', { id: exercise.id });
                });
                
                const deleteBtn = createButton('🗑️', 'btn-icon btn-danger', async () => {
                    const confirmed = await confirm(
                        'Delete Exercise?',
                        `Are you sure you want to delete '${exercise.name}'? This action cannot be undone.`
                    );
                    if (confirmed) {
                        await db.deleteExercise(exercise.id);
                        allExercises = await db.getAllExercises();
                        await filterExercises(searchBar.querySelector('input').value, selectedCategoryId);
                        showToast('Exercise deleted', 'success');
                    }
                });
                
                actions.appendChild(progressBtn);
                actions.appendChild(editBtn);
                actions.appendChild(deleteBtn);
                
                itemContainer.appendChild(details);
                itemContainer.appendChild(actions);
                
                card.appendChild(itemContainer);
                listContainer.appendChild(card);
            }
        }
        
        await renderExercises();
        container.appendChild(content);
    },

    // Add/Edit Exercise Screen
    async renderAddEditExercise(params) {
        const { id } = params;
        const isEdit = !!id;
        let exercise = null;
        
        if (isEdit) {
            exercise = await db.getExercise(id);
            if (!exercise) {
                showToast('Exercise not found', 'error');
                router.back();
                return;
            }
        }
        
        const container = document.getElementById('app');
        container.innerHTML = '';
        
        const header = createHeader(isEdit ? 'EDIT EXERCISE' : 'ADD EXERCISE', true);
        container.appendChild(header);
        
        const content = document.createElement('div');
        content.className = 'content-container';
        
        // Form inputs
        const nameInput = createFormInput('Exercise Name *', 'text', 'Exercise name', exercise?.name || '');
        content.appendChild(nameInput.group);
        
        const setsInput = createFormInput('Sets', 'text', 'e.g., 3', exercise?.sets || '');
        content.appendChild(setsInput.group);
        
        const repsInput = createFormInput('Reps', 'text', 'e.g., 10', exercise?.reps || '');
        content.appendChild(repsInput.group);
        
        const weightInput = createFormInput('Weight', 'text', 'e.g., 135 lbs', exercise?.weight || '');
        content.appendChild(weightInput.group);
        
        // Bodyweight checkbox
        const bodyweightContainer = document.createElement('div');
        bodyweightContainer.className = 'checkbox-container';
        bodyweightContainer.style.marginTop = '-8px';
        bodyweightContainer.style.marginBottom = 'var(--spacing-md)';
        
        const bodyweightCheckbox = createCheckbox(exercise?.weight === 'bodyweight', (checked) => {
            if (checked) {
                weightInput.input.value = 'bodyweight';
                weightInput.input.disabled = true;
                weightInput.input.style.opacity = '0.5';
            } else {
                weightInput.input.value = '';
                weightInput.input.disabled = false;
                weightInput.input.style.opacity = '1';
            }
        });
        
        const bodyweightLabel = document.createElement('span');
        bodyweightLabel.textContent = 'Use Bodyweight';
        bodyweightLabel.style.fontWeight = '600';
        
        bodyweightContainer.appendChild(bodyweightCheckbox);
        bodyweightContainer.appendChild(bodyweightLabel);
        bodyweightContainer.onclick = () => bodyweightCheckbox.click();
        content.appendChild(bodyweightContainer);
        
        // If already bodyweight, disable weight input
        if (exercise?.weight === 'bodyweight') {
            weightInput.input.disabled = true;
            weightInput.input.style.opacity = '0.5';
        }
        
        const timerInput = createFormInput('Timer (seconds)', 'number', 'e.g., 30', exercise?.timerSeconds || '');
        content.appendChild(timerInput.group);
        
        const restTimerInput = createFormInput('Rest Timer (seconds)', 'number', 'e.g., 30 (rest between sets)', exercise?.restTimerSeconds || '');
        const restDesc = document.createElement('div');
        restDesc.style.fontSize = '12px';
        restDesc.style.color = 'var(--color-text-tertiary)';
        restDesc.style.marginTop = '-8px';
        restDesc.style.marginBottom = 'var(--spacing-md)';
        restDesc.textContent = 'Optional: Countdown timer for rest between sets';
        content.appendChild(restTimerInput.group);
        content.appendChild(restDesc);
        
        const progressionInput = createFormInput('Progression Threshold', 'number', 'e.g., 3', exercise?.progressionThreshold || '3');
        const progressionDesc = document.createElement('div');
        progressionDesc.style.fontSize = '12px';
        progressionDesc.style.color = 'var(--color-text-tertiary)';
        progressionDesc.style.marginTop = '-8px';
        progressionDesc.style.marginBottom = 'var(--spacing-md)';
        progressionDesc.textContent = 'How many consecutive completions before suggesting progression';
        content.appendChild(progressionInput.group);
        content.appendChild(progressionDesc);
        
        const incrementInput = createFormInput('Progression Increment', 'number', 'e.g., 5', exercise?.progressionIncrement || '5');
        const incrementDesc = document.createElement('div');
        incrementDesc.style.fontSize = '12px';
        incrementDesc.style.color = 'var(--color-text-tertiary)';
        incrementDesc.style.marginTop = '-8px';
        incrementDesc.style.marginBottom = 'var(--spacing-md)';
        incrementDesc.textContent = 'Amount to increase (lbs, kg, or seconds for timed exercises)';
        content.appendChild(incrementInput.group);
        content.appendChild(incrementDesc);
        
        const notesInput = createFormInput('Notes', 'textarea', 'Notes about this exercise', exercise?.notes || '');
        content.appendChild(notesInput.group);
        
        // Video link
        const videoLinkInput = createFormInput('Video Link', 'text', 'YouTube or other video URL', exercise?.videoLink || '');
        const videoDesc = document.createElement('div');
        videoDesc.style.fontSize = '12px';
        videoDesc.style.color = 'var(--color-text-tertiary)';
        videoDesc.style.marginTop = '-8px';
        videoDesc.style.marginBottom = 'var(--spacing-md)';
        videoDesc.textContent = 'Optional: Link to form demo video (YouTube, Vimeo, etc.)';
        content.appendChild(videoLinkInput.group);
        content.appendChild(videoDesc);
        
        // Categories
        const categoriesLabel = document.createElement('label');
        categoriesLabel.className = 'form-label';
        categoriesLabel.textContent = 'Categories';
        content.appendChild(categoriesLabel);
        
        const categories = await db.getAllCategories();
        const selectedCategories = isEdit ? await db.getExerciseCategories(id) : [];
        const selectedCategoryIds = new Set(selectedCategories.map(c => c.id));
        
        const categoriesContainer = document.createElement('div');
        categoriesContainer.style.marginBottom = 'var(--spacing-md)';
        
        const categoryCheckboxes = [];
        for (const category of categories) {
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-container';
            
            const checkbox = createCheckbox(selectedCategoryIds.has(category.id));
            categoryCheckboxes.push({ checkbox, categoryId: category.id });
            
            const label = document.createElement('span');
            label.textContent = category.name;
            label.style.color = category.color;
            label.style.fontWeight = '600';
            
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            checkboxContainer.onclick = () => checkbox.click();
            
            categoriesContainer.appendChild(checkboxContainer);
        }
        content.appendChild(categoriesContainer);
        
        // Image section
        let selectedImage = exercise?.imagePath || null;
        
        const imageLabel = document.createElement('label');
        imageLabel.className = 'form-label';
        imageLabel.textContent = 'Exercise Image';
        content.appendChild(imageLabel);
        
        const imagePreview = document.createElement('img');
        imagePreview.style.width = '100%';
        imagePreview.style.maxWidth = '400px';
        imagePreview.style.height = '200px';
        imagePreview.style.objectFit = 'cover';
        imagePreview.style.borderRadius = 'var(--border-radius-sm)';
        imagePreview.style.display = 'block';
        imagePreview.style.margin = '0 auto var(--spacing-md)';
        imagePreview.style.background = 'rgba(255, 255, 255, 0.05)';
        
        if (selectedImage) {
            imagePreview.src = selectedImage;
        } else {
            imagePreview.style.display = 'none';
        }
        content.appendChild(imagePreview);
        
        const imageButtonsContainer = document.createElement('div');
        imageButtonsContainer.className = 'flex gap-sm mb-lg';
        imageButtonsContainer.style.flexWrap = 'wrap';
        
        const selectImageBtn = createButton('📁 GALLERY', 'btn-secondary', async () => {
            const image = await selectImage();
            if (image) {
                selectedImage = image;
                imagePreview.src = image;
                imagePreview.style.display = 'block';
            }
        });
        selectImageBtn.style.flex = '1';
        selectImageBtn.style.minWidth = '120px';
        
        const takePhotoBtn = createButton('📷 CAMERA', 'btn-secondary', async () => {
            const image = await takePhoto();
            if (image) {
                selectedImage = image;
                imagePreview.src = image;
                imagePreview.style.display = 'block';
            }
        });
        takePhotoBtn.style.flex = '1';
        takePhotoBtn.style.minWidth = '120px';
        
        const removeImageBtn = createButton('🗑️ REMOVE', 'btn-danger', () => {
            selectedImage = null;
            imagePreview.style.display = 'none';
        });
        removeImageBtn.style.flex = '1';
        removeImageBtn.style.minWidth = '120px';
        
        imageButtonsContainer.appendChild(selectImageBtn);
        imageButtonsContainer.appendChild(takePhotoBtn);
        imageButtonsContainer.appendChild(removeImageBtn);
        content.appendChild(imageButtonsContainer);
        
        // Save button
        const saveBtn = createButton('SAVE', 'btn-large btn-primary', async () => {
            const name = nameInput.input.value.trim();
            
            if (!name) {
                showToast('Please enter an exercise name', 'warning');
                return;
            }
            
            const exerciseData = {
                name: name,
                sets: setsInput.input.value.trim(),
                reps: repsInput.input.value.trim(),
                weight: weightInput.input.value.trim(),
                notes: notesInput.input.value.trim(),
                videoLink: videoLinkInput.input.value.trim(),
                timerSeconds: parseInt(timerInput.input.value) || 0,
                restTimerSeconds: parseInt(restTimerInput.input.value) || 0,
                progressionThreshold: parseInt(progressionInput.input.value) || 3,
                progressionIncrement: parseInt(incrementInput.input.value) || 5,
                imagePath: selectedImage || ''
            };
            
            if (isEdit) {
                exerciseData.id = id;
                exerciseData.lastUsedDate = exercise.lastUsedDate;
                exerciseData.workoutsSinceLastUse = exercise.workoutsSinceLastUse;
                await db.updateExercise(exerciseData);
            } else {
                exerciseData.lastUsedDate = 0;
                exerciseData.workoutsSinceLastUse = 0;
                const newId = await db.addExercise(exerciseData);
                exerciseData.id = newId;
            }
            
            // Update categories
            const selectedCatIds = categoryCheckboxes
                .filter(item => item.checkbox.classList.contains('checked'))
                .map(item => item.categoryId);
            
            await db.setExerciseCategories(exerciseData.id, selectedCatIds);
            
            showToast(isEdit ? 'Exercise updated' : 'Exercise added', 'success');
            router.back();
        });
        content.appendChild(saveBtn);
        
        container.appendChild(content);
    },

    // Setup & Settings Screen
    async renderSetup() {
        const container = document.getElementById('app');
        container.innerHTML = '';
        
        const header = createHeader('SETUP & SETTINGS', true);
        container.appendChild(header);
        
        const content = document.createElement('div');
        content.className = 'content-container';
        
        // Categories section
        const categoriesHeader = document.createElement('div');
        categoriesHeader.className = 'flex flex-between mb-md';
        categoriesHeader.style.alignItems = 'center';
        
        const categoriesTitle = document.createElement('h3');
        categoriesTitle.textContent = 'CATEGORIES';
        
        const addCatBtn = createButton('+', 'btn-icon btn-primary', () => {
            router.navigate('add-edit-category', { id: null });
        });
        
        categoriesHeader.appendChild(categoriesTitle);
        categoriesHeader.appendChild(addCatBtn);
        content.appendChild(categoriesHeader);
        
        const categoriesContainer = document.createElement('div');
        categoriesContainer.style.marginBottom = 'var(--spacing-xl)';
        content.appendChild(categoriesContainer);
        
        async function renderCategories() {
            categoriesContainer.innerHTML = '';
            const categories = await db.getAllCategories();
            
            if (categories.length === 0) {
                categoriesContainer.appendChild(createEmptyState('📁', 'No categories yet'));
                return;
            }
            
            for (const category of categories) {
                const card = createCard('');
                card.style.borderLeft = `8px solid ${category.color}`;
                
                const itemContainer = document.createElement('div');
                itemContainer.className = 'flex flex-between';
                itemContainer.style.alignItems = 'center';
                
                const details = document.createElement('div');
                details.style.flex = '1';
                
                const name = document.createElement('div');
                name.style.fontSize = '18px';
                name.style.fontWeight = '700';
                name.textContent = category.name;
                
                const info = document.createElement('div');
                info.style.fontSize = '14px';
                info.style.color = 'var(--color-text-secondary)';
                info.textContent = `Rotation: every ${category.rotationFrequency} workouts | ${category.exercisesPerWorkout} per workout`;
                
                details.appendChild(name);
                details.appendChild(info);
                
                const actions = document.createElement('div');
                actions.className = 'flex gap-sm';
                
                const editBtn = createButton('✏️', 'btn-icon btn-secondary', () => {
                    router.navigate('add-edit-category', { id: category.id });
                });
                
                const deleteBtn = createButton('🗑️', 'btn-icon btn-danger', async () => {
                    // Check if category has exercises
                    const exercises = await db.getCategoryExercises(category.id);
                    if (exercises.length > 0) {
                        await showModal(
                            'Cannot Delete Category',
                            'This category has exercises assigned to it. Please remove or reassign the exercises before deleting.',
                            [{ text: 'OK', value: true, class: 'btn-primary' }]
                        );
                        return;
                    }
                    
                    const confirmed = await confirm(
                        'Delete Category?',
                        `Are you sure you want to delete '${category.name}'?`
                    );
                    if (confirmed) {
                        await db.deleteCategory(category.id);
                        await renderCategories();
                        showToast('Category deleted', 'success');
                    }
                });
                
                actions.appendChild(editBtn);
                actions.appendChild(deleteBtn);
                
                itemContainer.appendChild(details);
                itemContainer.appendChild(actions);
                
                card.appendChild(itemContainer);
                categoriesContainer.appendChild(card);
            }
        }
        
        await renderCategories();
        
        // Divider
        const divider1 = document.createElement('div');
        divider1.style.height = '2px';
        divider1.style.background = 'rgba(255, 255, 255, 0.1)';
        divider1.style.margin = 'var(--spacing-xl) 0';
        content.appendChild(divider1);
        
        // Backup & Restore button
        const backupBtn = createButton('BACKUP & RESTORE', 'btn-large btn-purple', () => {
            router.navigate('import-export');
        });
        content.appendChild(backupBtn);
        
        // Divider
        const divider2 = document.createElement('div');
        divider2.style.height = '2px';
        divider2.style.background = 'rgba(255, 255, 255, 0.1)';
        divider2.style.margin = 'var(--spacing-xl) 0';
        content.appendChild(divider2);
        
        // Deload Settings
        const deloadTitle = document.createElement('h3');
        deloadTitle.textContent = 'DELOAD SCHEDULE';
        deloadTitle.style.marginBottom = 'var(--spacing-md)';
        content.appendChild(deloadTitle);
        
        const deloadCard = createCard('');
        const deloadContent = document.createElement('div');
        
        // Current setting
        const currentDeload = await db.getSetting('deloadWeeks', 0);
        const lastDeload = await db.getSetting('lastDeloadDate', 0);
        
        const deloadLabel = document.createElement('label');
        deloadLabel.className = 'form-label';
        deloadLabel.textContent = 'Deload Every (weeks)';
        deloadContent.appendChild(deloadLabel);
        
        const deloadInput = createFormInput('', 'number', '0 = deload now', currentDeload || '0');
        deloadInput.input.min = '0';
        deloadInput.input.max = '12';
        deloadContent.appendChild(deloadInput.group);
        
        const deloadDesc = document.createElement('div');
        deloadDesc.style.fontSize = '13px';
        deloadDesc.style.color = 'var(--color-text-secondary)';
        deloadDesc.style.marginBottom = 'var(--spacing-md)';
        deloadDesc.textContent = 'Set to 0 to make next workout a deload. Set to 1-12 to auto-deload every X weeks. Deload weeks reduce all weights by 50% for recovery.';
        deloadContent.appendChild(deloadDesc);
        
        // Status display
        if (lastDeload > 0 && currentDeload > 0) {
            const weeks = weeksBetween(lastDeload, Date.now());
            const nextDeload = currentDeload - weeks;
            
            const statusText = document.createElement('div');
            statusText.style.fontSize = '14px';
            statusText.style.padding = '12px';
            statusText.style.background = 'rgba(0, 255, 136, 0.1)';
            statusText.style.borderRadius = 'var(--border-radius-sm)';
            statusText.style.marginBottom = 'var(--spacing-md)';
            
            if (weeks >= currentDeload) {
                statusText.innerHTML = `<strong style="color: var(--color-accent-warning);">🔄 Next workout will be a DELOAD WEEK!</strong>`;
            } else {
                statusText.innerHTML = `Last deload: ${weeks} week${weeks !== 1 ? 's' : ''} ago<br>Next deload: in ${nextDeload} week${nextDeload !== 1 ? 's' : ''}`;
            }
            deloadContent.appendChild(statusText);
        }
        
        // Deload percentage picker
        const currentDeloadPercent = await db.getSetting('deloadPercent', 50);
        const deloadPercentPicker = createNumberPicker(
            'Deload Percentage',
            10,
            90,
            currentDeloadPercent,
            null
        );
        deloadContent.appendChild(deloadPercentPicker.container);
        
        const percentDesc = document.createElement('div');
        percentDesc.style.fontSize = '13px';
        percentDesc.style.color = 'var(--color-text-secondary)';
        percentDesc.style.marginTop = '-8px';
        percentDesc.style.marginBottom = 'var(--spacing-md)';
        percentDesc.textContent = 'How much to reduce weights during deload (50% is typical)';
        deloadContent.appendChild(percentDesc);
        
        // Save button
        const saveDeloadBtn = createButton('SAVE DELOAD SETTINGS', 'btn-secondary', async () => {
            const weeks = parseInt(deloadInput.input.value) || 0;
            const percent = deloadPercentPicker.getValue();
            await db.setSetting('deloadWeeks', weeks);
            await db.setSetting('deloadPercent', percent);
            
            if (weeks > 0 && lastDeload === 0) {
                await db.setSetting('lastDeloadDate', Date.now());
            }
            
            showToast('Deload settings saved', 'success');
            router.navigate('setup'); // Refresh to show status
        });
        deloadContent.appendChild(saveDeloadBtn);
        
        deloadCard.appendChild(deloadContent);
        content.appendChild(deloadCard);
        
        // Divider
        const divider3 = document.createElement('div');
        divider3.style.height = '2px';
        divider3.style.background = 'rgba(255, 255, 255, 0.1)';
        divider3.style.margin = 'var(--spacing-xl) 0';
        content.appendChild(divider3);
        
        // Theme Settings
        const themeTitle = document.createElement('h3');
        themeTitle.textContent = 'APPEARANCE';
        themeTitle.style.marginBottom = 'var(--spacing-md)';
        content.appendChild(themeTitle);
        
        const themeCard = createCard('');
        const themeContent = document.createElement('div');
        
        // Get current theme
        const currentTheme = await db.getSetting('theme', 'dark');
        
        const themeLabel = document.createElement('label');
        themeLabel.className = 'form-label';
        themeLabel.textContent = 'Color Theme';
        themeContent.appendChild(themeLabel);
        
        // Theme options
        const themeOptions = document.createElement('div');
        themeOptions.style.display = 'flex';
        themeOptions.style.gap = 'var(--spacing-sm)';
        themeOptions.style.marginBottom = 'var(--spacing-md)';
        
        const darkBtn = createButton('🌙 Dark', currentTheme === 'dark' ? 'btn-primary' : 'btn-secondary', async () => {
            document.documentElement.setAttribute('data-theme', 'dark');
            await db.setSetting('theme', 'dark');
            showToast('Dark theme activated', 'success');
            router.navigate('setup'); // Refresh to update buttons
        });
        darkBtn.style.flex = '1';
        
        const lightBtn = createButton('☀️ Light', currentTheme === 'light' ? 'btn-primary' : 'btn-secondary', async () => {
            document.documentElement.setAttribute('data-theme', 'light');
            await db.setSetting('theme', 'light');
            showToast('Light theme activated', 'success');
            router.navigate('setup'); // Refresh to update buttons
        });
        lightBtn.style.flex = '1';
        
        themeOptions.appendChild(darkBtn);
        themeOptions.appendChild(lightBtn);
        themeContent.appendChild(themeOptions);
        
        themeCard.appendChild(themeContent);
        content.appendChild(themeCard);
        
        // Divider
        const divider4 = document.createElement('div');
        divider4.style.height = '2px';
        divider4.style.background = 'rgba(255, 255, 255, 0.1)';
        divider4.style.margin = 'var(--spacing-xl) 0';
        content.appendChild(divider4);
        
        // About section
        const aboutTitle = document.createElement('h3');
        aboutTitle.textContent = 'ABOUT';
        aboutTitle.style.marginBottom = 'var(--spacing-md)';
        content.appendChild(aboutTitle);
        
        const tipsText = document.createElement('div');
        tipsText.style.fontSize = '15px';
        tipsText.style.lineHeight = '1.8';
        tipsText.style.color = 'var(--color-text-secondary)';
        tipsText.innerHTML = `
            • Tap a category to edit settings<br>
            • Rotation Frequency: How often exercises appear<br>
            • Exercises Per Workout: How many to show<br>
            • Colors help distinguish categories
        `;
        content.appendChild(tipsText);
        
        container.appendChild(content);
    },

    // Add/Edit Category Screen
    async renderAddEditCategory(params) {
        const { id } = params;
        const isEdit = !!id;
        let category = null;
        
        if (isEdit) {
            category = await db.getCategory(id);
            if (!category) {
                showToast('Category not found', 'error');
                router.back();
                return;
            }
        }
        
        const container = document.getElementById('app');
        container.innerHTML = '';
        
        const header = createHeader(isEdit ? 'EDIT CATEGORY' : 'ADD CATEGORY', true);
        container.appendChild(header);
        
        const content = document.createElement('div');
        content.className = 'content-container';
        
        // Name input
        const nameInput = createFormInput('Category Name *', 'text', 'e.g., Upper Body', category?.name || '');
        content.appendChild(nameInput.group);
        
        // Random selection checkbox
        const randomCheckbox = document.createElement('div');
        randomCheckbox.style.marginBottom = 'var(--spacing-lg)';
        randomCheckbox.style.padding = 'var(--spacing-md)';
        randomCheckbox.style.background = 'var(--color-bg-card)';
        randomCheckbox.style.borderRadius = 'var(--border-radius)';
        randomCheckbox.style.border = '2px solid var(--color-bg-tertiary)';
        
        const randomLabel = document.createElement('label');
        randomLabel.style.display = 'flex';
        randomLabel.style.alignItems = 'center';
        randomLabel.style.gap = '12px';
        randomLabel.style.cursor = 'pointer';
        
        const randomInput = document.createElement('input');
        randomInput.type = 'checkbox';
        randomInput.checked = category?.isRandom !== false; // Default to true
        randomInput.style.width = '24px';
        randomInput.style.height = '24px';
        randomInput.style.cursor = 'pointer';
        
        const randomText = document.createElement('div');
        randomText.style.flex = '1';
        
        const randomTitle = document.createElement('div');
        randomTitle.style.fontWeight = '700';
        randomTitle.style.fontSize = '16px';
        randomTitle.textContent = 'Random Exercise Selection';
        
        const randomDesc = document.createElement('div');
        randomDesc.style.fontSize = '13px';
        randomDesc.style.color = 'var(--color-text-tertiary)';
        randomDesc.style.marginTop = '4px';
        randomDesc.textContent = 'If checked, exercises rotate automatically. If unchecked, you choose manually each workout.';
        
        randomText.appendChild(randomTitle);
        randomText.appendChild(randomDesc);
        randomLabel.appendChild(randomInput);
        randomLabel.appendChild(randomText);
        randomCheckbox.appendChild(randomLabel);
        content.appendChild(randomCheckbox);
        
        // Show/hide rotation settings based on random checkbox
        const updateRotationVisibility = () => {
            rotationPicker.container.style.display = randomInput.checked ? 'block' : 'none';
            rotationDesc.style.display = randomInput.checked ? 'block' : 'none';
            exercisesPicker.container.style.display = randomInput.checked ? 'block' : 'none';
            exercisesDesc.style.display = randomInput.checked ? 'block' : 'none';
        };
        
        randomInput.addEventListener('change', updateRotationVisibility);
        
        // Rotation frequency
        const rotationPicker = createNumberPicker(
            'Rotation Frequency',
            1,
            20,
            category?.rotationFrequency || 3,
            null
        );
        content.appendChild(rotationPicker.container);
        
        const rotationDesc = document.createElement('div');
        rotationDesc.style.fontSize = '14px';
        rotationDesc.style.color = 'var(--color-text-tertiary)';
        rotationDesc.style.marginTop = '-8px';
        rotationDesc.style.marginBottom = 'var(--spacing-md)';
        rotationDesc.textContent = 'An exercise will appear once every X workouts';
        content.appendChild(rotationDesc);
        
        // Exercises per workout
        const exercisesPicker = createNumberPicker(
            'Exercises Per Workout',
            1,
            20,
            category?.exercisesPerWorkout || 5,
            null
        );
        content.appendChild(exercisesPicker.container);
        
        const exercisesDesc = document.createElement('div');
        exercisesDesc.style.fontSize = '14px';
        exercisesDesc.style.color = 'var(--color-text-tertiary)';
        exercisesDesc.style.marginTop = '-8px';
        exercisesDesc.style.marginBottom = 'var(--spacing-md)';
        exercisesDesc.textContent = 'How many exercises to show in each workout';
        content.appendChild(exercisesDesc);
        
        // Initial visibility
        updateRotationVisibility();
        
        // Color picker
        const colorPicker = createColorPicker(category?.color || '#4CAF50', null);
        content.appendChild(colorPicker.container);
        
        // Save button
        const saveBtn = createButton('SAVE CATEGORY', 'btn-large btn-primary', async () => {
            const name = nameInput.input.value.trim();
            
            if (!name) {
                showToast('Please enter a category name', 'warning');
                return;
            }
            
            const categoryData = {
                name: name,
                isRandom: randomInput.checked,
                rotationFrequency: rotationPicker.getValue(),
                exercisesPerWorkout: exercisesPicker.getValue(),
                color: colorPicker.getValue()
            };
            
            if (isEdit) {
                categoryData.id = id;
                await db.updateCategory(categoryData);
            } else {
                await db.addCategory(categoryData);
            }
            
            showToast(isEdit ? 'Category updated' : 'Category added', 'success');
            router.back();
        });
        content.appendChild(saveBtn);
        
        container.appendChild(content);
    }
};

// Helper function to shade color
function shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

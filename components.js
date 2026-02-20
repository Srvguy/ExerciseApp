// Reusable UI Components

// Create header component
function createHeader(title, showBack = false) {
    const header = document.createElement('div');
    header.className = 'app-header';
    
    const content = document.createElement('div');
    content.className = 'header-content';
    
    if (showBack) {
        const backBtn = document.createElement('button');
        backBtn.className = 'back-button';
        backBtn.textContent = '← BACK';
        backBtn.onclick = () => router.back();
        content.appendChild(backBtn);
    }
    
    const titleEl = document.createElement('h1');
    titleEl.className = 'app-title';
    titleEl.textContent = title;
    content.appendChild(titleEl);
    
    if (showBack) {
        const spacer = document.createElement('div');
        spacer.style.width = '80px';
        content.appendChild(spacer);
    }
    
    header.appendChild(content);
    return header;
}

// Create button component
function createButton(text, className, onclick) {
    const button = document.createElement('button');
    button.className = `btn ${className}`;
    button.textContent = text;
    button.onclick = onclick;
    return button;
}

// Create card component
function createCard(content) {
    const card = document.createElement('div');
    card.className = 'card';
    if (typeof content === 'string') {
        card.innerHTML = content;
    } else {
        card.appendChild(content);
    }
    return card;
}

// Create form input
function createFormInput(label, type, placeholder, value = '') {
    const group = document.createElement('div');
    group.className = 'form-group';
    
    const labelEl = document.createElement('label');
    labelEl.className = 'form-label';
    labelEl.textContent = label;
    
    const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
    input.className = 'form-input';
    if (type !== 'textarea') input.type = type;
    input.placeholder = placeholder;
    input.value = value;
    
    group.appendChild(labelEl);
    group.appendChild(input);
    
    return { group, input };
}

// Create search bar
function createSearchBar(placeholder, onSearch) {
    const container = document.createElement('div');
    container.className = 'search-bar';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-input search-input';
    input.placeholder = placeholder;
    input.oninput = debounce((e) => onSearch(e.target.value), 300);
    
    container.appendChild(input);
    return container;
}

// Create checkbox
function createCheckbox(checked = false, onChange = null) {
    const checkbox = document.createElement('div');
    checkbox.className = `checkbox ${checked ? 'checked' : ''}`;
    
    checkbox.onclick = () => {
        checkbox.classList.toggle('checked');
        if (onChange) {
            onChange(checkbox.classList.contains('checked'));
        }
    };
    
    return checkbox;
}

// Create category badge
function createCategoryBadge(category) {
    const badge = document.createElement('span');
    badge.className = 'category-badge';
    badge.textContent = category.name;
    badge.style.backgroundColor = category.color;
    badge.style.color = '#fff';
    return badge;
}

// Create timer component with optional rest timer
function createTimer(initialSeconds, restSeconds = 0, onComplete) {
    let timeLeft = initialSeconds;
    let restTimeLeft = restSeconds;
    let originalExerciseTime = initialSeconds;
    let originalRestTime = restSeconds;
    let intervalId = null;
    let isRunning = false;
    let isResting = false;
    
    const container = document.createElement('div');
    container.className = 'timer-section';
    
    const display = document.createElement('div');
    display.className = 'timer-display';
    display.textContent = formatTimer(timeLeft);
    
    const statusLabel = document.createElement('div');
    statusLabel.style.fontSize = '18px';
    statusLabel.style.fontWeight = '700';
    statusLabel.style.color = 'var(--color-accent-primary)';
    statusLabel.style.marginBottom = 'var(--spacing-sm)';
    statusLabel.textContent = 'EXERCISE TIMER';
    
    const controls = document.createElement('div');
    controls.className = 'timer-controls';
    
    const minusBtn = createButton('-5s', 'btn-small btn-danger', () => {
        if (!isRunning) {
            if (isResting && restSeconds > 0) {
                restTimeLeft = Math.max(5, restTimeLeft - 5);
                originalRestTime = restTimeLeft;
                display.textContent = formatTimer(restTimeLeft);
            } else {
                timeLeft = Math.max(5, timeLeft - 5);
                originalExerciseTime = timeLeft;
                display.textContent = formatTimer(timeLeft);
            }
        }
    });
    
    const startStopBtn = createButton('START', 'btn-primary', () => {
        if (isRunning) {
            clearInterval(intervalId);
            startStopBtn.textContent = 'RESUME';
            startStopBtn.className = 'btn btn-primary';
        } else {
            intervalId = setInterval(() => {
                if (isResting) {
                    restTimeLeft--;
                    display.textContent = formatTimer(restTimeLeft);
                    
                    // Beep last 3 seconds
                    if (restTimeLeft <= 3 && restTimeLeft > 0) {
                        playSound(800, 100);
                    }
                    
                    if (restTimeLeft <= 0) {
                        // Rest complete, cycle back to exercise
                        isResting = false;
                        restTimeLeft = originalRestTime;
                        timeLeft = originalExerciseTime;
                        statusLabel.textContent = 'EXERCISE TIMER';
                        statusLabel.style.color = 'var(--color-accent-primary)';
                        display.textContent = formatTimer(timeLeft);
                        display.style.color = 'var(--color-accent-danger)';
                        container.style.borderColor = 'rgba(255, 51, 102, 0.3)';
                        container.style.background = 'linear-gradient(135deg, rgba(255, 51, 102, 0.1), rgba(255, 170, 0, 0.1))';
                        playSound(1000, 300);
                        vibrate(300);
                        // Continue cycling - don't stop
                    }
                } else {
                    timeLeft--;
                    display.textContent = formatTimer(timeLeft);
                    
                    // Beep last 3 seconds
                    if (timeLeft <= 3 && timeLeft > 0) {
                        playSound(800, 100);
                    }
                    
                    if (timeLeft <= 0) {
                        if (restSeconds > 0) {
                            // Start rest timer
                            isResting = true;
                            restTimeLeft = originalRestTime;
                            display.textContent = formatTimer(restTimeLeft);
                            display.style.color = 'var(--color-accent-secondary)';
                            statusLabel.textContent = 'REST TIMER';
                            statusLabel.style.color = 'var(--color-accent-secondary)';
                            container.style.borderColor = 'rgba(0, 204, 255, 0.3)';
                            container.style.background = 'linear-gradient(135deg, rgba(0, 204, 255, 0.1), rgba(0, 255, 136, 0.1))';
                            playSound(600, 300);
                            vibrate(300);
                            // Continue cycling
                        } else {
                            // No rest timer, cycle back to exercise
                            timeLeft = originalExerciseTime;
                            display.textContent = formatTimer(timeLeft);
                            playSound(1000, 300);
                            vibrate(300);
                            if (onComplete) onComplete();
                            // Continue cycling
                        }
                    }
                }
            }, 1000);
            startStopBtn.textContent = 'STOP';
            startStopBtn.className = 'btn btn-danger';
        }
        isRunning = !isRunning;
    });
    
    const resetBtn = createButton('RESET', 'btn-small btn-warning', () => {
        clearInterval(intervalId);
        isRunning = false;
        isResting = false;
        timeLeft = originalExerciseTime;
        restTimeLeft = originalRestTime;
        display.textContent = formatTimer(timeLeft);
        display.style.color = 'var(--color-accent-danger)';
        statusLabel.textContent = 'EXERCISE TIMER';
        statusLabel.style.color = 'var(--color-accent-primary)';
        container.style.borderColor = 'rgba(255, 51, 102, 0.3)';
        container.style.background = 'linear-gradient(135deg, rgba(255, 51, 102, 0.1), rgba(255, 170, 0, 0.1))';
        startStopBtn.textContent = 'START';
        startStopBtn.className = 'btn btn-primary';
    });
    
    const plusBtn = createButton('+5s', 'btn-small btn-primary', () => {
        if (!isRunning) {
            if (isResting && restSeconds > 0) {
                restTimeLeft += 5;
                originalRestTime = restTimeLeft;
                display.textContent = formatTimer(restTimeLeft);
            } else {
                timeLeft += 5;
                originalExerciseTime = timeLeft;
                display.textContent = formatTimer(timeLeft);
            }
        }
    });
    
    container.appendChild(statusLabel);
    container.appendChild(display);
    controls.appendChild(minusBtn);
    controls.appendChild(startStopBtn);
    controls.appendChild(resetBtn);
    controls.appendChild(plusBtn);
    container.appendChild(controls);
    
    return {
        element: container,
        getValue: () => originalExerciseTime,
        getRestValue: () => originalRestTime,
        stop: () => {
            clearInterval(intervalId);
            isRunning = false;
        }
    };
}

// Create weight adjustment component
function createWeightAdjustment(initialWeight, onChange) {
    const container = document.createElement('div');
    container.className = 'weight-section';
    
    let currentWeight = initialWeight;
    
    const minusBtn = document.createElement('button');
    minusBtn.className = 'adjust-btn adjust-btn-minus';
    minusBtn.textContent = '-';
    minusBtn.onclick = () => {
        currentWeight = adjustWeight(currentWeight, -5);
        display.textContent = `Weight: ${currentWeight}`;
        if (onChange) onChange(currentWeight);
    };
    
    const display = document.createElement('div');
    display.className = 'weight-display';
    display.textContent = `Weight: ${currentWeight}`;
    
    const plusBtn = document.createElement('button');
    plusBtn.className = 'adjust-btn adjust-btn-plus';
    plusBtn.textContent = '+';
    plusBtn.onclick = () => {
        currentWeight = adjustWeight(currentWeight, 5);
        display.textContent = `Weight: ${currentWeight}`;
        if (onChange) onChange(currentWeight);
    };
    
    container.appendChild(minusBtn);
    container.appendChild(display);
    container.appendChild(plusBtn);
    
    return {
        element: container,
        getValue: () => currentWeight
    };
}

// Create number picker
function createNumberPicker(label, min, max, initialValue, onChange) {
    const container = document.createElement('div');
    container.className = 'form-group';
    
    const labelEl = document.createElement('label');
    labelEl.className = 'form-label';
    labelEl.textContent = label;
    
    const picker = document.createElement('div');
    picker.className = 'number-picker';
    
    let value = initialValue;
    
    const minusBtn = document.createElement('button');
    minusBtn.className = 'number-picker-btn';
    minusBtn.textContent = '-';
    minusBtn.onclick = () => {
        if (value > min) {
            value--;
            valueDisplay.textContent = value;
            if (onChange) onChange(value);
        }
    };
    
    const valueDisplay = document.createElement('div');
    valueDisplay.className = 'number-picker-value';
    valueDisplay.textContent = value;
    
    const plusBtn = document.createElement('button');
    plusBtn.className = 'number-picker-btn';
    plusBtn.textContent = '+';
    plusBtn.onclick = () => {
        if (value < max) {
            value++;
            valueDisplay.textContent = value;
            if (onChange) onChange(value);
        }
    };
    
    picker.appendChild(minusBtn);
    picker.appendChild(valueDisplay);
    picker.appendChild(plusBtn);
    
    container.appendChild(labelEl);
    container.appendChild(picker);
    
    return { container, getValue: () => value };
}

// Create color picker
function createColorPicker(initialColor, onChange) {
    const colors = [
        '#4CAF50', '#2196F3', '#F44336', '#FF9800',
        '#9C27B0', '#009688', '#E91E63', '#3F51B5'
    ];
    
    const container = document.createElement('div');
    container.className = 'form-group';
    
    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = 'Category Color';
    
    const grid = document.createElement('div');
    grid.className = 'color-picker-grid';
    
    let selectedColor = initialColor;
    
    colors.forEach(color => {
        const option = document.createElement('div');
        option.className = `color-option ${color === selectedColor ? 'selected' : ''}`;
        option.style.backgroundColor = color;
        option.onclick = () => {
            grid.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedColor = color;
            if (onChange) onChange(color);
        };
        grid.appendChild(option);
    });
    
    container.appendChild(label);
    container.appendChild(grid);
    
    return { container, getValue: () => selectedColor };
}

// Create empty state
function createEmptyState(icon, text) {
    const container = document.createElement('div');
    container.className = 'empty-state';
    
    const iconEl = document.createElement('div');
    iconEl.className = 'empty-state-icon';
    iconEl.textContent = icon;
    
    const textEl = document.createElement('div');
    textEl.className = 'empty-state-text';
    textEl.textContent = text;
    
    container.appendChild(iconEl);
    container.appendChild(textEl);
    
    return container;
}

// Create loading spinner
function createSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    return spinner;
}

// Create stat card
function createStatCard(value, label) {
    const card = document.createElement('div');
    card.className = 'stat-card';
    
    const valueEl = document.createElement('div');
    valueEl.className = 'stat-value';
    valueEl.textContent = value;
    
    const labelEl = document.createElement('div');
    labelEl.className = 'stat-label';
    labelEl.textContent = label;
    
    card.appendChild(valueEl);
    card.appendChild(labelEl);
    
    return card;
}

// Create progress bar
function createProgressBar(current, total) {
    const container = document.createElement('div');
    container.className = 'progress-bar';
    
    const fill = document.createElement('div');
    fill.className = 'progress-fill';
    fill.style.width = `${(current / total) * 100}%`;
    
    container.appendChild(fill);
    
    return container;
}

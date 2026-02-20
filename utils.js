// Utility Functions

// Toast notifications
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Modal dialogs
function showModal(title, message, buttons = []) {
    return new Promise((resolve) => {
        const container = document.getElementById('modal-container');
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
            </div>
            <div class="modal-body">${message}</div>
            <div class="modal-actions"></div>
        `;
        
        const actionsContainer = modal.querySelector('.modal-actions');
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `btn btn-small ${btn.class || 'btn-secondary'}`;
            button.textContent = btn.text;
            button.onclick = () => {
                overlay.remove();
                resolve(btn.value);
            };
            actionsContainer.appendChild(button);
        });
        
        overlay.appendChild(modal);
        container.appendChild(overlay);
        
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(null);
            }
        };
    });
}

// Confirm dialog
async function confirm(title, message) {
    const result = await showModal(title, message, [
        { text: 'Cancel', value: false, class: 'btn-secondary' },
        { text: 'Confirm', value: true, class: 'btn-danger' }
    ]);
    return result === true;
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Format time duration
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
}

// Format timer display (MM:SS)
function formatTimer(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Parse weight string and extract number
function parseWeight(weightStr) {
    if (!weightStr) return 0;
    const match = weightStr.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
}

// Adjust weight value
function adjustWeight(weightStr, delta) {
    if (!weightStr) return `${delta} lbs`;
    
    const currentValue = parseWeight(weightStr);
    const newValue = Math.max(0, currentValue + delta);
    
    // Preserve the unit
    if (weightStr.toLowerCase().includes('kg')) {
        return `${newValue} kg`;
    } else if (weightStr.toLowerCase().includes('bodyweight')) {
        return delta > 0 ? `bodyweight + ${delta} lbs` : 'bodyweight';
    } else {
        return `${newValue} lbs`;
    }
}

// Smart rotation algorithm for exercises
function selectExercisesForWorkout(exercises, rotationFrequency, count) {
    if (exercises.length <= count) {
        return shuffleArray([...exercises]);
    }
    
    // Sort by workoutsSinceLastUse (desc) then lastUsedDate (asc)
    const sorted = [...exercises].sort((a, b) => {
        if (b.workoutsSinceLastUse !== a.workoutsSinceLastUse) {
            return b.workoutsSinceLastUse - a.workoutsSinceLastUse;
        }
        return a.lastUsedDate - b.lastUsedDate;
    });
    
    // First pass: overdue exercises
    const overdue = sorted.filter(e => e.workoutsSinceLastUse >= rotationFrequency);
    const selected = overdue.slice(0, count);
    
    if (selected.length >= count) {
        return shuffleArray(selected);
    }
    
    // Second pass: fill remaining slots
    const remaining = sorted.filter(e => !selected.includes(e));
    const needed = count - selected.length;
    selected.push(...remaining.slice(0, needed));
    
    return shuffleArray(selected);
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Calculate progression suggestion
function calculateProgression(exerciseHistory, currentWeight, progressionThreshold = 3, isTimedExercise = false, timerSeconds = 0, progressionIncrement = 5) {
    if (!exerciseHistory || exerciseHistory.length < progressionThreshold) return null;
    
    // Get completed entries sorted by date desc
    const completed = exerciseHistory
        .filter(h => h.completed)
        .sort((a, b) => b.date - a.date);
    
    if (completed.length < progressionThreshold) return null;
    
    // For timed exercises, check timer progression
    if (isTimedExercise && timerSeconds > 0) {
        const recentTimer = completed[0].timerSeconds || timerSeconds;
        let consecutiveCount = 0;
        
        for (const entry of completed) {
            const entryTimer = entry.timerSeconds || 0;
            if (entryTimer === recentTimer) {
                consecutiveCount++;
            } else {
                break;
            }
        }
        
        // Suggest timer increase if threshold met
        if (consecutiveCount >= progressionThreshold) {
            const suggested = recentTimer + progressionIncrement;
            return `${suggested} seconds`;
        }
        return null;
    }
    
    // For weighted exercises, check weight progression
    const recentWeight = completed[0].weight;
    let consecutiveCount = 0;
    
    for (const entry of completed) {
        if (entry.weight === recentWeight) {
            consecutiveCount++;
        } else {
            break;
        }
    }
    
    // Suggest progression if threshold met
    if (consecutiveCount >= progressionThreshold) {
        const currentValue = parseWeight(recentWeight);
        if (currentValue > 0) {
            const suggested = currentValue + progressionIncrement;
            if (recentWeight.toLowerCase().includes('kg')) {
                return `${suggested} kg`;
            } else {
                return `${suggested} lbs`;
            }
        } else if (recentWeight.toLowerCase().includes('bodyweight')) {
            return 'add weight';
        }
    }
    
    return null;
}

// Count consecutive completions at current weight
function countConsecutiveCompletions(exerciseHistory, currentWeight) {
    if (!exerciseHistory || exerciseHistory.length === 0) return 0;
    
    const completed = exerciseHistory
        .filter(h => h.completed)
        .sort((a, b) => b.date - a.date);
    
    if (completed.length === 0) return 0;
    
    const recentWeight = completed[0].weight;
    let count = 0;
    
    for (const entry of completed) {
        if (entry.weight === recentWeight) {
            count++;
        } else {
            break;
        }
    }
    
    return count;
}

// Find personal record
function findPersonalRecord(exerciseHistory) {
    if (!exerciseHistory || exerciseHistory.length === 0) return null;
    
    let pr = null;
    let maxWeight = 0;
    
    for (const entry of exerciseHistory) {
        if (!entry.completed) continue;
        
        const weight = parseWeight(entry.weight);
        if (weight > maxWeight) {
            maxWeight = weight;
            pr = entry;
        }
    }
    
    return pr;
}

// Vibrate device
function vibrate(duration = 200) {
    if ('vibrate' in navigator) {
        navigator.vibrate(duration);
    }
}

// Play sound
function playSound(frequency = 800, duration = 200) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
        console.log('Audio not available');
    }
}

// Export data to JSON file
function exportToJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import data from JSON file
function importFromJSON() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) {
                reject('No file selected');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    resolve(data);
                } catch (error) {
                    reject('Invalid JSON file');
                }
            };
            reader.onerror = () => reject('Error reading file');
            reader.readAsText(file);
        };
        
        input.click();
    });
}

// Select image file from gallery (no camera)
function selectImage() {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        // Do NOT set capture attribute - let user choose from gallery
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) {
                resolve(null);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target.result); // Base64 data URL
            };
            reader.onerror = () => {
                console.error('Error reading file');
                resolve(null);
            };
            reader.readAsDataURL(file);
        };
        
        input.oncancel = () => {
            resolve(null);
        };
        
        input.click();
    });
}

// Take photo with camera
function takePhoto() {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Force camera
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) {
                resolve(null);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            reader.onerror = () => {
                console.error('Error reading photo');
                resolve(null);
            };
            reader.readAsDataURL(file);
        };
        
        input.oncancel = () => {
            resolve(null);
        };
        
        input.click();
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Generate unique ID
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Calculate weeks between two dates
function weeksBetween(date1, date2) {
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.floor(Math.abs(date2 - date1) / msPerWeek);
}

// Check if this should be a deload week
async function shouldDeload() {
    const deloadFrequency = await db.getSetting('deloadWeeks', 0);
    if (deloadFrequency === 0) return false; // Deload disabled
    
    const lastDeload = await db.getSetting('lastDeloadDate', 0);
    const now = Date.now();
    
    if (lastDeload === 0) {
        // First time - set initial date, don't deload yet
        await db.setSetting('lastDeloadDate', now);
        return false;
    }
    
    const weeks = weeksBetween(lastDeload, now);
    return weeks >= deloadFrequency;
}

// Apply deload to exercises (reduce weight by 50%)
function applyDeload(exercises) {
    return exercises.map(ex => {
        const deloaded = { ...ex };
        if (deloaded.weight && !deloaded.weight.toLowerCase().includes('bodyweight')) {
            const currentWeight = parseWeight(deloaded.weight);
            if (currentWeight > 0) {
                const unit = deloaded.weight.toLowerCase().includes('kg') ? ' kg' : ' lbs';
                deloaded.weight = `${currentWeight * 0.5}${unit}`;
                deloaded.originalWeight = ex.weight; // Track original for display
            }
        }
        return deloaded;
    });
}

// Find previous workout for an exercise (for PDF change tracking)
async function findPreviousWorkoutForExercise(exerciseName, currentDate, db) {
    const sessions = await db.getAllWorkoutSessions();
    const previousSessions = sessions.filter(s => s.date < currentDate).sort((a, b) => b.date - a.date);
    
    for (const session of previousSessions) {
        const records = await db.getWorkoutExerciseRecords(session.id);
        const record = records.find(r => r.exerciseName === exerciseName);
        if (record) return record;
    }
    return null;
}

// Export workout history to professional PDF
async function exportHistoryToPDF(sessions, db) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let y = margin;
        
        // Title
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 255, 136); // Neon green
        doc.text('FitTrack Workout History', pageWidth / 2, y, { align: 'center' });
        
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
        
        y += 15;
        
        // Summary stats
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Summary', margin, y);
        y += 7;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Total Workouts: ${sessions.length}`, margin, y);
        y += 5;
        
        const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        doc.text(`Total Time: ${Math.floor(totalDuration / 60)} hours ${totalDuration % 60} minutes`, margin, y);
        y += 5;
        
        const totalCompleted = sessions.reduce((sum, s) => sum + (s.completedCount || 0), 0);
        doc.text(`Total Exercises Completed: ${totalCompleted}`, margin, y);
        y += 12;
        
        // Workout details
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Workout Details', margin, y);
        y += 7;
        
        for (let i = 0; i < sessions.length; i++) {
            const session = sessions[i];
            
            // Check if we need a new page
            if (y > pageHeight - 40) {
                doc.addPage();
                y = margin;
            }
            
            // Workout header
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, y - 5, pageWidth - 2 * margin, 10, 'F');
            
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(formatDate(session.date), margin + 2, y);
            
            // Category badge
            if (session.categoryName) {
                const category = await db.getCategory(session.categoryId);
                const categoryColor = category ? hexToRgb(category.color) : { r: 156, g: 39, b: 176 };
                doc.setFillColor(categoryColor.r, categoryColor.g, categoryColor.b);
                doc.roundedRect(margin + 50, y - 4, 30, 6, 2, 2, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(8);
                doc.text(session.categoryName.toUpperCase(), margin + 52, y);
            }
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);
            doc.text(`${session.completedCount}/${session.totalCount} completed | ${session.duration} min`, pageWidth - margin, y, { align: 'right' });
            
            y += 5;
            
            // Deload week indicator
            if (session.isDeloadWeek) {
                doc.setFillColor(255, 170, 0);
                doc.roundedRect(margin, y, 55, 6, 2, 2, 'F');
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(8);
                doc.setFont(undefined, 'bold');
                doc.text('DELOAD WEEK', margin + 2, y + 4);
                doc.setFont(undefined, 'normal');
                y += 8;
            } else {
                y += 3;
            }
            
            // Exercise records
            const records = await db.getWorkoutExerciseRecords(session.id);
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            
            for (const record of records) {
                if (y > pageHeight - 20) {
                    doc.addPage();
                    y = margin;
                }
                
                // Checkmark or bullet - use text instead of Unicode
                if (record.completed) {
                    doc.setTextColor(0, 200, 80);
                    doc.setFont(undefined, 'bold');
                    doc.text('[X]', margin + 5, y);
                    doc.setFont(undefined, 'normal');
                } else {
                    doc.setTextColor(200, 200, 200);
                    doc.text('[ ]', margin + 5, y);
                }
                
                doc.setTextColor(0, 0, 0);
                doc.text(record.exerciseName, margin + 12, y);
                
                // Exercise details
                const details = [];
                if (record.sets && record.reps) details.push(`${record.sets}×${record.reps}`);
                if (record.weight) details.push(record.weight);
                if (details.length > 0) {
                    doc.setTextColor(100, 100, 100);
                    doc.text(details.join(' | '), margin + 80, y);
                }
                
                y += 5;
                
                // Show changes from previous workout
                try {
                    const previousWorkout = await findPreviousWorkoutForExercise(record.exerciseName, session.date, db);
                    if (previousWorkout) {
                        const changes = [];
                        
                        if (record.weight !== previousWorkout.weight && record.weight) {
                            changes.push(`New Weight: ${record.weight} (was ${previousWorkout.weight})`);
                        }
                        if (record.sets !== previousWorkout.sets && record.sets) {
                            changes.push(`New Sets: ${record.sets} (was ${previousWorkout.sets})`);
                        }
                        if (record.reps !== previousWorkout.reps && record.reps) {
                            changes.push(`New Reps: ${record.reps} (was ${previousWorkout.reps})`);
                        }
                        
                        if (changes.length > 0) {
                            if (y > pageHeight - 20) {
                                doc.addPage();
                                y = margin;
                            }
                            doc.setTextColor(0, 100, 200);
                            doc.setFontSize(8);
                            doc.setFont(undefined, 'italic');
                            doc.text(changes.join(' | '), margin + 12, y);
                            doc.setFont(undefined, 'normal');
                            y += 4;
                            doc.setFontSize(9);
                        }
                    }
                } catch (error) {
                    // Silently fail if can't find previous
                }
                
                // Notes
                if (record.workoutNotes) {
                    doc.setTextColor(255, 140, 0);
                    doc.setFont(undefined, 'italic');
                    const noteLines = doc.splitTextToSize(`Note: ${record.workoutNotes}`, pageWidth - margin * 2 - 15);
                    for (const line of noteLines) {
                        if (y > pageHeight - 20) {
                            doc.addPage();
                            y = margin;
                        }
                        doc.text(line, margin + 12, y);
                        y += 4;
                    }
                    doc.setFont(undefined, 'normal');
                }
            }
            
            y += 5;
        }
        
        // Footer on last page
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated by FitTrack - Exercise Tracking App', pageWidth / 2, pageHeight - 10, { align: 'center' });
        
        // Save PDF
        const date = new Date().toISOString().split('T')[0];
        doc.save(`FitTrack_History_${date}.pdf`);
        
        return true;
    } catch (error) {
        console.error('PDF Export Error:', error);
        throw new Error('Failed to generate PDF: ' + error.message);
    }
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// Find changes from previous workout for an exercise
async function findExerciseChanges(exerciseName, currentRecord, db) {
    const allSessions = await db.getAllWorkoutSessions();
    const sortedSessions = allSessions.sort((a, b) => b.date - a.date);
    
    // Find previous session with this exercise
    for (const session of sortedSessions) {
        if (session.date >= currentRecord.date) continue; // Skip current or future sessions
        
        const records = await db.getWorkoutExerciseRecords(session.id);
        const prevRecord = records.find(r => r.exerciseName === exerciseName);
        
        if (prevRecord) {
            const changes = [];
            
            // Check weight change
            if (prevRecord.weight !== currentRecord.weight && currentRecord.weight) {
                const prevWeight = parseWeight(prevRecord.weight);
                const currWeight = parseWeight(currentRecord.weight);
                if (prevWeight !== currWeight) {
                    const diff = currWeight - prevWeight;
                    const sign = diff > 0 ? '+' : '';
                    changes.push(`Weight: ${prevRecord.weight} → ${currentRecord.weight} (${sign}${diff})`);
                }
            }
            
            // Check sets change
            if (prevRecord.sets !== currentRecord.sets && currentRecord.sets) {
                changes.push(`Sets: ${prevRecord.sets} → ${currentRecord.sets}`);
            }
            
            // Check reps change
            if (prevRecord.reps !== currentRecord.reps && currentRecord.reps) {
                changes.push(`Reps: ${prevRecord.reps} → ${currentRecord.reps}`);
            }
            
            return changes.length > 0 ? changes : null;
        }
    }
    
    return null;
}

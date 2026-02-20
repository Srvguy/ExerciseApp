// Database Management using IndexedDB
const DB_NAME = 'FitTrackDB';
const DB_VERSION = 1;

class Database {
    constructor() {
        this.db = null;
    }

    async init() {
        console.log('Database.init() called');
        return new Promise((resolve, reject) => {
            console.log('Opening IndexedDB...');
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('IndexedDB open error:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                console.log('IndexedDB opened successfully');
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                console.log('Database upgrade needed, creating object stores...');
                const db = event.target.result;

                // Exercises store
                if (!db.objectStoreNames.contains('exercises')) {
                    const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true });
                    exerciseStore.createIndex('name', 'name', { unique: false });
                    exerciseStore.createIndex('lastUsedDate', 'lastUsedDate', { unique: false });
                }

                // Categories store
                if (!db.objectStoreNames.contains('categories')) {
                    const categoryStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
                    categoryStore.createIndex('name', 'name', { unique: false });
                }

                // Exercise-Category relationships
                if (!db.objectStoreNames.contains('exerciseCategoryRefs')) {
                    const refStore = db.createObjectStore('exerciseCategoryRefs', { keyPath: 'id', autoIncrement: true });
                    refStore.createIndex('exerciseId', 'exerciseId', { unique: false });
                    refStore.createIndex('categoryId', 'categoryId', { unique: false });
                }

                // Workout Sessions store
                if (!db.objectStoreNames.contains('workoutSessions')) {
                    const sessionStore = db.createObjectStore('workoutSessions', { keyPath: 'id', autoIncrement: true });
                    sessionStore.createIndex('date', 'date', { unique: false });
                    sessionStore.createIndex('categoryId', 'categoryId', { unique: false });
                }

                // Workout Exercise Records store
                if (!db.objectStoreNames.contains('workoutExerciseRecords')) {
                    const recordStore = db.createObjectStore('workoutExerciseRecords', { keyPath: 'id', autoIncrement: true });
                    recordStore.createIndex('workoutSessionId', 'workoutSessionId', { unique: false });
                }

                // Exercise History store
                if (!db.objectStoreNames.contains('exerciseHistory')) {
                    const historyStore = db.createObjectStore('exerciseHistory', { keyPath: 'id', autoIncrement: true });
                    historyStore.createIndex('exerciseId', 'exerciseId', { unique: false });
                    historyStore.createIndex('date', 'date', { unique: false });
                }
                
                // App settings store
                if (!db.objectStoreNames.contains('appSettings')) {
                    db.createObjectStore('appSettings', { keyPath: 'key' });
                }
                
                console.log('All object stores created successfully');
            };
        });
    }

    // Generic CRUD operations
    async add(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.add(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async put(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, id) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getByIndex(storeName, indexName, value) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        return new Promise((resolve, reject) => {
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async clear(storeName) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Exercise operations
    async addExercise(exercise) {
        const exerciseData = {
            name: exercise.name,
            sets: exercise.sets || '',
            reps: exercise.reps || '',
            weight: exercise.weight || '',
            notes: exercise.notes || '',
            timerSeconds: exercise.timerSeconds || 0,
            restTimerSeconds: exercise.restTimerSeconds || 0,
            progressionThreshold: exercise.progressionThreshold || 3,
            progressionIncrement: exercise.progressionIncrement || 5,
            imagePath: exercise.imagePath || '',
            lastUsedDate: 0,
            workoutsSinceLastUse: 0
        };
        return await this.add('exercises', exerciseData);
    }

    async updateExercise(exercise) {
        return await this.put('exercises', exercise);
    }

    async getExercise(id) {
        return await this.get('exercises', id);
    }

    async getAllExercises() {
        return await this.getAll('exercises');
    }

    async deleteExercise(id) {
        // Delete exercise
        await this.delete('exercises', id);
        // Delete all exercise-category relationships
        const refs = await this.getByIndex('exerciseCategoryRefs', 'exerciseId', id);
        for (const ref of refs) {
            await this.delete('exerciseCategoryRefs', ref.id);
        }
    }

    // Category operations
    async addCategory(category) {
        const categoryData = {
            name: category.name,
            color: category.color || '#4CAF50',
            rotationFrequency: category.rotationFrequency || 3,
            exercisesPerWorkout: category.exercisesPerWorkout || 5
        };
        return await this.add('categories', categoryData);
    }

    async updateCategory(category) {
        return await this.put('categories', category);
    }

    async getCategory(id) {
        return await this.get('categories', id);
    }

    async getAllCategories() {
        return await this.getAll('categories');
    }

    async deleteCategory(id) {
        await this.delete('categories', id);
        // Delete all exercise-category relationships
        const refs = await this.getByIndex('exerciseCategoryRefs', 'categoryId', id);
        for (const ref of refs) {
            await this.delete('exerciseCategoryRefs', ref.id);
        }
    }

    // Exercise-Category relationships
    async addExerciseCategoryRef(exerciseId, categoryId) {
        return await this.add('exerciseCategoryRefs', { exerciseId, categoryId });
    }

    async getExerciseCategories(exerciseId) {
        const refs = await this.getByIndex('exerciseCategoryRefs', 'exerciseId', exerciseId);
        const categories = [];
        for (const ref of refs) {
            const category = await this.getCategory(ref.categoryId);
            if (category) categories.push(category);
        }
        return categories;
    }

    async getCategoryExercises(categoryId) {
        const refs = await this.getByIndex('exerciseCategoryRefs', 'categoryId', categoryId);
        const exercises = [];
        for (const ref of refs) {
            const exercise = await this.getExercise(ref.exerciseId);
            if (exercise) exercises.push(exercise);
        }
        return exercises;
    }

    async setExerciseCategories(exerciseId, categoryIds) {
        // Delete existing relationships
        const existingRefs = await this.getByIndex('exerciseCategoryRefs', 'exerciseId', exerciseId);
        for (const ref of existingRefs) {
            await this.delete('exerciseCategoryRefs', ref.id);
        }
        // Add new relationships
        for (const categoryId of categoryIds) {
            await this.addExerciseCategoryRef(exerciseId, categoryId);
        }
    }

    // Workout Session operations
    async addWorkoutSession(session) {
        return await this.add('workoutSessions', session);
    }

    async getAllWorkoutSessions() {
        const sessions = await this.getAll('workoutSessions');
        return sessions.sort((a, b) => b.date - a.date);
    }

    async deleteWorkoutSession(id) {
        await this.delete('workoutSessions', id);
        // Delete all exercise records
        const records = await this.getByIndex('workoutExerciseRecords', 'workoutSessionId', id);
        for (const record of records) {
            await this.delete('workoutExerciseRecords', record.id);
        }
    }

    // Workout Exercise Record operations
    async addWorkoutExerciseRecord(record) {
        return await this.add('workoutExerciseRecords', record);
    }

    async getWorkoutExerciseRecords(workoutSessionId) {
        return await this.getByIndex('workoutExerciseRecords', 'workoutSessionId', workoutSessionId);
    }

    // Exercise History operations
    async addExerciseHistory(history) {
        return await this.add('exerciseHistory', history);
    }

    async getExerciseHistory(exerciseId) {
        const history = await this.getByIndex('exerciseHistory', 'exerciseId', exerciseId);
        return history.sort((a, b) => b.date - a.date);
    }

    // Export/Import operations
    async exportData() {
        const data = {
            exercises: await this.getAllExercises(),
            categories: await this.getAllCategories(),
            exerciseCategoryRefs: await this.getAll('exerciseCategoryRefs'),
            workoutSessions: await this.getAllWorkoutSessions(),
            workoutExerciseRecords: await this.getAll('workoutExerciseRecords'),
            exerciseHistory: await this.getAll('exerciseHistory')
        };
        return data;
    }

    async importData(data) {
        // Clear all stores
        await this.clear('exercises');
        await this.clear('categories');
        await this.clear('exerciseCategoryRefs');
        await this.clear('workoutSessions');
        await this.clear('workoutExerciseRecords');
        await this.clear('exerciseHistory');

        // Import data
        for (const exercise of data.exercises || []) {
            await this.add('exercises', exercise);
        }
        for (const category of data.categories || []) {
            await this.add('categories', category);
        }
        for (const ref of data.exerciseCategoryRefs || []) {
            await this.add('exerciseCategoryRefs', ref);
        }
        for (const session of data.workoutSessions || []) {
            await this.add('workoutSessions', session);
        }
        for (const record of data.workoutExerciseRecords || []) {
            await this.add('workoutExerciseRecords', record);
        }
        for (const history of data.exerciseHistory || []) {
            await this.add('exerciseHistory', history);
        }
    }

    // Initialize with sample data
    async initializeSampleData() {
        const categories = await this.getAllCategories();
        if (categories.length > 0) return; // Already has data

        // Create sample categories
        const upperBodyId = await this.addCategory({
            name: 'Upper Body',
            color: '#4CAF50',
            rotationFrequency: 3,
            exercisesPerWorkout: 5
        });

        const lowerBodyId = await this.addCategory({
            name: 'Lower Body',
            color: '#2196F3',
            rotationFrequency: 3,
            exercisesPerWorkout: 5
        });

        const coreId = await this.addCategory({
            name: 'Core',
            color: '#FF9800',
            rotationFrequency: 2,
            exercisesPerWorkout: 4
        });

        // Create sample exercises
        const exercises = [
            { name: 'Bench Press', sets: '3', reps: '10', weight: '135 lbs', progressionThreshold: 3, categoryIds: [upperBodyId] },
            { name: 'Squats', sets: '4', reps: '12', weight: '185 lbs', progressionThreshold: 3, categoryIds: [lowerBodyId] },
            { name: 'Pull-ups', sets: '3', reps: '8', weight: 'bodyweight', progressionThreshold: 4, categoryIds: [upperBodyId] },
            { name: 'Plank', sets: '3', reps: '', weight: '', timerSeconds: 60, restTimerSeconds: 30, progressionThreshold: 3, categoryIds: [coreId] },
            { name: 'Deadlifts', sets: '3', reps: '8', weight: '225 lbs', progressionThreshold: 3, categoryIds: [lowerBodyId] },
            { name: 'Shoulder Press', sets: '3', reps: '10', weight: '75 lbs', progressionThreshold: 3, categoryIds: [upperBodyId] },
            { name: 'Lunges', sets: '3', reps: '12', weight: 'bodyweight', progressionThreshold: 5, categoryIds: [lowerBodyId] },
            { name: 'Russian Twists', sets: '3', reps: '20', weight: '25 lbs', progressionThreshold: 3, categoryIds: [coreId] },
            { name: 'Bicep Curls', sets: '3', reps: '12', weight: '30 lbs', progressionThreshold: 3, categoryIds: [upperBodyId] },
            { name: 'Leg Press', sets: '4', reps: '15', weight: '270 lbs', progressionThreshold: 3, categoryIds: [lowerBodyId] }
        ];

        for (const exercise of exercises) {
            const categoryIds = exercise.categoryIds;
            delete exercise.categoryIds;
            const exerciseId = await this.addExercise(exercise);
            await this.setExerciseCategories(exerciseId, categoryIds);
        }
    }
    
    // App Settings methods
    async getSetting(key, defaultValue = null) {
        const setting = await this.get('appSettings', key);
        return setting ? setting.value : defaultValue;
    }
    
    async setSetting(key, value) {
        return await this.put('appSettings', { key, value });
    }
    
    async getExerciseByName(name) {
        const exercises = await this.getAllExercises();
        return exercises.find(ex => ex.name === name);
    }
}

// Global database instance
const db = new Database();

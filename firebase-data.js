// Firebase Data Operations
import { db } from './firebase-config.js';
import { 
    collection, 
    doc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot,
    serverTimestamp,
    query,
    orderBy 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Global data variables (same as before but will be loaded from Firebase)
let events = [];
let sponsors = [];
let budgetCategories = [];
let feedbacks = [];
let galleryPhotos = [];
let recentActivities = [];

// Collection references
const eventsRef = collection(db, 'events');
const sponsorsRef = collection(db, 'sponsors');
const budgetRef = collection(db, 'budget');
const feedbackRef = collection(db, 'feedback');
const galleryRef = collection(db, 'gallery');
const activitiesRef = collection(db, 'activities');

// Initialize default data (run this once to populate Firebase)
export async function initializeDefaultData() {
    try {
        // Check if data already exists
        const eventsSnapshot = await getDocs(eventsRef);
        if (!eventsSnapshot.empty) {
            console.log('Data already exists in Firebase');
            return;
        }

        console.log('Initializing default data in Firebase...');

        // Default events data
        const defaultEvents = [
            {
                title: "Engineers Day Celebration",
                date: "2025-08-15",
                description: "Join us for a grand celebration of Engineers Day with various activities, competitions, and cultural programs.",
                location: "Gate 2",
                maxParticipants: 200,
                enrolledStudents: [
                    { name: "Rahul", enrollDate: "2025-07-18", paymentStatus: "paid", amount: 500 },
                    { name: "Diya", enrollDate: "2025-07-19", paymentStatus: "pending", amount: 500 },
                    { name: "Swayam", enrollDate: "2025-07-20", paymentStatus: "paid", amount: 500 },
                    { name: "Anish", enrollDate: "2025-07-21", paymentStatus: "paid", amount: 500 }
                ],
                poster: "https://st.adda247.com/https://wpassets.adda247.com/wp-content/uploads/multisite/sites/5/2022/09/15080104/engineers-day-5f2bb117edd5c-1596698903.jpg",
                budget: 50000,
                status: "upcoming",
                fee: 500,
                createdAt: serverTimestamp()
            },
            {
                title: "Independence Day Ceremony",
                date: "2025-09-20",
                description: "Celebrate our nation's independence with a special ceremony featuring speeches, performances, and cultural displays.",
                location: "University Auditorium",
                maxParticipants: 200,
                enrolledStudents: [
                    { name: "Rahul", enrollDate: "2025-07-15", paymentStatus: "free", amount: 0 },
                    { name: "Krish", enrollDate: "2025-07-16", paymentStatus: "free", amount: 0 }
                ],
                poster: "https://imgk.timesnownews.com/media/Independance_day_2.jpg",
                budget: 75000,
                status: "upcoming",
                fee: 0,
                createdAt: serverTimestamp()
            },
            {
                title: "Ras Garba Night",
                date: "2025-10-10",
                description: "Aaa halo jo ras garba maza aavse! Join us for a night of traditional dance, music, and celebration.",
                location: "Ground 2",
                maxParticipants: 500,
                enrolledStudents: [
                    { name: "Abhinav", enrollDate: "2025-07-10", paymentStatus: "paid", amount: 300 },
                    { name: "Sita", enrollDate: "2025-07-11", paymentStatus: "paid", amount: 300 },
                    { name: "Anish", enrollDate: "2025-07-12", paymentStatus: "pending", amount: 300 },
                    { name: "Grishma", enrollDate: "2025-07-13", paymentStatus: "paid", amount: 300 },
                    { name: "Rahul", enrollDate: "2025-07-14", paymentStatus: "paid", amount: 300 }
                ],
                poster: "https://static.vecteezy.com/system/resources/thumbnails/000/132/866/small_2x/vector-design-of-woman-playing-garba-dance.jpg",
                budget: 100000,
                status: "upcoming",
                fee: 300,
                createdAt: serverTimestamp()
            }
        ];

        // Add events
        for (const event of defaultEvents) {
            await addDoc(eventsRef, event);
        }

        // Default sponsors
        const defaultSponsors = [
            { name: "Sai Groups", amount: 100000, contact: "Mr. Sharma", email: "contact@saigroups.com", createdAt: serverTimestamp() },
            { name: "Campa", amount: 50000, contact: "Ms. Patel", email: "info@campa.com", createdAt: serverTimestamp() },
            { name: "Sabbero", amount: 75000, contact: "Mr. Singh", email: "hello@sabbero.com", createdAt: serverTimestamp() },
            { name: "Lenovo", amount: 200000, contact: "Ms. Kumar", email: "partnerships@lenovo.com", createdAt: serverTimestamp() }
        ];

        for (const sponsor of defaultSponsors) {
            await addDoc(sponsorsRef, sponsor);
        }

        // Default budget categories
        const defaultBudget = [
            { name: "Events", allocated: 300000, spent: 180000, createdAt: serverTimestamp() },
            { name: "Equipment", allocated: 100000, spent: 45000, createdAt: serverTimestamp() },
            { name: "Marketing", allocated: 50000, spent: 32000, createdAt: serverTimestamp() },
            { name: "Miscellaneous", allocated: 75000, spent: 28000, createdAt: serverTimestamp() }
        ];

        for (const budget of defaultBudget) {
            await addDoc(budgetRef, budget);
        }

        // Default feedbacks
        const defaultFeedbacks = [
            { author: "Sahil Mishra", text: "The recent cultural festival was amazing! Great job organizing it.", date: "2025-07-10", createdAt: serverTimestamp() },
            { author: "Bhavya Chauhan", text: "Would love to see more sports events and competitions.", date: "2025-07-08", createdAt: serverTimestamp() },
            { author: "Priya Singh", text: "The Engineers Day celebration was well organized. Looking forward to more such events!", date: "2025-07-12", createdAt: serverTimestamp() },
            { author: "Arjun Patel", text: "Suggestion: Can we have more outdoor activities? The weather is perfect for it.", date: "2025-07-14", createdAt: serverTimestamp() }
        ];

        for (const feedback of defaultFeedbacks) {
            await addDoc(feedbackRef, feedback);
        }

        // Default gallery photos
        const defaultGallery = [
            {
                title: "Cultural Festival 2024",
                description: "Students performing traditional dances during our annual cultural festival",
                category: "events",
                image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=300&fit=crop",
                uploadedBy: "secretary",
                uploadDate: "2025-07-15",
                createdAt: serverTimestamp()
            },
            {
                title: "Science Exhibition",
                description: "Amazing projects displayed by our talented students",
                category: "activities",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
                uploadedBy: "secretary",
                uploadDate: "2025-07-12",
                createdAt: serverTimestamp()
            },
            {
                title: "Campus Garden",
                description: "Beautiful flowers blooming in our campus garden",
                category: "campus",
                image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=300&fit=crop",
                uploadedBy: "secretary",
                uploadDate: "2025-07-10",
                createdAt: serverTimestamp()
            }
        ];

        for (const photo of defaultGallery) {
            await addDoc(galleryRef, photo);
        }

        // Default activities
        const defaultActivities = [
            { action: "New student enrolled", details: "Rahul enrolled in Engineers Day Celebration", time: "2 mins ago", createdAt: serverTimestamp() },
            { action: "Event created", details: "Independence Day Ceremony added", time: "1 hour ago", createdAt: serverTimestamp() },
            { action: "Photo uploaded", details: "Cultural Festival photos added to gallery", time: "3 hours ago", createdAt: serverTimestamp() },
            { action: "Sponsor added", details: "Lenovo partnership confirmed", time: "1 day ago", createdAt: serverTimestamp() },
            { action: "Payment received", details: "Diya paid for Garba Night", time: "2 hours ago", createdAt: serverTimestamp() }
        ];

        for (const activity of defaultActivities) {
            await addDoc(activitiesRef, activity);
        }

        console.log('Default data initialized successfully!');
    } catch (error) {
        console.error('Error initializing default data:', error);
    }
}

// Load all data from Firebase
export async function loadAllData() {
    try {
        // Load events
        const eventsSnapshot = await getDocs(eventsRef);
        events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load sponsors
        const sponsorsSnapshot = await getDocs(sponsorsRef);
        sponsors = sponsorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load budget
        const budgetSnapshot = await getDocs(budgetRef);
        budgetCategories = budgetSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load feedback
        const feedbackSnapshot = await getDocs(query(feedbackRef, orderBy('createdAt', 'desc')));
        feedbacks = feedbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load gallery
        const gallerySnapshot = await getDocs(query(galleryRef, orderBy('createdAt', 'desc')));
        galleryPhotos = gallerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load activities
        const activitiesSnapshot = await getDocs(query(activitiesRef, orderBy('createdAt', 'desc')));
        recentActivities = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log('All data loaded from Firebase');
        
        // Update UI after loading data
        if (typeof updateEventsList === 'function') updateEventsList();
        if (typeof updateFeedbackList === 'function') updateFeedbackList();
        if (typeof updateGalleryList === 'function') updateGalleryList();
        if (typeof updateDashboard === 'function' && currentPage === 'dashboard') updateDashboard();
        if (typeof updateFinanceData === 'function' && currentPage === 'finance') updateFinanceData();
        if (typeof updateEventManagement === 'function' && currentPage === 'manage-events') updateEventManagement();

    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Firebase CRUD operations
export const firebaseOperations = {
    // Events
    async addEvent(eventData) {
        try {
            const docRef = await addDoc(eventsRef, { ...eventData, createdAt: serverTimestamp() });
            const newEvent = { id: docRef.id, ...eventData };
            events.push(newEvent);
            return newEvent;
        } catch (error) {
            console.error('Error adding event:', error);
            throw error;
        }
    },

    async updateEvent(eventId, eventData) {
        try {
            await updateDoc(doc(eventsRef, eventId), eventData);
            const index = events.findIndex(e => e.id === eventId);
            if (index !== -1) {
                events[index] = { ...events[index], ...eventData };
            }
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },

    async deleteEvent(eventId) {
        try {
            await deleteDoc(doc(eventsRef, eventId));
            events = events.filter(e => e.id !== eventId);
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    },

    // Sponsors
    async addSponsor(sponsorData) {
        try {
            const docRef = await addDoc(sponsorsRef, { ...sponsorData, createdAt: serverTimestamp() });
            const newSponsor = { id: docRef.id, ...sponsorData };
            sponsors.push(newSponsor);
            return newSponsor;
        } catch (error) {
            console.error('Error adding sponsor:', error);
            throw error;
        }
    },

    // Feedback
    async addFeedback(feedbackData) {
        try {
            const docRef = await addDoc(feedbackRef, { ...feedbackData, createdAt: serverTimestamp() });
            const newFeedback = { id: docRef.id, ...feedbackData };
            feedbacks.unshift(newFeedback);
            return newFeedback;
        } catch (error) {
            console.error('Error adding feedback:', error);
            throw error;
        }
    },

    // Gallery
    async addPhoto(photoData) {
        try {
            const docRef = await addDoc(galleryRef, { ...photoData, createdAt: serverTimestamp() });
            const newPhoto = { id: docRef.id, ...photoData };
            galleryPhotos.unshift(newPhoto);
            return newPhoto;
        } catch (error) {
            console.error('Error adding photo:', error);
            throw error;
        }
    },

    async deletePhoto(photoId) {
        try {
            await deleteDoc(doc(galleryRef, photoId));
            galleryPhotos = galleryPhotos.filter(p => p.id !== photoId);
        } catch (error) {
            console.error('Error deleting photo:', error);
            throw error;
        }
    },

    // Activities
    async addActivity(activityData) {
        try {
            const docRef = await addDoc(activitiesRef, { ...activityData, createdAt: serverTimestamp() });
            const newActivity = { id: docRef.id, ...activityData };
            recentActivities.unshift(newActivity);
            
            // Keep only last 20 activities in memory
            if (recentActivities.length > 20) {
                recentActivities = recentActivities.slice(0, 20);
            }
            
            return newActivity;
        } catch (error) {
            console.error('Error adding activity:', error);
            throw error;
        }
    }
};

// Export data arrays so existing code can access them
export { events, sponsors, budgetCategories, feedbacks, galleryPhotos, recentActivities };
// src/firebaseHelpers.js - Complete Version with All Features
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile 
} from "firebase/auth";
import { auth, db } from "./firebase";

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

export const registerUser = async (email, password, userData) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile
    await updateProfile(user, {
      displayName: userData.name
    });

    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      name: userData.name,
      email: user.email,
      location: userData.location || '',
      availability: userData.availability || 'weekends',
      skillsOffered: [],
      skillsWanted: [],
      bio: '',
      isPublic: true,
      rating: 5.0,
      completedSwaps: 0,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, "users", user.uid), userDoc);
    
    return { success: true, user: userDoc };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// USER PROFILE FUNCTIONS
// ==========================================

export const updateUserProfile = async (uid, profileData) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { success: true, user: { id: userDoc.id, ...userDoc.data() } };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error("Get user profile error:", error);
    return { success: false, error: error.message };
  }
};

export const getAllUsers = async () => {
  try {
    const usersQuery = query(
      collection(db, "users"), 
      where("isPublic", "==", true),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(usersQuery);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, users };
  } catch (error) {
    console.error("Get users error:", error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// REAL-TIME LISTENERS
// ==========================================

export const listenToUsers = (callback) => {
  try {
    const usersQuery = query(
      collection(db, "users"),
      orderBy("createdAt", "desc")
    );
    
    return onSnapshot(usersQuery, (querySnapshot) => {
      const users = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const userWithId = {
          ...userData,
          uid: userData.uid || doc.id,
          id: doc.id
        };
        users.push(userWithId);
      });
      
      // Filter users - show only public profiles with names
      const filteredUsers = users.filter(user => {
        const hasName = user.name && user.name.trim();
        const isPublic = user.isPublic !== false;
        return hasName && isPublic;
      });
      
      callback(filteredUsers);
    });
  } catch (error) {
    console.error("Listen to users error:", error);
    return null;
  }
};

export const listenToUserProfile = (uid, callback) => {
  try {
    const userRef = doc(db, "users", uid);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    });
  } catch (error) {
    console.error("Listen to user profile error:", error);
    return null;
  }
};

// ==========================================
// SWAP REQUEST FUNCTIONS
// ==========================================

export const createSwapRequest = async (requestData) => {
  try {
    const swapRequest = {
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, "swapRequests"), swapRequest);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Create swap request error:", error);
    return { success: false, error: error.message };
  }
};

export const getSwapRequests = async (uid) => {
  try {
    // Get requests where user is sender or receiver
    const sentQuery = query(
      collection(db, "swapRequests"), 
      where("fromUid", "==", uid),
      orderBy("createdAt", "desc")
    );
    
    const receivedQuery = query(
      collection(db, "swapRequests"), 
      where("toUid", "==", uid),
      orderBy("createdAt", "desc")
    );
    
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery)
    ]);
    
    const requests = [];
    
    sentSnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data(), type: 'sent' });
    });
    
    receivedSnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data(), type: 'received' });
    });
    
    // Sort by date
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return { success: true, requests };
  } catch (error) {
    console.error("Get swap requests error:", error);
    return { success: false, error: error.message };
  }
};

export const updateSwapRequestStatus = async (requestId, status) => {
  try {
    const requestRef = doc(db, "swapRequests", requestId);
    await updateDoc(requestRef, {
      status: status,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Update swap request error:", error);
    return { success: false, error: error.message };
  }
};

export const deleteSwapRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, "swapRequests", requestId));
    return { success: true };
  } catch (error) {
    console.error("Delete swap request error:", error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// FRIENDS SYSTEM FUNCTIONS (ADVANCED FEATURE)
// ==========================================

export const addFriend = async (fromUid, toUid) => {
  try {
    const friendRequest = {
      fromUid,
      toUid,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, "friendRequests"), friendRequest);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Add friend error:", error);
    return { success: false, error: error.message };
  }
};

export const acceptFriend = async (fromUid, toUid) => {
  try {
    // Update the friend request status to accepted
    const friendRequestQuery = query(
      collection(db, "friendRequests"),
      where("fromUid", "==", toUid),
      where("toUid", "==", fromUid),
      where("status", "==", "pending")
    );
    
    const querySnapshot = await getDocs(friendRequestQuery);
    
    if (!querySnapshot.empty) {
      const requestDoc = querySnapshot.docs[0];
      await updateDoc(requestDoc.ref, {
        status: 'accepted',
        acceptedAt: new Date().toISOString()
      });
      
      // Add to friends collection for both users
      await Promise.all([
        addDoc(collection(db, "friends"), {
          user1: fromUid,
          user2: toUid,
          createdAt: new Date().toISOString()
        }),
        addDoc(collection(db, "friends"), {
          user1: toUid,
          user2: fromUid,
          createdAt: new Date().toISOString()
        })
      ]);
      
      return { success: true };
    } else {
      return { success: false, error: "Friend request not found" };
    }
  } catch (error) {
    console.error("Accept friend error:", error);
    return { success: false, error: error.message };
  }
};

export const getFriends = async (uid) => {
  try {
    const friendsQuery = query(
      collection(db, "friends"),
      where("user1", "==", uid)
    );
    
    const querySnapshot = await getDocs(friendsQuery);
    const friendIds = [];
    
    querySnapshot.forEach((doc) => {
      friendIds.push(doc.data().user2);
    });
    
    // Get friend profiles
    const friends = [];
    for (const friendId of friendIds) {
      const friendProfile = await getUserProfile(friendId);
      if (friendProfile.success) {
        friends.push(friendProfile.user);
      }
    }
    
    return { success: true, friends };
  } catch (error) {
    console.error("Get friends error:", error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export const getUsersBySkill = async (skill) => {
  try {
    const usersQuery = query(
      collection(db, "users"),
      where("skillsOffered", "array-contains", skill),
      where("isPublic", "==", true)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, users };
  } catch (error) {
    console.error("Get users by skill error:", error);
    return { success: false, error: error.message };
  }
};

export const searchUsers = async (searchTerm) => {
  try {
    const result = await getAllUsers();
    if (result.success) {
      const filteredUsers = result.users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.skillsOffered?.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        user.skillsWanted?.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        user.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return { success: true, users: filteredUsers };
    }
    return result;
  } catch (error) {
    console.error("Search users error:", error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// DEMO DATA SEEDING
// ==========================================

export const seedDemoData = async () => {
  try {
    const demoUsers = [
      {
        name: "Alice Johnson",
        email: "alice@demo.com",
        location: "San Francisco, CA",
        availability: "evenings",
        skillsOffered: ["JavaScript", "React", "Node.js"],
        skillsWanted: ["Python", "Machine Learning", "Data Science"],
        bio: "Full-stack developer passionate about learning new technologies. Love to share knowledge and help others grow.",
        isPublic: true,
        rating: 4.8,
        completedSwaps: 12
      },
      {
        name: "Bob Smith",
        email: "bob@demo.com",
        location: "New York, NY",
        availability: "weekends",
        skillsOffered: ["Python", "Django", "PostgreSQL"],
        skillsWanted: ["React", "TypeScript", "AWS"],
        bio: "Backend engineer with 5 years experience. Always excited to learn frontend technologies and cloud platforms.",
        isPublic: true,
        rating: 4.9,
        completedSwaps: 8
      },
      {
        name: "Carol Davis",
        email: "carol@demo.com",
        location: "Austin, TX",
        availability: "flexible",
        skillsOffered: ["UI/UX Design", "Figma", "Adobe Creative Suite"],
        skillsWanted: ["Frontend Development", "CSS", "Animation"],
        bio: "Creative designer looking to expand into development. Love creating beautiful and functional user experiences.",
        isPublic: true,
        rating: 5.0,
        completedSwaps: 15
      },
      {
        name: "David Wilson",
        email: "david@demo.com",
        location: "Seattle, WA",
        availability: "weekdays",
        skillsOffered: ["Data Science", "Machine Learning", "R"],
        skillsWanted: ["Web Development", "JavaScript", "APIs"],
        bio: "Data scientist transitioning to full-stack development. Experienced in analytics and ML, eager to build web applications.",
        isPublic: true,
        rating: 4.7,
        completedSwaps: 6
      },
      {
        name: "Emma Brown",
        email: "emma@demo.com",
        location: "Los Angeles, CA",
        availability: "evenings",
        skillsOffered: ["Digital Marketing", "SEO", "Content Strategy"],
        skillsWanted: ["Graphic Design", "Video Editing", "Photography"],
        bio: "Marketing professional looking to enhance creative skills. Love helping businesses grow their online presence.",
        isPublic: true,
        rating: 4.6,
        completedSwaps: 10
      }
    ];

    const promises = demoUsers.map(async (userData) => {
      try {
        // Generate a unique UID for demo users
        const demoUid = `demo_${userData.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
        
        const userDoc = {
          uid: demoUid,
          ...userData,
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, "users", demoUid), userDoc);
        return { success: true };
      } catch (error) {
        console.error(`Error creating demo user ${userData.name}:`, error);
        return { success: false, error: error.message };
      }
    });

    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    console.error("Seed demo data error:", error);
    return { success: false, error: error.message };
  }
};
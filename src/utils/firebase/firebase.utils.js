import { initializeApp } from 'firebase/app';
import { getAuth, 
    signInWithRedirect, 
    signInWithPopup, 
    GoogleAuthProvider,
    createUserWithEmailAndPassword 
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDViCIYnwoG8T4LeMywhh645PrBugSFHSg",
    authDomain: "crown-clothing-db-ea293.firebaseapp.com",
    projectId: "crown-clothing-db-ea293",
    storageBucket: "crown-clothing-db-ea293.appspot.com",
    messagingSenderId: "307487895318",
    appId: "1:307487895318:web:8c04d57b84a4ee5317ea37",
};
  
// Initialize Firebase
const firebaseapp = initializeApp(firebaseConfig);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});

export const auth = getAuth();
export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);
export const signInWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);

export const db = getFirestore();

export const createUserDocumentFromAuth = async (
    userAuth, 
    additionalInformation = {}) => {
        const userDocRef = doc(db, 'users', userAuth.uid);
        console.log(userDocRef);

        const userSnapshot = await(userDocRef);
        console.log(userSnapshot);
        console.log(userSnapshot.exists());

        if(!userSnapshot.exists()) {
            const { displayName, email } = userAuth;
            const createdAt = new Date();

            try {
                await setDoc(userDocRef, {
                    displayName,
                    email,
                    createdAt,
                    ...additionalInformation
                });
            } catch (error) {
                console.log('Error creating the user', error.message);
            }

    }

    return userDocRef;

}

export const createAuthUserWithEmailAndPassword = async (email, password) => {
    if (!email || !password) return;

    return await createUserWithEmailAndPassword(auth, email, password);
};
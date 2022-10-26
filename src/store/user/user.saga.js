import { takeLatest, put, all, call } from 'redux-saga/effects';

import { USER_ACTION_TYPES } from './user.types';

import { signInSuccess, signInFailed, signOutSuccess, signOutFailed } from './user.action';

import { getCurrentUser, createUserDocumentFromAuth, signInWithGooglePopup, signInAuthUserWithEmailAndPassword, createAuthUserWithEmailAndPassword, signOutUser } from '../../utils/firebase/firebase.utils';
import { createAction } from '../../utils/reducer/reducer.utils';

export function* getSnapshopFromUserAuth(userAuth, additonalDetails) {
    try {
        const userSnapshot = yield call(createUserDocumentFromAuth, userAuth, additonalDetails);
        yield put(signInSuccess({ id: userSnapshot.id, ...userSnapshot.data() }));
    } catch(error) {
        yield put(signInFailed(error));
    }
}

export function* isUserAuthenticated() {
    try {
        const userAuth = yield call(getCurrentUser);
        if(!userAuth) return;
        yield call(getSnapshopFromUserAuth, userAuth)
    } catch(error) {
        yield put(signInFailed(error));
    }
}

export function* onCheckUserSession() {
    yield takeLatest(USER_ACTION_TYPES.CHECK_USER_SESSION, isUserAuthenticated )
}

export function* signInWithGoogle() {
    try {
        const  { user } = yield call(signInWithGooglePopup);
        yield call(getSnapshopFromUserAuth, user);
    } catch (error) {
        yield put(signInFailed(error));
    }
}

export function* signInWithEmail({ payload: { email, password } }) {
    try {
        const { user } = yield call(
            signInAuthUserWithEmailAndPassword,
            email,
            password
        );
        yield call(getSnapshopFromUserAuth, user);
    } catch (error) {
        yield put(signInFailed(error));
    }
}

export function* signUp({ payload: { email, password, displayName } }) {
    try {
      const { user } = yield call(
        createAuthUserWithEmailAndPassword,
        email,
        password
      );
      yield put(signUpSuccess(user, { displayName }));
    } catch (error) {
      yield put(signUpFailed(error));
    }
  }

export function* signOut( ) {
    try {
        yield call(signOutUser);
        yield put(signOutSuccess());
    } catch (error) {
        yield put(signOutFailed(error)); 
    }
}

export const signUpStart = (email, password, displayName) => 
    createAction(USER_ACTION_TYPES.SIGN_UP_START, { email, password, displayName });

export const  signUpSuccess = ({ user, additionalDetails }) =>
    createAction(USER_ACTION_TYPES.SIGN_IN_SUCCESS, { user, additionalDetails });


export const signUpFailed = (error) => 
    createAction(USER_ACTION_TYPES.SIGN_UP_FAILED, error);



export function* signInAfterSignUp({payload: { user, additionalDetails }}) {
    yield call(getSnapshopFromUserAuth, user, additionalDetails);
}   

export function* onGoogleSignInStart() {
    yield takeLatest(USER_ACTION_TYPES.GOOGLE_SIGN_IN_START, signInWithGoogle)
}

export function* onEmailSignInStart() {
    yield takeLatest(USER_ACTION_TYPES.EMAIL_SIGN_IN_START, signInWithEmail)
}

export function* onSignUpStart() {
    yield takeLatest(USER_ACTION_TYPES.SIGN_UP_START, signUp)
}

export function* onSignUpSuccess() {
    yield takeLatest(USER_ACTION_TYPES.SIGN_UP_SUCCESS, signInAfterSignUp)
}

export function* onSignOutStart() {
    yield takeLatest(USER_ACTION_TYPES.SIGN_OUT_START, signOut)
}



export function* userSagas() {
    yield all([
        call(onCheckUserSession), 
        call(onGoogleSignInStart),
        call(onEmailSignInStart),
    ]);
}
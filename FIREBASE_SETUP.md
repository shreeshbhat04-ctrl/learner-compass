# Firebase Setup Guide

## Firestore Security Rules Error Fix

If you're seeing the error: `Missing or insufficient permissions`, you need to set up Firestore security rules.

### Option 1: Use Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Replace the default rules with the rules from `firestore.rules` file
5. Click **Publish**

### Option 2: Use Firebase CLI

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project (if not already done):
```bash
firebase init firestore
```

4. Deploy the rules:
```bash
firebase deploy --only firestore:rules
```

## Recommended Firestore Security Rules

The `firestore.rules` file contains rules that:
- Allow authenticated users to read/write their own user document
- Allow users to manage their own progress and submissions
- Prevent unauthorized access to other users' data

### Basic Rules (for development/testing only)

⚠️ **Warning**: These rules allow full access. Only use for development!

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Environment Variables

Make sure you have these environment variables set in your `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Firebase Billing

Note: Firestore requires billing to be enabled for production use. The app will work with authentication even if Firestore writes fail, but user profile data won't be persisted.

## Testing

After setting up the rules:
1. Restart your development server
2. Try logging in or signing up
3. Check the browser console for any remaining errors

If errors persist:
- Verify your Firebase project is properly configured
- Check that authentication is enabled in Firebase Console
- Ensure Firestore is enabled in your Firebase project

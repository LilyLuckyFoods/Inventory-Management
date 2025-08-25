"use client";

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from './use-toast';

const ALLOWED_DOMAINS = ['luckyfood.com'];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDomain = user.email?.split('@')[1];
        if (userDomain && ALLOWED_DOMAINS.includes(userDomain)) {
          setUser(user);
        } else {
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'You do not have permission to access this application.',
          });
          signOut();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return { user, loading, signIn, signOut };
}


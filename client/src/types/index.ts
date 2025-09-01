// Client-side type definitions
export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  phone?: string;
  college?: string;
  idCardFront?: string;
  idCardBack?: string;
  isApproved: boolean;
  isSuspended: boolean;
  premiumBypassed: boolean;
  paymentDone: boolean;
  paymentId?: string;
  isAdmin: boolean;
  likedUsers: string[];
  dislikedUsers: string[];
  blockedUsers: string[];
  reportedUsers: string[];
  matches: string[];
  rejectedUsers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  branch: 'computer-science' | 'mechanical' | 'electrical' | 'civil' | 'electronics' | 'chemical';
  graduationYear?: '2026' | '2027' | '2028' | '2029' | '2030';
  bio?: string;
  profilePicture?: string;
  photos: string[];
  socialHandles: Record<string, string>;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  studentIdImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SwipeProfile extends Profile {
  user?: User;
  firstName?: string;
  profile?: {
    profilePicture?: string;
  };
}

// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
// import { Button } from '../components/ui/button';
// import { Input } from '../components/ui/input';
// import { Label } from '../components/ui/label';
// import { Textarea } from '../components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
// import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
// import { 
//   ArrowLeft, 
//   User, 
//   Camera, 
//   Upload, 
//   X,
//   Save,
//   Trash2,
//   AlertTriangle 
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import BottomNavigation from '../components/BottomNavigation';

// interface Profile {
//   id: string;
//   userId: string;
//   age: number;
//   gender: string;
//   branch: string;
//   graduationYear: string;
//   bio?: string;
//   profilePicture?: string;
//   photos?: string[];
//   college?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface College {
//   id: string;
//   name: string;
// }

// interface Branch {
//   id: string;
//   name: string;
// }

// const ProfileEdit = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [colleges, setColleges] = useState<College[]>([]);
//   const [branches, setBranches] = useState<Branch[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

//   // Form data
//   const [formData, setFormData] = useState({
//     age: '',
//     branch: '',
//     graduationYear: '',
//     bio: '',
//     college: ''
//   });

//   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

//   useEffect(() => {
//     if (user) {
//       // Pre-populate form with user data
//       setFormData({
//         age: user.age?.toString() || '',
//         branch: user.branch || '',
//         graduationYear: user.graduationYear || '',
//         bio: user.bio || '',
//         college: user.college || ''
//       });
//     }
//     fetchColleges();
//     fetchBranches();
//   }, [user]);

//   // Remove unused fetchProfile function since we're using user data from auth context

//   const fetchColleges = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/colleges`, {
//         credentials: 'include',
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setColleges(data);
//       }
//     } catch (error) {
//       console.error('Error fetching colleges:', error);
//     }
//   };

//   const fetchBranches = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/branches`, {
//         credentials: 'include',
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setBranches(data);
//       }
//     } catch (error) {
//       console.error('Error fetching branches:', error);
//     }
//   };

//   const handleInputChange = (field: string, value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleSave = async () => {
//     // For new users, require all fields. For existing users, only require editable fields
//     const isNewUser = !user?.age || !user?.graduationYear;
    
//     if (isNewUser) {
//       if (!formData.age || !formData.branch || !formData.graduationYear || !formData.bio) {
//         toast.error('Please fill in all required fields: Age, Branch, Graduation Year, and Bio');
//         return;
//       }
//     } else {
//       if (!formData.branch || !formData.bio) {
//         toast.error('Please fill in all required fields: Branch and Bio');
//         return;
//       }
//     }

//     setSaving(true);
//     try {
//       const updateData: any = {
//         branch: formData.branch,
//         bio: formData.bio,
//         college: formData.college
//       };

//       // Only include age and graduationYear for new users
//       if (isNewUser && formData.age) {
//         updateData.age = parseInt(formData.age);
//       }
//       if (isNewUser && formData.graduationYear) {
//         updateData.graduationYear = formData.graduationYear;
//       }

//       const response = await fetch(`${API_URL}/api/me`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify(updateData),
//       });

//       if (response.ok) {
//         toast.success('Profile updated successfully!');
//         navigate('/profile');
//       } else {
//         const error = await response.json();
//         toast.error(error.error || 'Failed to update profile');
//       }
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       toast.error('Failed to update profile');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setUploading(true);
//     const formData = new FormData();
//     formData.append('image', file);

//     try {
//       const response = await fetch(`${API_URL}/api/profiles/upload-picture`, {
//         method: 'POST',
//         credentials: 'include',
//         body: formData,
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setProfile(prev => prev ? { ...prev, profilePicture: data.profilePicture } : null);
//         toast.success('Profile picture updated!');
//       } else {
//         toast.error('Failed to upload profile picture');
//       }
//     } catch (error) {
//       toast.error('Failed to upload profile picture');
//     } finally {
//       setUploading(false);
//     }
//   };

//   // COMMENTED OUT - Delete account functionality for later use
//   /*
//   const handleDeleteAccount = async () => {
//     if (!window.confirm('Are you absolutely sure? This action cannot be undone. All your data, matches, and messages will be permanently deleted.')) {
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/api/auth/delete-account`, {
//         method: 'DELETE',
//         credentials: 'include',
//       });

//       if (response.ok) {
//         toast.success('Account deleted successfully');
//         await logout();
//         navigate('/');
//       } else {
//         toast.error('Failed to delete account');
//       }
//     } catch (error) {
//       toast.error('Failed to delete account');
//     }
//   };
//   */

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="spinner w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600 mb-4">Please log in to edit your profile</p>
//           <Link to="/login" className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600">
//             Go to Login
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <Link to="/profile" className="flex items-center space-x-2 text-gray-600 hover:text-pink-500">
//               <ArrowLeft className="w-5 h-5" />
//               <span>Back to Profile</span>
//             </Link>
//             <h1 className="text-xl font-bold gradient-text">Edit Profile</h1>
//             <div className="w-32"></div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid md:grid-cols-3 gap-8">
//           {/* Profile Picture Section */}
//           <div className="md:col-span-1">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center space-x-2">
//                   <Camera className="w-5 h-5" />
//                   <span>Profile Picture</span>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="text-center">
//                 <div className="relative w-48 h-48 mx-auto mb-4">
//                   {user?.profileImageUrl ? (
//                     <img
//                       src={user.profileImageUrl}
//                       alt="Profile"
//                       className="w-full h-full object-cover rounded-full border-4 border-pink-200"
//                     />
//                   ) : (
//                     <div className="w-full h-full bg-gradient-to-br from-pink-100 to-orange-100 rounded-full border-4 border-pink-200 flex items-center justify-center">
//                       <User className="w-20 h-20 text-gray-400" />
//                     </div>
//                   )}
                  
//                   {/* Upload Button */}
//                   <label
//                     htmlFor="profile-picture-upload"
//                     className="absolute bottom-2 right-2 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-pink-600 transition-colors shadow-lg"
//                   >
//                     <Camera className="w-5 h-5 text-white" />
//                   </label>
//                   <input
//                     id="profile-picture-upload"
//                     type="file"
//                     accept="image/*"
//                     onChange={handleProfilePictureUpload}
//                     className="hidden"
//                     disabled={uploading}
//                   />
//                 </div>
                
//                 {uploading && (
//                   <p className="text-sm text-gray-600">Uploading...</p>
//                 )}
                
//                 <p className="text-sm text-gray-600">
//                   Click the camera icon to change your profile picture
//                 </p>
//               </CardContent>
//             </Card>

//             {/* Account Info */}
//             <Card className="mt-6">
//               <CardHeader>
//                 <CardTitle>Account Info</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <Label className="text-sm font-medium text-gray-600">Name (Cannot be changed)</Label>
//                   <p className="text-gray-900 font-medium">{user?.firstName || 'N/A'} {user?.lastName || ''}</p>
//                 </div>
                
//                 <div>
//                   <Label className="text-sm font-medium text-gray-600">Email</Label>
//                   <p className="text-gray-900">{user?.email || 'N/A'}</p>
//                 </div>
                
//                 <div>
//                   <Label className="text-sm font-medium text-gray-600">Gender (Cannot be changed)</Label>
//                   <p className="text-gray-900 capitalize">{user?.gender || 'Not specified'}</p>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Edit Form Section */}
//           <div className="md:col-span-2">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center space-x-2">
//                   <User className="w-5 h-5" />
//                   <span>Profile Information</span>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Age */}
//                 <div>
//                   <Label htmlFor="age">Age {user?.age ? '(Cannot be changed)' : '*'}</Label>
//                   <Input
//                     id="age"
//                     type="number"
//                     min="18"
//                     max="100"
//                     value={formData.age}
//                     onChange={(e) => handleInputChange('age', e.target.value)}
//                     placeholder="Enter your age"
//                     disabled={!!user?.age}
//                   />
//                   {user?.age && (
//                     <p className="text-sm text-gray-500 mt-1">Age cannot be changed after initial setup</p>
//                   )}
//                 </div>

//                 {/* College */}
//                                   <div>
//                     <Label htmlFor="college">College</Label>
//                     <Select value={formData.college} onValueChange={(value) => handleInputChange('college', value)}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select your college" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {colleges.length > 0 ? colleges.map((college) => (
//                           <SelectItem key={college.id} value={college.name}>
//                             {college.name}
//                           </SelectItem>
//                         )) : (
//                           <SelectItem value="loading">Loading colleges...</SelectItem>
//                         )}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                 {/* Branch */}
//                 <div>
//                   <Label htmlFor="branch">Branch *</Label>
//                   <Select value={formData.branch} onValueChange={(value) => handleInputChange('branch', value)}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select your branch" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {branches.length > 0 ? branches.map((branch) => (
//                         <SelectItem key={branch.id} value={branch.name}>
//                           {branch.name}
//                         </SelectItem>
//                       )) : (
//                         <SelectItem value="loading">Loading branches...</SelectItem>
//                       )}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Graduation Year */}
//                 <div>
//                   <Label htmlFor="graduationYear">Graduation Year {user?.graduationYear ? '(Cannot be changed)' : '*'}</Label>
//                   <Select 
//                     value={formData.graduationYear} 
//                     onValueChange={(value) => handleInputChange('graduationYear', value)}
//                     disabled={!!user?.graduationYear}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select graduation year" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="2024">2024</SelectItem>
//                       <SelectItem value="2025">2025</SelectItem>
//                       <SelectItem value="2026">2026</SelectItem>
//                       <SelectItem value="2027">2027</SelectItem>
//                       <SelectItem value="2028">2028</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   {user?.graduationYear && (
//                     <p className="text-sm text-gray-500 mt-1">Graduation year cannot be changed after initial setup</p>
//                   )}
//                 </div>

//                 {/* Bio */}
//                 <div>
//                   <Label htmlFor="bio">Bio *</Label>
//                   <Textarea
//                     id="bio"
//                     value={formData.bio}
//                     onChange={(e) => handleInputChange('bio', e.target.value)}
//                     placeholder="Tell others about yourself..."
//                     rows={4}
//                     maxLength={500}
//                   />
//                   <p className="text-sm text-gray-500 mt-1">
//                     {formData.bio.length}/500 characters
//                   </p>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex space-x-4 pt-6">
//                   <Button
//                     onClick={handleSave}
//                     disabled={saving}
//                     className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
//                   >
//                     <Save className="w-4 h-4 mr-2" />
//                     {saving ? 'Saving...' : 'Save Changes'}
//                   </Button>
                  
//                   <Button
//                     variant="outline"
//                     onClick={() => navigate('/profile')}
//                     className="flex-1"
//                   >
//                     Cancel
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Danger Zone - Commented out for later use */}
//             {/*
//             <Card className="mt-6 border-red-200">
//               <CardHeader>
//                 <CardTitle className="flex items-center space-x-2 text-red-600">
//                   <AlertTriangle className="w-5 h-5" />
//                   <span>Danger Zone</span>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="bg-red-50 p-4 rounded-lg border border-red-200">
//                   <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
//                   <p className="text-sm text-red-700 mb-4">
//                     Once you delete your account, there is no going back. Please be certain.
//                   </p>
                  
//                   <Button
//                     variant="destructive"
//                     onClick={() => setShowDeleteConfirm(true)}
//                     className="bg-red-600 hover:bg-red-700"
//                   >
//                     <Trash2 className="w-4 h-4 mr-2" />
//                     Delete Account
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//             */}
//           </div>
//         </div>
//       </main>

//       {/* Delete Confirmation Modal - Commented out for later use */}
//       {/*
//       {showDeleteConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md mx-4">
//             <div className="flex items-center space-x-3 mb-4">
//               <AlertTriangle className="w-6 h-6 text-red-500" />
//               <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
//             </div>
            
//             <p className="text-gray-700 mb-6">
//               Are you absolutely sure you want to delete your account? This action cannot be undone.
//               All your data, matches, and messages will be permanently deleted.
//             </p>
            
//             <div className="flex space-x-3">
//               <Button
//                 variant="destructive"
//                 onClick={handleDeleteAccount}
//                 className="flex-1"
//               >
//                 Yes, Delete Account
//               </Button>
//               <Button
//                 variant="outline"
//                 onClick={() => setShowDeleteConfirm(false)}
//                 className="flex-1"
//               >
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//       */}
      
//       <BottomNavigation />
//     </div>
//   );
// };

// export default ProfileEdit;



//*********************************************************
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BottomNavigation from "../components/BottomNavigation";

const ProfileEdit = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-pink-500"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-xl font-bold gradient-text">Edit Profile</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            🚧 Coming Soon
          </h2>
          <p className="text-gray-600">
            Profile editing features are under construction. Stay tuned!
          </p>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default ProfileEdit;

import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { User, GraduationCap, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

// These will be populated from the database
const colleges = [
  "University Institute of Technology (UIT)",
  "School of Information Technology (SoIT)",
  "School of Architecture (SoA)",
  "School of Nanotechnology (SoNT)",
  "School of Pharmaceutical Sciences (SoPS)"
];

const branches = [
  "Automobile Engineering",
  "Civil Engineering",
  "Computer Science & Engineering",
  "Electrical & Electronics Engineering",
  "Electronics & Communication Engineering",
  "Environmental Engineering",
  "Industrial Engineering & Management",
  "Industrial Production",
  "Information Technology",
  "Mechanical Engineering",
  "Petrochemical Engineering",
  "Master of Computer Applications (MCA)",
  "Structural Engineering",
  "Heat Power Engineering",
  "Power Systems",
  "CSE (PG)",
  "Digital Communications",
  "Computer Science and Business Systems",
  "AIML",
  "CSE (Data Sciences)",
  "Data Sciences (PG)",
  "Information Technology (PG)",
  "SoA",
  "SoPS"
];

const graduationYears = ["2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    college: '',
    branch: '',
    graduationYear: '',
    phone: '',
    acceptTerms: false
  });

  const [files, setFiles] = useState({
    profilePicture: null as File | null
    // ID card uploads currently disabled
    // idCardFront: null as File | null,
    // idCardBack: null as File | null
  });

  const [loading, setLoading] = useState(false);
  const { user, register } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const uploadToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      toast.error('You must accept the terms and conditions');
      return;
    }

    if (!files.profilePicture) {
      toast.error('Please upload your profile picture');
      return;
    }

    setLoading(true);

    try {
      // Upload profile image to server
      const profileImageUrl = await uploadToServer(files.profilePicture);
      
      // Use profile image as dummy ID card images (ID requirement currently paused)
      const idCardFrontUrl = profileImageUrl;
      const idCardBackUrl = profileImageUrl;

      // Register user with all data
      await register({
        ...formData,
        age: parseInt(formData.age),
        profileImageUrl,
        idCardFront: idCardFrontUrl,
        idCardBack: idCardBackUrl,
        acceptTerms: formData.acceptTerms
      });

      toast.success('Registration successful! Please wait for admin approval.');
      
      // Redirect to registration steps page
      navigate('/registration-steps');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Join RGPV Mates
            </CardTitle>
            <p className="text-gray-600">Create your account and start connecting</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="18"
                      max="100"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Academic Information
                </h3>
                
                <div>
                  <Label htmlFor="college">College *</Label>
                  <Select value={formData.college} onValueChange={(value) => handleInputChange('college', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college} value={college}>
                          {college}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="branch">Branch *</Label>
                  <Select value={formData.branch} onValueChange={(value) => handleInputChange('branch', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="graduationYear">Graduation Year *</Label>
                  <Select value={formData.graduationYear} onValueChange={(value) => handleInputChange('graduationYear', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select graduation year" />
                    </SelectTrigger>
                    <SelectContent>
                      {graduationYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Profile Picture Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Profile Picture
                </h3>
                
                <div>
                  <Label htmlFor="profilePicture">Profile Picture *</Label>
                  <Input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('profilePicture', e.target.files?.[0] || null)}
                    required
                  />
                </div>

                {/* ID Card uploads currently disabled
                <div>
                  <Label htmlFor="idCardFront">ID Card Front *</Label>
                  <Input
                    id="idCardFront"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('idCardFront', e.target.files?.[0] || null)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="idCardBack">ID Card Back *</Label>
                  <Input
                    id="idCardBack"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('idCardBack', e.target.files?.[0] || null)}
                    required
                  />
                </div>
                */}
              </div>

              {/* Terms and Notices */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Currently ₹99 premium requirement is waived off.
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>ID Card Requirement:</strong> Currently paused. Your profile picture will be used for verification purposes.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
                    required
                  />
                  <Label htmlFor="acceptTerms" className="text-sm">
                    I accept the{' '}
                    <Link to="/terms" className="text-pink-600 hover:text-pink-700 underline">
                      Terms and Conditions
                    </Link>
                    {' '}*
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-pink-600 hover:text-pink-700 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

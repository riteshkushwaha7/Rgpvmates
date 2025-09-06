import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

const profileSchema = z.object({
  age: z.number().min(18, "Must be at least 18 years old").max(30, "Must be under 30"),
  gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say"]),
  branch: z.enum([
    "computer-science",
    "mechanical-engineering", 
    "electrical-engineering",
    "civil-engineering",
    "electronics-communication",
    "information-technology",
    "chemical-engineering",
    "biotechnology"
  ]),
  year: z.enum(["1st", "2nd", "3rd", "4th"]),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio must be under 500 characters"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: 20,
      gender: "male",
      branch: "computer-science",
      year: "3rd",
      phone: "",
      bio: "",
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      await apiRequest("POST", "/api/profiles", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Created",
        description: "Your profile has been created successfully!",
      });
      setLocation("/verification");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    createProfileMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-rgpv-bg py-20">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-white rounded-2xl shadow-xl">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">👤</div>
            <CardTitle className="text-2xl font-bold text-gray-900">Complete Your Profile</CardTitle>
            <p className="text-gray-600 mt-2">Help others get to know you better</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-age"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-gender">
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-branch">
                              <SelectValue placeholder="Select Branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="computer-science">Computer Science</SelectItem>
                            <SelectItem value="mechanical-engineering">Mechanical Engineering</SelectItem>
                            <SelectItem value="electrical-engineering">Electrical Engineering</SelectItem>
                            <SelectItem value="civil-engineering">Civil Engineering</SelectItem>
                            <SelectItem value="electronics-communication">Electronics & Communication</SelectItem>
                            <SelectItem value="information-technology">Information Technology</SelectItem>
                            <SelectItem value="chemical-engineering">Chemical Engineering</SelectItem>
                            <SelectItem value="biotechnology">Biotechnology</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-year">
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1st">1st Year</SelectItem>
                            <SelectItem value="2nd">2nd Year</SelectItem>
                            <SelectItem value="3rd">3rd Year</SelectItem>
                            <SelectItem value="4th">4th Year</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel"
                          placeholder="+91 9876543210" 
                          {...field}
                          data-testid="input-phone"
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">Hidden until you match with someone</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4}
                          placeholder="Tell others about yourself, your hobbies, interests..."
                          {...field}
                          data-testid="textarea-bio"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={createProfileMutation.isPending}
                  className="w-full bg-rgpv-pink text-white py-3 rounded-lg font-semibold hover:bg-rgpv-dark transition-colors"
                  data-testid="button-continue-verification"
                >
                  {createProfileMutation.isPending ? "Creating Profile..." : "Continue to Payment"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

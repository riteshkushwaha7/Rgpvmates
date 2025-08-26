import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, CreditCard, AlertTriangle, Lightbulb, Clock } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Must be a valid email address"),
  issueType: z.enum(["profile", "payment", "abuse", "suggestion"]),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      issueType: "profile",
      subject: "",
      description: "",
      priority: "medium",
    },
  });

  const submitContactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Support Request Submitted",
        description: "We've received your request and will respond soon. Check your email for updates.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactForm) => {
    submitContactMutation.mutate(data);
  };

  const issueTypeIcons = {
    profile: User,
    payment: CreditCard,
    abuse: AlertTriangle,
    suggestion: Lightbulb,
  };

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">📞</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">
            We're here to help! Choose the category that best describes your issue.
          </p>
        </div>
        
        <Card className="bg-white rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Submit Support Request</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Issue Type */}
                <FormField
                  control={form.control}
                  name="issueType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of Issue</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-3"
                        >
                          <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:border-rgpv-pink transition-colors">
                            <RadioGroupItem value="profile" id="profile" data-testid="radio-profile" />
                            <label htmlFor="profile" className="flex items-center cursor-pointer">
                              <User className="text-rgpv-pink mr-2" size={20} />
                              <span>Profile/Account Issue</span>
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:border-rgpv-pink transition-colors">
                            <RadioGroupItem value="payment" id="payment" data-testid="radio-payment" />
                            <label htmlFor="payment" className="flex items-center cursor-pointer">
                              <CreditCard className="text-rgpv-pink mr-2" size={20} />
                              <span>Payment Issue</span>
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:border-rgpv-pink transition-colors">
                            <RadioGroupItem value="abuse" id="abuse" data-testid="radio-abuse" />
                            <label htmlFor="abuse" className="flex items-center cursor-pointer">
                              <AlertTriangle className="text-red-500 mr-2" size={20} />
                              <span>Report Abuse/Harassment</span>
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:border-rgpv-pink transition-colors">
                            <RadioGroupItem value="suggestion" id="suggestion" data-testid="radio-suggestion" />
                            <label htmlFor="suggestion" className="flex items-center cursor-pointer">
                              <Lightbulb className="text-yellow-500 mr-2" size={20} />
                              <span>Suggestion for Developer</span>
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* User Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your name" 
                            {...field}
                            data-testid="input-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="your.email@student.rgpv.ac.in" 
                            {...field}
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Subject */}
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Brief description of your issue" 
                          {...field}
                          data-testid="input-subject"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Detailed Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={6}
                          placeholder="Please provide as much detail as possible about your issue..."
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Priority Level */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-priority">
                            <SelectValue placeholder="Select priority level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low - General inquiry</SelectItem>
                          <SelectItem value="medium">Medium - Account issue</SelectItem>
                          <SelectItem value="high">High - Payment or technical problem</SelectItem>
                          <SelectItem value="urgent">Urgent - Safety or harassment issue</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={submitContactMutation.isPending}
                  className="w-full bg-rgpv-pink text-white py-3 rounded-lg font-semibold hover:bg-rgpv-dark transition-colors"
                  data-testid="button-submit-request"
                >
                  {submitContactMutation.isPending ? "Submitting..." : "Submit Support Request"}
                </Button>
              </form>
            </Form>
            
            {/* Expected Response Time */}
            <Card className="mt-8 bg-blue-50 border border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <Clock className="text-blue-500 mt-1 mr-3" size={20} />
                  <div>
                    <h4 className="font-medium text-blue-900">Expected Response Time</h4>
                    <div className="text-sm text-blue-700 mt-1 space-y-1">
                      <p>• General inquiries: 24-48 hours</p>
                      <p>• Account issues: 12-24 hours</p>
                      <p>• Payment problems: 6-12 hours</p>
                      <p>• Safety issues: Immediate (1-2 hours)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        
        <div className="text-center mt-8">
          <Button 
            onClick={() => window.history.back()}
            variant="ghost"
            className="text-rgpv-pink hover:underline"
            data-testid="button-go-back"
          >
            ← Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";
import * as LabelPrimitive from "@radix-ui/react-label";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { AlertTriangle, CreditCard, Lightbulb, User, CheckCircle2 } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

const Label = ({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) => {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
};

const issueTypeOptions = [
  { value: "profile", label: "Profile/Account Issue", icon: User },
  { value: "payment", label: "Payment Issue", icon: CreditCard },
  { value: "abuse", label: "Report Abuse/Harassment", icon: AlertTriangle },
  { value: "suggestion", label: "Suggestion for Developer", icon: Lightbulb },
];

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  issueType: string;
  subject: string;
  message: string;
  priority: string;
}

const ContactCard = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    issueType: "profile",
    subject: "",
    message: "",
    priority: "medium",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!formData.email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const emailWithPhone = `${formData.email} | Phone: ${formData.phone}`;

    
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: emailWithPhone,
          subject: formData.subject,
          message: formData.message,
          issueType: formData.issueType,
          priority: formData.priority,
        }),
      });

      if (response.ok) {
        toast.success("Message sent successfully!");
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          issueType: "profile",
          subject: "",
          message: "",
          priority: "medium",
        });
      } else {
        const err = await response.json();
        toast.error(err.error || "Failed to send message");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 w-full h-full font-grotesk">
      {/* Animate form → success card */}
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="md:w-[70%] h-full flex flex-col gap-4 px-4 py-4 bg-neutral-50 rounded-xl"
          >
            <div>
              <div className="font-semibold text-xl">Contact us</div>
              <div className="text-sm text-muted-foreground">
                We're here to help! Send us a message and we'll respond as soon as possible.
              </div>
            </div>

            <div className="flex gap-2 w-full mt-4">
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="email">Your Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="w-full flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                required
              />
            </div>

            <div className="flex flex-col md:flex-row w-full gap-2">
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="issueType">Type of Issue</Label>
                <Select value={formData.issueType} onValueChange={(v) => handleInputChange("issueType", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {issueTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => handleInputChange("priority", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="low">Low - General inquiry</SelectItem>
                        <SelectItem value="medium">Medium - Account issue</SelectItem>
                        <SelectItem value="high">High - Payment or technical problem</SelectItem>
                        <SelectItem value="urgent">Urgent - Safety or harassment issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="related to ..."
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Provide details..."
                rows={5}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-neutral-800 rounded-lg w-full hover:bg-neutral-700"
            >
              {loading ? "Sending..." : "Send"}
            </Button>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:w-[70%] h-full flex flex-col items-center justify-center gap-4 px-6 py-10 bg-green-50 rounded-xl text-center"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600" />
            <h2 className="text-xl font-semibold">Thank you!</h2>
            <p className="text-gray-600">Your message has been sent successfully. We'll get back to you soon.</p>
            <Button className="bg-neutral-800 shadow-sm text-neutral-100 font-bold hover:bg-neutral-700 py-2 px-6 rounded-xl" onClick={() => setSubmitted(false)}>Send Another</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="md:w-[30%] flex flex-col gap-4">
        <div className="bg-neutral-50 rounded-lg w-full px-4 py-4 flex flex-col gap-4">
          <div className="text-xl font-medium">Response Time</div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>General: 24-48h</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Account: 12-24h</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Payments: 6-12h</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Safety: 1-2h</span>
            </div>
          </div>
        </div>
        <div className="bg-neutral-50 rounded-lg w-full px-4 py-4 flex flex-col gap-4">
          <div className="text-xl font-medium">Join Our Team?</div>
          <div className="text-sm text-muted-foreground">
            Message us with subject <span className="italic">internship</span> and we’ll reach out soon.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;

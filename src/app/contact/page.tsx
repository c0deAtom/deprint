import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Contact Us</CardTitle>
          <CardDescription>We&apos;d love to hear from you. Fill out the form below or reach out to us directly.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Get in Touch</h2>
              <form className="space-y-4">
                <Input type="text" placeholder="Your Name" required />
                <Input type="email" placeholder="Your Email" required />
                <Textarea placeholder="Your Message" required rows={5} />
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Our Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <a href="mailto:contact@deprint.com" className="text-muted-foreground hover:text-blue-600">contact@deprint.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-muted-foreground">+91 9413314666</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-muted-foreground">mahima bellevista, Jnu Hosital Road, Ghati karolan, Jaipur, Rajasthan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
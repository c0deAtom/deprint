import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-base text-muted-foreground">
          <p className="font-semibold text-primary-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <p>Welcome to DePrint! These terms and conditions outline the rules and regulations for the use of DePrint&apos;s Website.</p>
          <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use DePrint if you do not agree to take all of the terms and conditions stated on this page.</p>
          
          <h2 className="text-2xl font-semibold text-primary-foreground border-b pb-2">1. Intellectual Property Rights</h2>
          <p>Other than the content you own, under these Terms, DePrint and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted limited license only for purposes of viewing the material contained on this Website.</p>

          <h2 className="text-2xl font-semibold text-primary-foreground border-b pb-2">2. User Accounts</h2>
          <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

          <h2 className="text-2xl font-semibold text-primary-foreground border-b pb-2">3. Products or Services</h2>
          <p>We reserve the right to limit the sales of our products or Services to any person, geographic region or jurisdiction. All descriptions of products or product pricing are subject to change at anytime without notice, at our sole discretion.</p>

          <h2 className="text-2xl font-semibold text-primary-foreground border-b pb-2">4. Governing Law</h2>
          <p>These Terms will be governed by and interpreted in accordance with the laws of the State of Rajasthan, India, and you submit to the non-exclusive jurisdiction of the state and federal courts located in Rajasthan for the resolution of any disputes.</p>
        </CardContent>
      </Card>
    </div>
  );
} 
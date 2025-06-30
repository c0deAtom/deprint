import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-base text-muted-foreground">
          <p className="font-semibold text-primary-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <p>Your privacy is important to us. It is DePrint&apos;s policy to respect your privacy regarding any information we may collect from you across our website.</p>

          <h2 className="text-2xl font-semibold text-primary-foreground border-b pb-2">1. Information We Collect</h2>
          <p>We only ask for personal information when we truly need it to provide a service to you, such as processing an order. This may include your name, email, shipping address, and payment information. We collect it by fair and lawful means, with your knowledge and consent.</p>
          
          <h2 className="text-2xl font-semibold text-primary-foreground border-b pb-2">2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, operate, and maintain our services, including to process your transactions, communicate with you, and prevent fraud.</p>
          
          <h2 className="text-2xl font-semibold text-primary-foreground border-b pb-2">3. Security of Your Personal Information</h2>
          <p>We retain collected information only for as long as necessary to provide you with your requested service. We protect this data within commercially acceptable means to prevent loss, theft, and unauthorized access.</p>

          <h2 className="text-2xl font-semibold text-primary-foreground border-b pb-2">4. Children&apos;s Privacy</h2>
          <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13.</p>

          <h2 className="text-2xl font-semibold text-primary-foreground border-b pb-2">5. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
        </CardContent>
      </Card>
    </div>
  );
} 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, PackageOpen, CircleHelp, MessageSquareHeart } from "lucide-react";

export default function ReturnPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Return & Refund Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-base text-muted-foreground">
          
          <div>
            <p className="font-semibold text-primary-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            <p>At DePrint, we want you to be completely satisfied with your purchase. If you have any issues with your order, please review our return policy below.</p>
          </div>

          <section className="space-y-4">
            <h2 className="flex items-center text-2xl font-semibold text-primary-foreground border-b pb-2">
              <ThumbsUp className="w-6 h-6 mr-3 text-blue-600" />
              30-Day Return Window
            </h2>
            <p>Our policy lasts for <strong>30 days</strong>. If 30 days have gone by since your purchase, unfortunately, we can&apos;t offer you a refund or exchange.</p>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center text-2xl font-semibold text-primary-foreground border-b pb-2">
              <PackageOpen className="w-6 h-6 mr-3 text-blue-600" />
              Eligibility for Returns
            </h2>
            <p>To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging. Customized or personalized items are generally not eligible for returns unless there is a defect in the product.</p>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center text-2xl font-semibold text-primary-foreground border-b pb-2">
              <CircleHelp className="w-6 h-6 mr-3 text-blue-600" />
              How to Initiate a Return
            </h2>
            <p>To initiate a return, please contact us at <a href="mailto:returns@deprint.com" className="text-blue-600 hover:underline">returns@deprint.com</a> with your order number and a description of the issue. We will provide you with instructions on how to proceed.</p>
          </section>
          
          <section className="space-y-4">
            <h2 className="flex items-center text-2xl font-semibold text-primary-foreground border-b pb-2">
              <MessageSquareHeart className="w-6 h-6 mr-3 text-blue-600" />
              Refunds
            </h2>
            <p>Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. If your return is approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within a certain number of days.</p>
          </section>

        </CardContent>
      </Card>
    </div>
  );
} 
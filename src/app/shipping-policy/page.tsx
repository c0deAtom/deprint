import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, Clock } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Shipping Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-base text-muted-foreground">
          
          <div>
            <p className="font-semibold text-primary-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            <p>Thank you for shopping at DePrint. Here is our shipping policy to explain how we process and ship your orders.</p>
          </div>

          <section className="space-y-4">
            <h2 className="flex items-center text-2xl font-semibold text-primary-foreground border-b pb-2">
              <Package className="w-6 h-6 mr-3 text-blue-600" />
              Order Processing Time
            </h2>
            <p>All orders are processed within <strong>1-3 business days</strong>. We do not ship or deliver on weekends or holidays.</p>
            <p>If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery. If there will be a significant delay in the shipment of your order, we will contact you via email.</p>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center text-2xl font-semibold text-primary-foreground border-b pb-2">
              <Truck className="w-6 h-6 mr-3 text-blue-600" />
              Shipping Rates & Delivery Estimates
            </h2>
            <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
            <p>Our standard delivery timeframe is <strong>5-7 business days</strong> from the date of shipment. Please note that delivery delays can occasionally occur.</p>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center text-2xl font-semibold text-primary-foreground border-b pb-2">
              <Clock className="w-6 h-6 mr-3 text-blue-600" />
              Shipment Confirmation & Order Tracking
            </h2>
            <p>You will receive a Shipment Confirmation email once your order has shipped, containing your tracking number(s). The tracking number will be active within 24 hours.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary-foreground border-b pb-2">
              Damages
            </h2>
            <p>DePrint is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim.</p>
            <p>Please save all packaging materials and damaged goods before filing a claim.</p>
          </section>

        </CardContent>
      </Card>
    </div>
  );
} 
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
      <Card className="w-full max-w-md p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold mb-2">Contact Us</h1>
        <form className="flex flex-col gap-4">
          <Input placeholder="Name" type="text" required />
          <Input placeholder="Email" type="email" required />
          <textarea placeholder="Message" className="border rounded px-3 py-2 min-h-[100px]" required />
          <Button type="submit" className="mt-2">Send Message</Button>
        </form>
      </Card>
    </main>
  );
} 
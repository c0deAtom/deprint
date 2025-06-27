"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugSessionPage() {
  const { data: session, status } = useSession();
  const [apiResponse, setApiResponse] = useState<object | null>(null);

  const testApi = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setApiResponse(data as object);
      console.log("API Response:", data);
    } catch (error) {
      console.error("API Error:", error);
      setApiResponse({ error: "API call failed" });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Session Debug</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Session exists:</strong> {session ? "Yes" : "No"}</p>
          <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testApi} className="mb-4">
            Test Profile API
          </Button>
          {apiResponse && (
            <pre className="p-4 bg-gray-100 rounded overflow-auto">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cookies</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Check browser dev tools &rarr; Application &rarr; Cookies for session cookies</p>
          <p>Look for cookies starting with &quot;next-auth&quot;</p>
        </CardContent>
      </Card>
    </div>
  );
} 
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Calendar, Edit, Save, X, Lock, ShoppingBag, Package, Settings } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

interface Address {
  line1: string;
  state: string;
  city: string;
  pincode: string;
  mobile: string;
}

interface ProfileForm {
  name: string;
  email: string;
  address: Address;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Local state for displaying user data (will be updated immediately)
  const [localUserData, setLocalUserData] = useState<{ name: string; email: string; address: Address }>({
    name: "",
    email: "",
    address: { line1: "", state: "", city: "", pincode: "", mobile: "" },
  });
  
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: "",
    email: "",
    address: { line1: "", state: "", city: "", pincode: "", mobile: "" },
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    // Fetch user profile to get structured address
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          const userData = {
            name: data.user?.name || "",
            email: data.user?.email || "",
            address: data.user?.address || { line1: "", state: "", city: "", pincode: "", mobile: "" },
          };
          setLocalUserData(userData);
          setProfileForm(userData);
        }
      } catch {
        // fallback to session
        const userData = {
          name: session.user?.name || "",
          email: session.user?.email || "",
          address: { line1: "", state: "", city: "", pincode: "", mobile: "" },
        };
        setLocalUserData(userData);
        setProfileForm(userData);
      }
    };
    fetchProfile();
  }, [session, status, router]);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    setProfileMessage(null);
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({
      ...profileForm,
      address: {
        ...profileForm.address,
        [e.target.name]: e.target.value,
      },
    });
    setProfileMessage(null);
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordMessage(null);
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
        
        // Update local state immediately for instant UI feedback
        if (data.user) {
          const updatedUserData = {
            name: data.user.name,
            email: data.user.email,
            address: data.user.address || { line1: "", state: "", city: "", pincode: "", mobile: "" },
          };
          setLocalUserData(updatedUserData);
          setProfileForm(updatedUserData);
        }
      } else {
        setProfileMessage({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch {
      setProfileMessage({ type: "error", text: "An error occurred while updating profile" });
    }
    setLoading(false);
  };

  const testSession = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      console.log("Session test response:", data);
      toast.info("Check console for session test results");
    } catch (error) {
      console.error("Session test error:", error);
      toast.error("Session test failed");
    }
  };

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters long" });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordMessage({ type: "error", text: data.error || "Failed to change password" });
      }
    } catch {
      setPasswordMessage({ type: "error", text: "An error occurred while changing password" });
    }
    setLoading(false);
  };

  const handleProfileCancel = () => {
    setProfileForm({
      name: localUserData.name,
      email: localUserData.email,
      address: localUserData.address,
    });
    setIsEditing(false);
  };

  if (status === "loading") {
    return (
      <main className="flex flex-col items-center py-12 px-4 min-h-screen">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <main className="flex flex-col items-center py-12 px-4 min-h-screen">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your profile details</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={handleProfileSave}
                          disabled={loading}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {loading ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleProfileCancel}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testSession}
                      className="flex items-center gap-2"
                    >
                      Test Session
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <Label htmlFor="name">Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileInputChange}
                          placeholder="Enter your name"
                        />
                      ) : (
                        <p className="text-sm font-medium">{localUserData.name || "Not provided"}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <Label htmlFor="email">Email</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileForm.email}
                          onChange={handleProfileInputChange}
                          placeholder="Enter your email"
                        />
                      ) : (
                        <p className="text-sm font-medium">{localUserData.email}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <Label>Member Since</Label>
                      <p className="text-sm font-medium">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <Label>Address</Label>
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="line1">Street / House</Label>
                            <Input
                              id="line1"
                              name="line1"
                              value={profileForm.address.line1}
                              onChange={handleAddressInputChange}
                              placeholder="Street, House No."
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              name="state"
                              value={profileForm.address.state}
                              onChange={handleAddressInputChange}
                              placeholder="State"
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              name="city"
                              value={profileForm.address.city}
                              onChange={handleAddressInputChange}
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input
                              id="pincode"
                              name="pincode"
                              value={profileForm.address.pincode}
                              onChange={handleAddressInputChange}
                              placeholder="Pincode"
                            />
                          </div>
                          <div>
                            <Label htmlFor="mobile">Mobile</Label>
                            <Input
                              id="mobile"
                              name="mobile"
                              value={profileForm.address.mobile}
                              onChange={handleAddressInputChange}
                              placeholder="Mobile Number"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-medium">
                          {localUserData.address.line1 && <div>{localUserData.address.line1}</div>}
                          {localUserData.address.city && <div>{localUserData.address.city}</div>}
                          {localUserData.address.state && <div>{localUserData.address.state}</div>}
                          {localUserData.address.pincode && <div>Pincode: {localUserData.address.pincode}</div>}
                          {localUserData.address.mobile && <div>Mobile: {localUserData.address.mobile}</div>}
                          {!localUserData.address.line1 && !localUserData.address.city && !localUserData.address.state && !localUserData.address.pincode && !localUserData.address.mobile && <div>Not provided</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {profileMessage && (
                  <div
                    className={`text-sm mb-2 ${
                      profileMessage.type === "error" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {profileMessage.text}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {passwordMessage && (
                  <div
                    className={`text-sm mb-2 ${
                      passwordMessage.type === "error" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {passwordMessage.text}
                  </div>
                )}
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={handlePasswordSave} disabled={loading} className="w-full">
                  {loading ? "Changing..." : "Change Password"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>View your order history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">View all your orders and track their status</p>
                  <Button asChild>
                    <Link href="/orders">View All Orders</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/orders">View Orders</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/cart">View Cart</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Privacy Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Notification Preferences
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/help">Help Center</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
} 
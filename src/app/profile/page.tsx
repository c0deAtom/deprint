"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Edit, Settings, Loader2, Pencil, Package } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

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
  phone?: string;
  address: Address;
  profilePhoto?: string;
}

interface OrderItem {
  id: string;
  product: { id: string; name: string; imageUrls: string[] };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  createdAt: string;
  total: number;
  items: OrderItem[];
  paymentStatus?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddressEditing, setIsAddressEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState<Crop>({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cropLoading, setCropLoading] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [addressErrors, setAddressErrors] = useState<{ [key: string]: string }>({});

  const cropImageRef = useRef<HTMLImageElement | null>(null);

  const [localUserData, setLocalUserData] = useState<{ name: string; email: string; phone?: string; address: Address; profilePhoto?: string }>({
    name: "",
    email: "",
    phone: "",
    address: { line1: "", state: "", city: "", pincode: "", mobile: "" },
    profilePhoto: undefined,
  });
  const [profileForm, setProfileForm] = useState<ProfileForm & { phone?: string; profilePhoto?: string }>({
    name: "",
    email: "",
    phone: "",
    address: { line1: "", state: "", city: "", pincode: "", mobile: "" },
    profilePhoto: undefined,
  });
  const [addressForm, setAddressForm] = useState<Address>({
    line1: "",
    state: "",
    city: "",
    pincode: "",
    mobile: "",
  });

  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [addressMessage, setAddressMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profileErrors, setProfileErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    // Fetch user profile to get structured address
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          const userData = {
            name: data.user?.name || "",
            email: data.user?.email || "",
            phone: (data.user as { phone?: string })?.phone || "",
            address: data.user?.address || { line1: "", state: "", city: "", pincode: "", mobile: "" },
            profilePhoto: (data.user as { profilePhoto?: string })?.profilePhoto || undefined,
          };
          setLocalUserData(userData);
          setProfileForm(userData);
          setAddressForm(userData.address);
        }
      } catch {
        // fallback to session
        const fallbackUserData = {
          name: session.user?.name || "",
          email: session.user?.email || "",
          phone: (session.user as { phone?: string })?.phone || "",
          address: { line1: "", state: "", city: "", pincode: "", mobile: "" },
          profilePhoto: (session.user as { profilePhoto?: string; image?: string })?.profilePhoto || (session.user as { image?: string })?.image || undefined,
        };
        setLocalUserData(fallbackUserData);
        setProfileForm(fallbackUserData);
        setAddressForm(fallbackUserData.address);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();

    // Fetch user orders for the Orders card
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const res = await fetch("/api/orders?limit=3");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        } else {
          setOrders([]);
        }
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [session, status, router]);

  useEffect(() => {
    if (!imageUrl || !crop.width || !crop.height) return;
    const img = document.getElementById('crop-image') as HTMLImageElement;
    if (!img) return;
    const getCroppedImg = async () => {
      const canvas = document.createElement('canvas');
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(
        img,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
      canvas.toBlob((blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          setCroppedImage(previewUrl);
        }
      }, 'image/jpeg', 1);
    };
    getCroppedImg();
  }, [crop, imageUrl]);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    setProfileMessage(null);
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value,
    });
    setAddressMessage(null);
  };

  const validateProfile = () => {
    const errors: { [key: string]: string } = {};
    if (!profileForm.name.trim()) errors.name = "Name is required";
    if (!profileForm.email.trim()) errors.email = "Email is required";
    if (!profileForm.phone?.trim()) errors.phone = "Phone is required";
    else if (!/^[0-9]{10}$/.test(profileForm.phone)) errors.phone = "Phone must be 10 digits";
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSave = async () => {
    if (!validateProfile()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profileForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
        if (data.user) {
          const updatedUserData = {
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || "",
            address: data.user.address || { line1: "", state: "", city: "", pincode: "", mobile: "" },
            profilePhoto: data.user.profilePhoto || undefined,
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

  const validateAddress = () => {
    const errors: { [key: string]: string } = {};
    if (!addressForm.line1.trim()) errors.line1 = "Street/House is required";
    if (!addressForm.city.trim()) errors.city = "City is required";
    if (!addressForm.state.trim()) errors.state = "State is required";
    if (!addressForm.pincode.trim()) errors.pincode = "Pincode is required";
    else if (!/^[0-9]{6}$/.test(addressForm.pincode)) errors.pincode = "Pincode must be 6 digits";
    if (!addressForm.mobile.trim()) errors.mobile = "Mobile is required";
    else if (!/^[0-9]{10}$/.test(addressForm.mobile)) errors.mobile = "Mobile must be 10 digits";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddressSave = async () => {
    if (!validateAddress()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: localUserData.name,
          email: localUserData.email,
          phone: localUserData.phone,
          address: addressForm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddressMessage({ type: "success", text: "Address updated successfully!" });
        setIsAddressEditing(false);
        if (data.user) {
          const updatedUserData = {
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || "",
            address: data.user.address || { line1: "", state: "", city: "", pincode: "", mobile: "" },
            profilePhoto: data.user.profilePhoto || undefined,
          };
          setLocalUserData(updatedUserData);
          setAddressForm(updatedUserData.address);
        }
      } else {
        setAddressMessage({ type: "error", text: data.error || "Failed to update address" });
      }
    } catch {
      setAddressMessage({ type: "error", text: "An error occurred while updating address" });
    }
    setLoading(false);
  };

  const handleAddressCancel = () => {
    setAddressForm(localUserData.address);
    setIsAddressEditing(false);
    setAddressMessage(null);
  };

  const handleProfilePhotoUpload = async (urls: string[]) => {
    if (!urls[0]) return;
    setProfileForm((prev) => ({ ...prev, profilePhoto: urls[0] }));
    setLocalUserData((prev) => ({ ...prev, profilePhoto: urls[0] }));
    setProfileMessage(null);
    // Save to backend
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profileForm,
          profilePhoto: urls[0],
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setLocalUserData((prev) => ({ ...prev, profilePhoto: data.user.profilePhoto }));
        setProfileForm((prev) => ({ ...prev, profilePhoto: data.user.profilePhoto }));
        toast.success("Profile photo updated!");
      } else {
        toast.error(data.error || "Failed to update profile photo");
      }
    } catch {
      toast.error("Failed to update profile photo");
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setShowCropModal(true);
    }
  };

  const handleCropImageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const minDim = Math.min(width, height);
    const maxCrop = Math.min(minDim * 0.8, 400); // 80% of min dimension or 400px max
    const crop = {
      unit: 'px' as const,
      x: Math.round((width - maxCrop) / 2),
      y: Math.round((height - maxCrop) / 2),
      width: Math.round(maxCrop),
      height: Math.round(maxCrop),
    };
    setCrop(crop);
    // Generate preview immediately
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          img,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );
        canvas.toBlob((blob) => {
          if (blob) {
            const previewUrl = URL.createObjectURL(blob);
            setCroppedImage(previewUrl);
          }
        }, 'image/jpeg', 1);
      }
    }, 100);
  };

  const getCroppedImg = async (image: HTMLImageElement, crop: Crop): Promise<Blob | null> => {
    if (!crop.width || !crop.height) return null;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 1);
    });
  };

  const handleCropSave = async () => {
    setCropLoading(true);
    const img = document.getElementById('crop-image') as HTMLImageElement;
    if (!img) return;
    const croppedBlob = await getCroppedImg(img, crop);
    if (!croppedBlob) {
      setCropLoading(false);
      return;
    }
    // Show preview
    const previewUrl = URL.createObjectURL(croppedBlob);
    setCroppedImage(previewUrl);
    // Upload to Cloudinary via /api/upload
    const formData = new FormData();
    formData.append('images', croppedBlob, 'profile.jpg');
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        if (data.imageUrls && data.imageUrls[0]) {
          await handleProfilePhotoUpload([data.imageUrls[0]]);
          setShowCropModal(false);
          setImageUrl(null);
          setCroppedImage(null);
        }
      } else {
        toast.error('Failed to upload cropped image');
      }
    } catch {
      toast.error('Failed to upload cropped image');
    } finally {
      setCropLoading(false);
    }
  };

  const handleProfileCancel = () => {
    setProfileForm({
      name: localUserData.name,
      email: localUserData.email,
      phone: localUserData.phone,
      address: localUserData.address,
      profilePhoto: localUserData.profilePhoto,
    });
    setIsEditing(false);
  };

  if (status === "loading") {
    return (
      <main className="flex flex-col items-center px-4 min-h-screen py-10">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Left Card: Avatar and Name Skeleton */}
          <Card className="flex flex-col items-center p-6 md:col-span-1">
            <div className="relative group mb-4">
              <Skeleton className="h-32 w-32 rounded-full mb-4" />
            </div>
            <div className="text-center w-full">
              <Skeleton className="h-8 w-32 mb-2 mx-auto" />
              <Skeleton className="h-4 w-40 mb-4 mx-auto" />
            </div>
          </Card>
          {/* Right Card: Personal Info Skeleton */}
          <Card className="p-6 md:col-span-2 flex flex-col justify-between">
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-1" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-1" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-1" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-24" />
            </div>
          </Card>
        </div>
        {/* Below the dashboard cards, Address and Orders Skeletons */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Address Card Skeleton */}
          <Card className="p-6 flex flex-col justify-between">
            <div className="mb-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-24" />
            </div>
          </Card>
          {/* Orders Card Skeleton */}
          <Card className="p-6 flex flex-col justify-between">
            <div className="mb-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Skeleton className="w-12 h-12 rounded" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Skeleton className="h-8 w-24" />
          </div>
          </Card>
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <main className="flex flex-col items-center px-4 py-10 min-h-screen">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Left Card: Avatar and Name */}
        <Card className="flex flex-col items-center p-6 md:col-span-1">
          <div className="relative group mb-4">
            <Avatar className="h-32 w-32">
              {localUserData.profilePhoto ? (
                <AvatarImage src={localUserData.profilePhoto} alt="Profile Photo" />
              ) : (
                <AvatarFallback className="text-4xl">{localUserData.name?.[0] || localUserData.email?.[0] || "U"}</AvatarFallback>
              )}
            </Avatar>
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow group-hover:scale-110 transition-transform border border-gray-200"
              onClick={() => document.getElementById('profile-photo-input')?.click()}
              aria-label="Edit profile photo"
            >
              <Pencil className="w-6 h-6 text-blue-600" />
            </button>
                  </div>
          <div className="text-center w-full">
            <div className="text-2xl font-bold mb-1">{localUserData.name || <span className="text-muted-foreground">No name</span>}</div>
            <div className="text-sm text-muted-foreground mb-4">{localUserData.email}</div>
                </div>
        </Card>
        {/* Right Card: Personal Info */}
        <Card className="p-6 md:col-span-2 flex flex-col justify-between">
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <div className="text-xs text-muted-foreground">Full Name</div>
                      {isEditing ? (
                  <>
                        <Input
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileInputChange}
                      placeholder="Full Name"
                      className={profileErrors.name ? "mb-1 border-red-500 focus:border-red-500" : "mb-1"}
                    />
                    {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name}</p>}
                  </>
                ) : (
                  <div className="text-base font-medium">{localUserData.name || <span className="text-muted-foreground">Not provided</span>}</div>
                      )}
                    </div>
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                      {isEditing ? (
                  <>
                        <Input
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileInputChange}
                      placeholder="Email"
                      className={profileErrors.email ? "mb-1 border-red-500 focus:border-red-500" : "mb-1"}
                    />
                    {profileErrors.email && <p className="text-red-500 text-xs mt-1">{profileErrors.email}</p>}
                  </>
                ) : (
                  <div className="text-base font-medium">{localUserData.email}</div>
                )}
              </div>
                  <div>
                <div className="text-xs text-muted-foreground">Phone</div>
                {isEditing ? (
                  <>
                        <Input
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileInputChange}
                      placeholder="Phone"
                      className={profileErrors.phone ? "mb-1 border-red-500 focus:border-red-500" : "mb-1"}
                    />
                    {profileErrors.phone && <p className="text-red-500 text-xs mt-1">{profileErrors.phone}</p>}
                  </>
                ) : (
                  <div className="text-base font-medium">
                    {localUserData.phone ? `+91 ${localUserData.phone}` : <span className="text-muted-foreground">Not provided</span>}
                  </div>
                      )}
                    </div>
                  </div>
            {profileMessage && (
              <div className={`text-sm mt-2 ${profileMessage.type === "error" ? "text-red-600" : "text-green-600"}`}>{profileMessage.text}</div>
                      )}
                    </div>
          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleProfileSave} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
                <Button variant="outline" size="sm" onClick={handleProfileCancel}>Cancel</Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
                      )}
                    </div>
        </Card>
      </div>
      {/* Below the dashboard cards, add Address and Orders cards */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        {/* Address Card */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="mb-4">
            <div className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Settings className="h-5 w-5" /> Address
                  </div>
                      {isAddressEditing ? (
                <div className="space-y-2 flex flex-col gap-2">
                <div>
                  <Label htmlFor="line1">Street / House</Label>
                  <Input id="line1" name="line1" value={addressForm.line1} onChange={handleAddressInputChange} placeholder="Street / House" className={addressErrors.line1 ? "border-red-500 focus:border-red-500" : "mb-1"} />
                  {addressErrors.line1 && <p className="text-red-500 text-xs mt-1">{addressErrors.line1}</p>}
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={addressForm.city} onChange={handleAddressInputChange} placeholder="City" className={addressErrors.city ? "border-red-500 focus:border-red-500" : ""} />
                  {addressErrors.city && <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>}
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={addressForm.state} onChange={handleAddressInputChange} placeholder="State" className={addressErrors.state ? "border-red-500 focus:border-red-500" : ""} />
                  {addressErrors.state && <p className="text-red-500 text-xs mt-1">{addressErrors.state}</p>}
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" name="pincode" value={addressForm.pincode} onChange={handleAddressInputChange} placeholder="Pincode" className={addressErrors.pincode ? "border-red-500 focus:border-red-500" : ""} />
                  {addressErrors.pincode && <p className="text-red-500 text-xs mt-1">{addressErrors.pincode}</p>}
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input id="mobile" name="mobile" value={addressForm.mobile} onChange={handleAddressInputChange} placeholder="Mobile" className={addressErrors.mobile ? "border-red-500 focus:border-red-500" : ""} />
                  {addressErrors.mobile && <p className="text-red-500 text-xs mt-1">{addressErrors.mobile}</p>}
                </div>
                {addressMessage && (
                  <div className={`text-sm ${addressMessage.type === "error" ? "text-red-600" : "text-green-600"}`}>{addressMessage.text}</div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <div><span className="text-xs text-muted-foreground">Street / House:</span> <span className="font-medium">{localUserData.address.line1 || <span className="text-muted-foreground">Not provided</span>}</span></div>
                <div><span className="text-xs text-muted-foreground">City:</span> <span className="font-medium">{localUserData.address.city || <span className="text-muted-foreground">Not provided</span>}</span></div>
                <div><span className="text-xs text-muted-foreground">State:</span> <span className="font-medium">{localUserData.address.state || <span className="text-muted-foreground">Not provided</span>}</span></div>
                <div><span className="text-xs text-muted-foreground">Pincode:</span> <span className="font-medium">{localUserData.address.pincode || <span className="text-muted-foreground">Not provided</span>}</span></div>
                <div><span className="text-xs text-muted-foreground">Mobile:</span> <span className="font-medium">{localUserData.address.mobile || <span className="text-muted-foreground">Not provided</span>}</span></div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            {isAddressEditing ? (
              <>
                <Button size="sm" onClick={handleAddressSave} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
                <Button variant="outline" size="sm" onClick={handleAddressCancel}>Cancel</Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsAddressEditing(true)}>
                <Edit className="h-4 w-4 mr-2" /> Edit Address
              </Button>
            )}
          </div>
        </Card>
        {/* Orders Card */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="mb-4">
            <div className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Package className="h-5 w-5" /> Orders
            </div>
            {ordersLoading ? (
              <div className="text-muted-foreground">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-muted-foreground">No orders found.</div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: Order) => {
                  const isPaid = order.status === 'DELIVERED' || order.paymentStatus === 'PAID';
                  return (
                    <Card key={order.id} className="bg-muted/50 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-sm">Order #{order.id}</div>
                        <Badge className="ml-2">{order.status}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">Total: ₹{order.total.toFixed(2)}</div>
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item: OrderItem) => {
                          const productContent = (
                            <>
                              {Array.isArray(item.product.imageUrls) && item.product.imageUrls.length > 0 && (
                                <Image src={item.product.imageUrls[0]} alt={item.product.name} width={32} height={32} className="object-cover rounded" />
                              )}
                              <span className="font-medium text-xs">{item.product.name}</span>
                              <span className="text-xs">×{item.quantity}</span>
                            </>
                          );
                          return isPaid ? (
                            <Link
                              key={item.id}
                              href={`/products/${item.product.id}`}
                              className="flex items-center gap-2 border rounded px-2 py-1 hover:bg-muted transition-colors"
                              title={item.product.name}
                            >
                              {productContent}
                            </Link>
                          ) : (
                            <div key={item.id} className="flex items-center gap-2 border rounded px-2 py-1 opacity-60 cursor-not-allowed" title={item.product.name}>
                              {productContent}
                            </div>
                          );
                        })}
                        {order.items.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{order.items.length - 3} more</span>
                        )}
                      </div>
                      <div className="flex justify-end mt-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/orders/${order.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex justify-end">
                  <Button asChild>
                    <Link href="/orders">View All Orders</Link>
                  </Button>
                </div>
          </Card>
      </div>
    
      {/* Crop Modal */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crop and set profile photo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {!imageUrl && (
              <input type="file" accept="image/*" onChange={onSelectFile} className="w-full" />
            )}
            {imageUrl && (
              <>
                <ReactCrop
                  crop={crop}
                  onChange={setCrop}
                  aspect={1}
                  circularCrop
                >
                  <Image
                    id="crop-image"
                    ref={cropImageRef}
                    src={imageUrl}
                    alt="Crop"
                    width={256}
                    height={256}
                    onLoad={handleCropImageLoaded}
                    style={{ maxWidth: '100%', maxHeight: '16rem', width: 'auto', height: 'auto', display: 'block', margin: '0 auto' }}
                    className="rounded-full"
                  />
                </ReactCrop>
                {croppedImage && (
                  <div className="flex flex-col items-center mt-4">
                    <span className="text-xs text-muted-foreground mb-1">Preview</span>
                    <Image src={croppedImage} alt="Cropped Preview" width={96} height={96} className="h-24 w-24 rounded-full border" />
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCropModal(false)} disabled={cropLoading}>Cancel</Button>
            <Button onClick={handleCropSave} disabled={cropLoading || !imageUrl}>
              {cropLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Hidden file input for profile photo selection */}
      <input id="profile-photo-input" type="file" accept="image/*" className="hidden" onChange={onSelectFile} />
    </main>
  );
} 
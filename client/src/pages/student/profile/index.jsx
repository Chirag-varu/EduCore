import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import LinksEditor from "@/components/profile/LinksEditor";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateStudentBasicProfileService, deleteStudentAccountService } from "@/services";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

function getInitials(name) {
  if (!name) return "U";
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0] || "U";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase();
}

export default function ProfilePage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState(auth?.user?.userName || "");
  const [avatarPreview, setAvatarPreview] = useState(auth?.user?.avatarUrl || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = "Profile — EduCore";
  }, []);

  const user = auth?.user || {};

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Basic validation
    const valid = ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type);
    const under2MB = file.size <= 2 * 1024 * 1024;
    if (!valid || !under2MB) {
      toast({ title: "Invalid image", description: "Use JPG/PNG/WebP under 2MB.", variant: "destructive" });
      return;
    }
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const onSaveBasic = async () => {
    try {
      if (!name || name.trim().length < 2) {
        toast({ title: "Name too short", description: "Enter at least 2 characters.", variant: "destructive" });
        return;
      }
      setSaving(true);
      const res = await updateStudentBasicProfileService({ userName: name.trim(), avatarFile });
      if (res?.success) {
        if (res?.data?.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        toast({ title: "Saved", description: "Profile updated." });
      } else {
        toast({ title: "Failed", description: res?.message || "Could not update profile.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 overflow-hidden">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt={name || "Avatar"} />
              ) : null}
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(user?.userName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xl font-bold leading-tight h-10"
                aria-label="Your name"
              />
              {user?.userEmail ? (
                <p className="text-sm text-muted-foreground">{user.userEmail}</p>
              ) : null}
              {user?.role ? (
                <p className="text-xs mt-1 px-2 py-0.5 rounded bg-muted inline-block">
                  {user.role}
                </p>
              ) : null}
            </div>
          </div>

          {/* Avatar upload */}
          <div className="mt-4 flex items-center gap-3">
            <Input type="file" accept="image/*" onChange={onAvatarChange} className="max-w-xs" />
            <Button onClick={onSaveBasic} disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">My learning</span>
              <Button variant="ghost" size="sm" onClick={() => navigate("/student-courses")}>Open</Button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Cart</span>
              <Button variant="ghost" size="sm" onClick={() => navigate("/cart")}>Open</Button>
            </div>
          </div>

          <Separator className="my-6" />

          <LinksEditor />

          <Separator className="my-6" />

          {/* Delete Account Section */}
          <div className="space-y-3">
            {/* <h3 className="text-sm font-medium text-destructive">Danger Zone</h3> */}
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div>
                <p className="text-sm font-medium">Delete Account</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={deleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleting ? "Deleting..." : "Delete Account"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data including (this can'not be undone):
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Your enrolled courses and progress</li>
                        <li>Your certificates</li>
                        <li>Your cart items and order history</li>
                        <li>Your comments and chat messages</li>
                        <li>Your quiz attempts and assignments</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={async () => {
                        setDeleting(true);
                        try {
                          const res = await deleteStudentAccountService();
                          if (res?.success) {
                            toast({
                              title: "Account Deleted",
                              description: "Your account has been permanently deleted.",
                            });
                            // Clear local storage and redirect to home
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            sessionStorage.removeItem("accessToken");
                            navigate("/", { replace: true });
                            window.location.reload();
                          } else {
                            toast({
                              title: "Failed",
                              description: res?.message || "Could not delete account.",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: error.message || "Something went wrong.",
                            variant: "destructive",
                          });
                        } finally {
                          setDeleting(false);
                        }
                      }}
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

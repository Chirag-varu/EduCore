import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import LinksEditor from "@/components/profile/LinksEditor";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    document.title = "Profile — EduCore";
  }, []);

  const user = auth?.user || {};

  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(user?.userName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold leading-tight">
                {user?.userName || "User"}
              </h1>
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
        </CardContent>
      </Card>
    </div>
  );
}

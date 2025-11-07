import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateStudentProfileLinksService } from "@/services";

const initialLinks = {
  website: "",
  facebookUsername: "",
  instagramUsername: "",
  linkedinUrl: "",
  tiktokUsername: "",
  xUsername: "",
  youtubeUsername: "",
};

function PrefixInput({ prefix, id, value, onChange, placeholder }) {
  return (
    <div className="flex gap-2">
      {prefix ? (
        <div className="inline-flex items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground select-none">
          {prefix}
        </div>
      ) : null}
      <Input id={id} value={value} placeholder={placeholder} onChange={onChange} />
    </div>
  );
}

export default function LinksEditor() {
  const [links, setLinks] = useState(initialLinks);
  const { toast } = useToast();

  useEffect(() => {
    // Prefill from localStorage user if present
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.links) setLinks({ ...initialLinks, ...user.links });
    } catch (_) {}
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await updateStudentProfileLinksService(links);
      if (res?.success) {
        if (res?.data?.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        toast({ title: "✅ Saved", description: "Your links have been updated." });
      } else {
        toast({ title: "❌ Failed", description: res?.message || "Unable to save.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "❌ Error", description: error.message || "Something went wrong.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold">Links</h2>
      <form className="space-y-6" onSubmit={handleSave}>
        <div className="space-y-2">
          <Label htmlFor="website">Website (http(s)://..)</Label>
          <Input
            id="website"
            placeholder="https://example.com"
            value={links.website}
            onChange={(e) => setLinks({ ...links, website: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="facebook">facebook.com/</Label>
          <PrefixInput
            prefix="facebook.com/"
            id="facebook"
            placeholder="Username"
            value={links.facebookUsername}
            onChange={(e) => setLinks({ ...links, facebookUsername: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Input your Facebook username (e.g. johnsmith).</p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="instagram">instagram.com/</Label>
          <PrefixInput
            prefix="instagram.com/"
            id="instagram"
            placeholder="Username"
            value={links.instagramUsername}
            onChange={(e) => setLinks({ ...links, instagramUsername: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Input your Instagram username (e.g. johnsmith).</p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="linkedin">linkedin.com/</Label>
          <PrefixInput
            prefix="linkedin.com/"
            id="linkedin"
            placeholder="Public Profile URL"
            value={links.linkedinUrl}
            onChange={(e) => setLinks({ ...links, linkedinUrl: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Input your LinkedIn public profile URL (e.g. in/johnsmith, company/udemy).</p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="tiktok">tiktok.com/</Label>
          <PrefixInput
            prefix="tiktok.com/"
            id="tiktok"
            placeholder="@Username"
            value={links.tiktokUsername}
            onChange={(e) => setLinks({ ...links, tiktokUsername: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Input your TikTok username (e.g. @johnsmith).</p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="x">x.com/</Label>
          <PrefixInput
            prefix="x.com/"
            id="x"
            placeholder="Username"
            value={links.xUsername}
            onChange={(e) => setLinks({ ...links, xUsername: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Add your X username (e.g. johnsmith).</p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="youtube">youtube.com/</Label>
          <PrefixInput
            prefix="youtube.com/"
            id="youtube"
            placeholder="Username"
            value={links.youtubeUsername}
            onChange={(e) => setLinks({ ...links, youtubeUsername: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Input your Youtube username (e.g. johnsmith).</p>
        </div>

        <Button type="submit" className="mt-2">Save</Button>
      </form>
    </div>
  );
}

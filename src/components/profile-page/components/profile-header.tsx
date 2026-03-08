import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Camera, Mail, Shield, User } from "lucide-react";

export default function ProfileHeader(user: any) {
  const initials =
    `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <Card className="overflow-hidden border border-border/60 shadow-sm mb-4">
      {/* Banner */}
      <div
        className="h-28 w-full"
        style={{
          background:
            "linear-gradient(135deg, hsl(213 51% 46%) 0%, hsl(213 51% 32%) 60%, hsl(213 51% 22%) 100%)",
        }}
      >
        {/* subtle dot pattern overlay */}
        <div
          className="h-full w-full opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <CardContent className="px-6 pb-6">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="relative">
            <div className="rounded-full p-1 bg-background shadow-md ring-2 ring-background">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src="https://bundui-images.netlify.app/avatars/08.png"
                  alt="Profile"
                />
                <AvatarFallback className="text-base font-semibold bg-primary/10 text-primary">
                  {initials || <User className="size-6" />}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {user?.role && (
            <Badge
              variant="secondary"
              className="text-xs font-medium gap-1 px-2 py-0.5"
            >
              <Shield className="size-3" />
              {user.role}
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="space-y-3">
          {/* Name + role badge */}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground leading-none">
              {user?.first_name} {user?.last_name}
            </h1>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {user?.email && (
              <span className="flex items-center gap-1.5 min-w-0">
                <Mail className="size-3.5 shrink-0 text-primary/70" />
                <span className="truncate">{user.email}</span>
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Camera, Calendar, Mail, MapPin } from "lucide-react";

export default function ProfileHeader(user: any) {
  console.log(user);
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src="https://bundui-images.netlify.app/avatars/08.png"
                alt="Profile"
              />
              <AvatarFallback className="text-2xl">
                {user&&user?.first_name?.toUpperCase()}
                {user&&user?.last_name?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="outline"
              className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full"
            >
          
            </Button>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold">{user?.first_name} {user?.last_name}</h1>
              <Badge variant="secondary">{user?.role}</Badge>
            </div>
            <p className="text-muted-foreground">{user?.role}</p>
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Mail className="size-4" />
                {user?.email}
              </div>
              
            </div>
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
}

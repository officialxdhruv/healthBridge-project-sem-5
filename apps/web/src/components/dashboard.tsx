import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@healthbridge/ui/components/ui/avatar";
import { Button } from "@healthbridge/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@healthbridge/ui/components/ui/dropdown-menu";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { CalendarRange } from "lucide-react";
import { toast } from "sonner";
import { useLogoutMutation, useMeQuery } from "../lib/user.ts";
import { Footer } from "./Footer.tsx";

function Navbar() {
  const navigate = useNavigate();
  const { data } = useMeQuery();
  const logoutMutation = useLogoutMutation();

  const user = data?.user;
  const isLoggedIn = !!user;
  const name = user?.name ?? null;
  const image = user?.image ?? null;

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // clear locally even if server fails — handled in mutation
    }
    navigate({ to: "/login" });
    toast.success("Logged out successfully");
  };

  const linkCls =
    "transition-colors text-muted-foreground hover:text-foreground";

  return (
    <header className="border-b py-2">
      <nav className="container flex items-center justify-between text-sm font-medium">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <CalendarRange className="size-6" />
          <span className="hidden text-xl md:block">HealthBridge</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            to="/doctors"
            className={linkCls}
            activeProps={{ className: "text-foreground" }}
          >
            Doctors
          </Link>
          <Link
            to="/about"
            className={linkCls}
            activeProps={{ className: "text-foreground" }}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={linkCls}
            activeProps={{ className: "text-foreground" }}
          >
            Contact
          </Link>
        </div>
        <div>
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                nativeButton={false}
                render={
                  <Avatar className="size-8 cursor-pointer">
                    <AvatarImage src={image || undefined} alt={name ?? ""} />
                    <AvatarFallback>
                      {(name ?? "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/profile" })}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/my-appointments" })}
                  >
                    Appointments
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate({ to: "/login" })}>
              Create Account
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}

export function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container flex-1">
        <Outlet />
        <Footer />
      </main>
    </div>
  );
}

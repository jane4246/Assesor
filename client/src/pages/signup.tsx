import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-2xl font-bold text-center">Create a Free Account</h2>
          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-md border px-4 py-2"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-md border px-4 py-2"
          />
          <Button className="w-full">Create Account</Button>
          <p className="text-xs text-muted-foreground text-center">
            No payment required to sign up.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

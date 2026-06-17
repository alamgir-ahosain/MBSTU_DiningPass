import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AuthShell } from "./LoginPage";

export default function RegistrationPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    studentId: "",
    fullName: "",
    email: "",
    password: "",
    hallShortName: "",
    roomNumber: "",
    department: "",
    gender: "MALE" as "MALE" | "FEMALE",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Student registration only. Hall admins are created by the university."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              required
              placeholder="CE21012"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={form.gender}
              onValueChange={(v) => setForm({ ...form, gender: v as "MALE" | "FEMALE" })}
            >
              <SelectTrigger id="gender"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            required
            minLength={2}
            maxLength={100}
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">University Email</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="name@mbstu.ac.bd"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="hallShortName">Hall</Label>
            <Input
              id="hallShortName"
              required
              placeholder="JAMH"
              value={form.hallShortName}
              onChange={(e) => setForm({ ...form, hallShortName: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room">Room No. (optional)</Label>
            <Input
              id="room"
              value={form.roomNumber}
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            required
            placeholder="CSE"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value.toUpperCase() })}
          />
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <div className="mt-6 text-sm text-center text-muted-foreground">
        Already registered?{" "}
        <Link to="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </AuthShell>
  );
}
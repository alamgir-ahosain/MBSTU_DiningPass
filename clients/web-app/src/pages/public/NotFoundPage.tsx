// src/pages/NotFoundPage.tsx
import { useNavigate, Link } from "react-router-dom";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
    const navigate = useNavigate();
    return (
        <AppShell>
            <div>
                <PageHeader title="404" subtitle="Page not found." />
                <div className="max-w-lg mx-auto rounded-2xl border border-border bg-card p-8 shadow-academic text-center">
                    <h2 className="font-display text-2xl">This page doesn't exist</h2>
                    <p className="text-muted-foreground mt-1">
                        The page you're looking for may have been moved or removed.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6">
                        <Button onClick={() => navigate(-1)} className="gap-2">
                            <ArrowLeft className="size-4" /> Go Back
                        </Button>
                        <Button asChild variant="outline" className="gap-2">
                            <Link to="/dashboard"><Home className="size-4" /> Dashboard</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
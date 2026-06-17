import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, QrCode, Smartphone, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BhashaniQuote } from "@/components/BhashaniQuote";
import { HallGallery } from "@/components/HallGallery";
import { ThemeToggle } from "@/lib/theme"
import logo from "@/assets/logo.jpeg"



export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container mx-auto px-4 flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 grid place-items-center overflow-hidden">
              <img src={logo} alt="MBSTU logo" className="size-7 object-contain" />
            </div>
            <div className="leading-tight">
              <div className="text-lg font-bold">MBSTU DiningPass</div>
              <div className="text-xs text-muted-foreground">Residential Hall Meal System</div>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            {/* <Button asChild variant="ghost">   <Link to="/login">Login</Link> </Button> */}
            {/* <Button asChild>   <Link to="/register">Register</Link> </Button> */}
          </nav>



        </div>
      </header>

      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-semibold border border-primary/30 rounded-full px-3 py-1 mb-6">
              <span className="size-1.5 rounded-full bg-primary" />
              Mawlana Bhashani Science &amp; Technology University
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Cut your hall meal token <span className="text-primary">online.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Skip the queue at the dining counter. Book lunch and dinner from your phone, pay
              securely via bKash, and present your QR token at the hall.
            </p>~
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/register">
                  Create student account <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
            <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
              {[
                "Approved by hall administration",
                "Single-use QR per meal",
                "Refundable via bKash",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl border border-border bg-card shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Today's Lunch
                  </div>
                  <div className="text-2xl font-bold">Rice · Beef · Dal</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Price</div>
                  <div className="text-2xl font-bold">৳55</div>
                </div>
              </div>
              <div className="mt-6 grid place-items-center bg-muted/40 rounded-xl py-8">
                <div className="size-44 bg-foreground/90 grid place-items-center rounded-md p-4">
                  <QrCode className="size-full text-background" />
                </div>
                <div className="mt-3 text-xs text-muted-foreground">Show this at the counter</div>
              </div>
              <div className="mt-4 grid grid-cols-3 text-center text-xs">
                <div>
                  <div className="font-semibold">JAMH</div>
                  <div className="text-muted-foreground">Hall</div>
                </div>
                <div>
                  <div className="font-semibold">CE21012</div>
                  <div className="text-muted-foreground">Student ID</div>
                </div>
                <div>
                  <div className="font-semibold text-primary">APPROVED</div>
                  <div className="text-muted-foreground">Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="container mx-auto px-4 py-10 flex justify-center">
          <BhashaniQuote className="max-w-2xl text-center" />
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-bold">Our residential halls</h2>
          <p className="text-muted-foreground mt-2">
            Seven halls serving thousands of students every day.
          </p>
        </div>
        <HallGallery className="max-w-4xl mx-auto" />
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold">How it works</h2>
          <p className="text-muted-foreground mt-2">
            Three steps from your room to the dining hall.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Utensils,
              title: "1. Choose your meal",
              text: "Browse today's lunch & dinner menu posted by your hall administration.",
            },
            {
              icon: Smartphone,
              title: "2. Pay via bKash",
              text: "Secure payment in seconds. No screenshots, no manual approval required.",
            },
            {
              icon: QrCode,
              title: "3. Show the QR",
              text: "Hall staff scan your QR token at the counter. One token per meal.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="size-10 rounded-md bg-primary/10 text-primary grid place-items-center mb-4">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-bold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground flex flex-col md:flex-row gap-3 md:justify-between">
          <div>
            © {new Date().getFullYear()} MBSTU DiningPass · Residential Hall Administration
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-foreground">Login</Link>
            <Link to="/register" className="hover:text-foreground">Register</Link>
            <Link to="/forgot-password" className="hover:text-foreground">Forgot password</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
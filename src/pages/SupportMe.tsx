import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Copy, Check, Mail, ExternalLink, Coffee, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const SupportMe = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ value, fieldId }: { value: string; fieldId: string }) => (
    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(value, fieldId)} className="h-8 w-8 shrink-0">
      {copiedField === fieldId ? (
        <Check className="w-4 h-4 text-success" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground" />
      )}
    </Button>
  );

  // Pakistan flag component
  const PakistanFlag = () => (
    <svg className="w-5 h-5" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <path fill="#006600" d="M32 5H4a4 4 0 0 0-4 4v18a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4z" />
      <path fill="#FFF" d="M9 5H4a4 4 0 0 0-4 4v18a4 4 0 0 0 4 4h5V5z" />
      <path fill="#FFF" d="M22.087 20.797a5.5 5.5 0 1 1-1.162-8.428 4.5 4.5 0 1 0 1.162 8.428z" />
      <path
        fill="#FFF"
        d="M24.5 13.5l.862 2.654h2.792l-2.258 1.641.862 2.654-2.258-1.64-2.258 1.64.862-2.654-2.258-1.641h2.792z"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="gap-2 h-10 px-4 bg-gradient-to-r from-primary/5 to-accent/10 border-primary/20 hover:border-primary/40 hover:from-primary/10 hover:to-accent/20 transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back</span>
          </Button>
          <Heart className="w-5 h-5 text-destructive animate-pulse" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center space-y-3 mb-6 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary shadow-glow mb-2">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">Support My Work</h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            If you find this app helpful, consider supporting its development 💖
          </p>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Pakistan - Raast */}
          <Card className="overflow-hidden border-2 hover:border-success/50 transition-colors animate-slide-up">
            <CardHeader className="bg-gradient-to-r from-success/10 to-accent/10 py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <PakistanFlag />
                </div>
                <CardTitle className="text-lg">Pakistan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-sm font-medium mb-1">Raast ID</p>
                    <code className="text-base font-mono font-medium">03343461801</code>
                  </div>
                  <CopyButton value="03343461801" fieldId="raast" />
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 pl-1">
                  <li className="flex items-start gap-2">
                    <span className="text-success">•</span>
                    <span>Instant transfer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">•</span>
                    <span>No fees</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* International */}
          <Card
            className="overflow-hidden border-2 hover:border-primary/50 transition-colors animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 text-xl">🌍</div>
                <CardTitle className="text-lg">International</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Buy Me a Coffee - Primary with attention-grabbing design */}
              <div className="relative">
                {/* Recommended badge */}
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive text-destructive-foreground shadow-md animate-pulse">
                    ⭐ Recommended
                  </span>
                </div>
                
                <Button
                  className="w-full gap-3 h-14 text-lg font-bold bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                  onClick={() => window.open("https://buymeacoffee.com/mohdsafwanj", "_blank")}
                >
                  {/* Animated background shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  
                  {/* Coffee icon with bounce animation */}
                  <Coffee className="w-6 h-6 animate-bounce" style={{ animationDuration: '2s' }} />
                  <span className="relative z-10">Buy Me a Coffee</span>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-60" />
                </Button>
                
                <ul className="text-xs text-muted-foreground space-y-1 pl-1 mt-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FFDD00]">✓</span>
                    <span>Fast & easy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FFDD00]">✓</span>
                    <span>Card payments accepted</span>
                  </li>
                </ul>
              </div>

              {/* ElevatePay - Secondary */}
              <div className="pt-2 border-t border-border/50">
                <p className="text-sm font-medium mb-2">Or via ElevatePay</p>
                <div className="flex items-center justify-between gap-3 p-2 bg-muted/50 rounded-lg">
                  <div className="min-w-0">
                    <code className="text-sm font-mono font-medium">+923343461801</code>
                  </div>
                  <div className="flex items-center gap-1">
                    <CopyButton value="+923343461801" fieldId="elevate" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open("https://onelink.to/elevatepay", "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 pl-1 mt-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Lower fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>App required</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact & Thank You - Combined row */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <Card
            className="overflow-hidden border hover:border-accent/50 transition-colors animate-slide-up flex-1"
            style={{ animationDelay: "0.2s" }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-accent/20 shrink-0">
                    <Mail className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Get in touch</p>
                    <code className="text-sm font-mono">mohdsafwan2k5@gmail.com</code>
                  </div>
                </div>
                <CopyButton value="mohdsafwan2k5@gmail.com" fieldId="email" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SupportMe;

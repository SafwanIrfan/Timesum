import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Globe, MapPin, Copy, Check, Mail, ExternalLink, Coffee, ArrowLeft } from "lucide-react";
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
    <Button
      variant="ghost"
      size="icon"
      onClick={() => copyToClipboard(value, fieldId)}
      className="h-8 w-8 shrink-0"
    >
      {copiedField === fieldId ? (
        <Check className="w-4 h-4 text-success" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground" />
      )}
    </Button>
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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary shadow-glow mb-4">
            <Heart className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">Support My Work</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            If you find this app helpful, consider supporting its development. Every contribution helps! 💖
          </p>
        </div>

        <div className="space-y-6">
          {/* Pakistan - Raast (Primary for PK) */}
          <Card className="overflow-hidden border-2 hover:border-success/50 transition-colors animate-slide-up">
            <CardHeader className="bg-gradient-to-r from-success/10 to-accent/10 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <MapPin className="w-5 h-5 text-success" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    🇵🇰 Pakistan
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">Raast ID (Instant · No fees)</p>
                  <code className="text-base font-mono font-medium">03343461801</code>
                </div>
                <CopyButton value="03343461801" fieldId="raast" />
              </div>
            </CardContent>
          </Card>

          {/* International */}
          <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    🌍 International
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Buy Me a Coffee - Primary */}
              <div className="space-y-3">
                <Button
                  className="w-full gap-3 h-12 text-base font-medium bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black"
                  onClick={() => window.open("https://buymeacoffee.com/mohdsafwanj", "_blank")}
                >
                  <Coffee className="w-5 h-5" />
                  Buy Me a Coffee
                  <ExternalLink className="w-4 h-4 ml-auto opacity-60" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">Fast · Card payments</p>
              </div>

              {/* ElevatePay - Secondary */}
              <div className="pt-3 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-3">Or via ElevatePay (Lower fees · App required)</p>
                <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Mobile Number</p>
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
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="overflow-hidden border hover:border-accent/50 transition-colors animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardContent className="p-5">
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

          {/* Thank You Note */}
          <div className="text-center py-6 space-y-3 animate-fade-in">
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-destructive fill-destructive animate-pulse" />
              <span className="text-base font-medium">Thank you for your support!</span>
              <Heart className="w-5 h-5 text-destructive fill-destructive animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Your contribution helps me continue building and improving this tool.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupportMe;

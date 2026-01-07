import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Copy, Check, Mail, ExternalLink, Coffee, ArrowLeft, Sparkles } from "lucide-react";
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

  // Pakistan flag component
  const PakistanFlag = () => (
    <svg className="w-6 h-6" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
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

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-8 animate-fade-in">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 blur-xl opacity-30 animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-orange-400 shadow-2xl flex items-center justify-center">
              <Heart className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
            Support My Work
          </h1>
          <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
            If you find this app helpful, your support keeps it alive! 💖
          </p>
        </div>

        {/* Payment Methods - Stacked for focus */}
        <div className="space-y-4">
          {/* Raast ID - Pakistan */}
          <Card className="overflow-hidden border-2 border-success/30 hover:border-success/60 transition-all duration-300 animate-slide-up shadow-lg hover:shadow-xl bg-gradient-to-br from-success/5 to-transparent">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-success/20 shadow-inner">
                  <PakistanFlag />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Pakistan</h3>
                  <p className="text-xs text-muted-foreground">Instant · No fees</p>
                </div>
              </div>
              
              <Button
                className="w-full gap-3 h-14 text-base font-bold bg-gradient-to-r from-[#006600] to-[#008800] hover:from-[#007700] hover:to-[#009900] text-white shadow-lg hover:shadow-success/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group rounded-xl"
                onClick={() => copyToClipboard("03343461801", "raast")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-white/80 text-sm">Raast ID:</span>
                  <code className="font-mono text-lg tracking-wide">03343461801</code>
                </span>
                {copiedField === "raast" ? (
                  <Check className="w-5 h-5 ml-auto text-white animate-scale-in" />
                ) : (
                  <Copy className="w-5 h-5 ml-auto opacity-70 group-hover:opacity-100 transition-opacity" />
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Buy Me a Coffee - International */}
          <Card
            className="overflow-hidden border-2 border-[#FFDD00]/40 hover:border-[#FFDD00]/70 transition-all duration-300 animate-slide-up shadow-lg hover:shadow-xl bg-gradient-to-br from-[#FFDD00]/10 to-transparent relative"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Recommended badge */}
            <div className="absolute -top-0 right-4 z-10">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-b-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                <Sparkles className="w-3 h-3" />
                Recommended
              </span>
            </div>
            
            <CardContent className="p-5 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#FFDD00]/30 shadow-inner">
                  <span className="text-2xl">🌍</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">International</h3>
                  <p className="text-xs text-muted-foreground">Fast · Card payments</p>
                </div>
              </div>
              
              <Button
                className="w-full gap-3 h-14 text-base font-bold bg-gradient-to-r from-[#FFDD00] to-[#FFC400] hover:from-[#FFE333] hover:to-[#FFD000] text-black shadow-lg hover:shadow-[#FFDD00]/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group rounded-xl"
                onClick={() => window.open("https://buymeacoffee.com/mohdsafwanj", "_blank")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Coffee className="w-6 h-6 relative z-10 group-hover:animate-bounce" style={{ animationDuration: '1s' }} />
                <span className="relative z-10 font-bold">Buy Me a Coffee</span>
                <ExternalLink className="w-4 h-4 ml-auto opacity-60 group-hover:opacity-100 transition-opacity" />
              </Button>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card
            className="overflow-hidden border hover:border-accent/50 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-accent/20 shrink-0">
                    <Mail className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Questions? Get in touch</p>
                    <code className="text-sm font-mono text-foreground">mohdsafwan2k5@gmail.com</code>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard("mohdsafwan2k5@gmail.com", "email")}
                  className="h-8 w-8 shrink-0"
                >
                  {copiedField === "email" ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Thank you footer */}
        <p className="text-center text-sm text-muted-foreground mt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          Thank you for your support! Every contribution helps. 🙏
        </p>
      </main>
    </div>
  );
};

export default SupportMe;

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Globe, MapPin, Copy, Check, Eye, EyeOff, Mail, ExternalLink, Sparkles, ArrowLeft, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const SupportMe = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showElevateNumber, setShowElevateNumber] = useState(false);
  const [showNayaPayId, setShowNayaPayId] = useState(false);
  const [showRaastId, setShowRaastId] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
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

  const MaskedInfo = ({
    label,
    maskedValue,
    realValue,
    isRevealed,
    onToggle,
    fieldId,
  }: {
    label: string;
    maskedValue: string;
    realValue: string;
    isRevealed: boolean;
    onToggle: () => void;
    fieldId: string;
  }) => (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <code className="bg-muted px-3 py-2 rounded-lg font-mono text-sm sm:text-base flex-1 min-w-0">
          {isRevealed ? realValue : maskedValue}
        </code>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onToggle} className="shrink-0">
            {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          {isRevealed && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(realValue, fieldId)}
              className="shrink-0"
            >
              {copiedField === fieldId ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>
      {!isRevealed && <p className="text-xs text-muted-foreground">Click the eye icon to reveal</p>}
    </div>
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
            <Home className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium">Back to App</span>
          </Button>
          <Heart className="w-5 h-5 text-destructive animate-pulse" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary shadow-glow mb-4">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">Support My Work</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            If you find this app helpful, consider supporting its development. Every contribution helps keep this
            project alive! 💖
          </p>
        </div>

        <div className="space-y-6">
          {/* International Payments */}
          <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors animate-slide-up">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">International Payments</CardTitle>
                  <CardDescription>For users outside Pakistan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="p-2 rounded-full bg-primary/10 shrink-0">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Send via ElevatePay</p>
                  <p className="text-sm text-muted-foreground">
                    ElevatePay lets you send money instantly and securely. Download the app, click send, and enter my
                    mobile number.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 mt-2"
                    onClick={() => window.open("https://onelink.to/elevatepay", "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Download ElevatePay
                  </Button>
                </div>
              </div>

              <MaskedInfo
                label="Mobile number for ElevatePay:"
                maskedValue="+92 3XX XXX XX XX"
                realValue="+923343461801"
                isRevealed={showElevateNumber}
                onToggle={() => setShowElevateNumber(!showElevateNumber)}
                fieldId="elevate"
              />
            </CardContent>
          </Card>

          {/* Pakistan Payments */}
          <Card
            className="overflow-hidden border-2 hover:border-success/50 transition-colors animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader className="bg-gradient-to-r from-success/10 to-accent/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <MapPin className="w-6 h-6 text-success" />
                </div>
                <div>
                  <CardTitle className="text-xl">Pakistan Only</CardTitle>
                  <CardDescription>For users within Pakistan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="p-2 rounded-full bg-success/10 shrink-0">
                  <Heart className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium">Send via NayaPay or Raast</p>
                  <p className="text-sm text-muted-foreground">
                    Use NayaPay ID or Raast ID for instant domestic transfers within Pakistan.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <MaskedInfo
                  label="NayaPay ID:"
                  maskedValue="m•••••••••@nayapay"
                  realValue="mohdsafwan2k5@nayapay"
                  isRevealed={showNayaPayId}
                  onToggle={() => setShowNayaPayId(!showNayaPayId)}
                  fieldId="nayapay"
                />

                <MaskedInfo
                  label="Raast ID:"
                  maskedValue="03XX XXX XXXX"
                  realValue="03343461801"
                  isRevealed={showRaastId}
                  onToggle={() => setShowRaastId(!showRaastId)}
                  fieldId="raast"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card
            className="overflow-hidden border-2 hover:border-accent/50 transition-colors animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader className="bg-gradient-to-r from-accent/10 to-muted/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Mail className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Get in Touch</CardTitle>
                  <CardDescription>Have questions or want to discuss something?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <MaskedInfo
                label="Email Address:"
                maskedValue="m•••••••••@gmail.com"
                realValue="mohdsafwan2k5@gmail.com"
                isRevealed={showEmail}
                onToggle={() => setShowEmail(!showEmail)}
                fieldId="email"
              />
            </CardContent>
          </Card>

          {/* Thank You Note */}
          <div className="text-center py-8 space-y-4 animate-fade-in">
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-destructive fill-destructive animate-pulse" />
              <span className="text-lg font-medium">Thank you for your support!</span>
              <Heart className="w-5 h-5 text-destructive fill-destructive animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your contribution helps me continue building and improving this tool. I truly appreciate every bit of
              support!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupportMe;

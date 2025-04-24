
import { ArrowRightCircle, Book, FileEdit, FileCheck, QrCode } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { FeatureCard } from "@/components/FeatureCard";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Index() {
  const features = [
    {
      title: "Intuitive Template Designer",
      description: "Create beautiful certificate designs with our drag-and-drop editor. Add text, images, and custom fields with ease.",
      icon: FileEdit,
      iconClassName: "bg-blue-100 text-blue-600"
    },
    {
      title: "Bulk Certificate Generation",
      description: "Generate hundreds of certificates at once by importing recipient data from a CSV file.",
      icon: FileCheck,
      iconClassName: "bg-green-100 text-green-600"
    },
    {
      title: "Secure Verification",
      description: "Every certificate includes a unique QR code that links to a verification page, ensuring authenticity.",
      icon: QrCode,
      iconClassName: "bg-purple-100 text-purple-600"
    },
    {
      title: "Comprehensive Records",
      description: "Keep track of all certificates issued, with detailed analytics and reporting features.",
      icon: Book,
      iconClassName: "bg-amber-100 text-amber-600"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        <Hero />
        
        {/* Features Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Powerful Certificate Management</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to design, issue, and verify professional certificates in one platform.
              </p>
            </div>
            
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index} 
                  title={feature.title} 
                  description={feature.description} 
                  icon={feature.icon}
                  iconClassName={feature.iconClassName}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                Create and issue certificates in three simple steps.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Design Your Template",
                  description: "Create a beautiful certificate template using our drag-and-drop designer."
                },
                {
                  step: "2",
                  title: "Enter Recipient Details",
                  description: "Add recipient information individually or upload in bulk via CSV."
                },
                {
                  step: "3",
                  title: "Generate & Share",
                  description: "Generate certificates as PDFs, download them, or send directly to recipients."
                }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-md relative">
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 mt-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/templates">
                <Button size="lg">
                  Get Started Now
                  <ArrowRightCircle size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Call To Action */}
        <div className="bg-brand-500 py-16 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold">Ready to create professional certificates?</h2>
            <p className="mt-4 text-xl max-w-2xl mx-auto text-white/90">
              Join thousands of organizations that use VerifyCert to create, manage and verify their certificates.
            </p>
            <div className="mt-8">
              <Link to="/templates">
                <Button size="lg" variant="secondary">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

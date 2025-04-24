
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8 xl:mt-20">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Professional certificates</span>
                <span className="block text-brand-600 mt-2">made simple</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0 md:mt-5 md:text-xl">
                Design, generate, and verify certificates with ease. Create beautiful templates, bulk generate certificates for all your recipients, and provide secure verification—all in one platform.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link to="/templates">
                    <Button size="lg" className="w-full">
                      Create Your First Certificate
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link to="/designer">
                    <Button variant="outline" size="lg" className="w-full">
                      Try the Designer
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="h-56 w-full bg-gradient-to-br from-brand-100 to-brand-200 sm:h-72 md:h-96 lg:w-full lg:h-full lg:opacity-90 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg transform rotate-3 mx-8 md:w-[500px]">
            <div className="border-4 border-brand-200 p-6 rounded">
              <div className="flex justify-between mb-4">
                <div className="h-16 w-16 bg-brand-100 rounded-full"></div>
                <div className="h-16 w-16 bg-brand-100 rounded-full"></div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-playfair font-bold mb-2">Certificate of Achievement</h2>
                <p className="text-gray-600 mb-4">This certifies that</p>
                <p className="text-xl font-playfair font-bold mb-4">John Smith</p>
                <p className="text-gray-600 mb-8">has successfully completed the course</p>
                <div className="flex justify-between items-center mt-10">
                  <div className="h-px w-1/4 bg-gray-300"></div>
                  <div className="h-16 w-16 bg-brand-100 rounded-full"></div>
                  <div className="h-px w-1/4 bg-gray-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;

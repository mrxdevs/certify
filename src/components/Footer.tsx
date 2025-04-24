
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center -mx-5 -my-2">
          <div className="px-5 py-2">
            <Link to="/templates" className="text-base text-gray-500 hover:text-gray-900">
              Templates
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/designer" className="text-base text-gray-500 hover:text-gray-900">
              Designer
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/generate" className="text-base text-gray-500 hover:text-gray-900">
              Generate
            </Link>
          </div>
          <div className="px-5 py-2">
            <a href="#" className="text-base text-gray-500 hover:text-gray-900">
              About
            </a>
          </div>
          <div className="px-5 py-2">
            <a href="#" className="text-base text-gray-500 hover:text-gray-900">
              Privacy
            </a>
          </div>
          <div className="px-5 py-2">
            <a href="#" className="text-base text-gray-500 hover:text-gray-900">
              Terms
            </a>
          </div>
        </nav>
        <p className="mt-8 text-center text-base text-gray-500">
          &copy; {new Date().getFullYear()} VerifyCert. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

// import { useNavigate } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram, LogOut } from "lucide-react";
import LogoutButton from "@/components/common/logout-button";

function Studentfooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 px-6 lg:px-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h3 className="text-white text-xl font-bold">EduCore</h3>
          <p className="text-sm mt-3">
            Empowering learners worldwide 🌍 <br />
            Learn skills, grow careers, and build your future.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/courses" className="hover:text-white transition">
                Courses
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-white transition">
                About Us
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-white transition">
                Contact
              </a>
            </li>
            <li>
              <a href="/faq" className="hover:text-white transition">
                FAQ
              </a>
            </li>
            <li>
              {/* Logout with confirmation dialog */}
              <LogoutButton
                trigger={
                  <span className="inline-flex items-center gap-2 hover:text-white transition cursor-pointer">
                    <LogOut size={16} /> Logout
                  </span>
                }
              />
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-white font-semibold mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white transition">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-white transition">
              <Twitter size={20} />
            </a>
            <a href="#" className="hover:text-white transition">
              <Linkedin size={20} />
            </a>
            <a href="#" className="hover:text-white transition">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
        © {new Date().getFullYear()} EduCore. All rights reserved.
      </div>
    </footer>
  );
}

export default Studentfooter;

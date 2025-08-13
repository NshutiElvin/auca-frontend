import { LogoIcon } from "./Icons";

export const Footer = () => {
  return (
    <footer id="footer">
      <hr className="w-11/12 mx-auto" />

      <section className="container py-20 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
        <div className="col-span-full xl:col-span-2">
          <a
            rel="noreferrer noopener"
            href="/"
            className="font-bold text-xl flex"
          >
             <img src="/logo.png" alt="logo" className="h-[75px] mb-5 mt-5"/>
          </a>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Connect</h3>
          <div>
            <a
              rel="noreferrer noopener"
              href=""
              target="_blank"
              className="opacity-60 hover:opacity-100"
            >
              GitHub
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href=""
              target="_blank"
              className="opacity-60 hover:opacity-100"
            >
              Twitter
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href=""
              className="opacity-60 hover:opacity-100"
            >
              Email Support
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Platforms</h3>
          <div>
            <a href="/student" className="opacity-60 hover:opacity-100">
              Student Portal
            </a>
          </div>
          <div>
            <a href="/admin" className="opacity-60 hover:opacity-100">
              Admin Dashboard
            </a>
          </div>

           <div>
            <a href="/instructor" className="opacity-60 hover:opacity-100">
              Instructor Portal
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">About</h3>
          <div>
            <a href="#features" className="opacity-60 hover:opacity-100">
              Features
            </a>
          </div>
          <div>
            <a href="#faq" className="opacity-60 hover:opacity-100">
              FAQ
            </a>
          </div>
          <div>
            <a href="#howItWorks" className="opacity-60 hover:opacity-100">
              How It Works
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Resources</h3>
          <div>
            <a
              href=""
              target="_blank"
              rel="noreferrer noopener"
              className="opacity-60 hover:opacity-100"
            >
              AUCA Website
            </a>
          </div>
         
          <div>
            <a
              href="/admin/schedules"
              target="_blank"
              rel="noreferrer noopener"
              className="opacity-60 hover:opacity-100"
            >
              Course Schedules
            </a>
          </div>
        </div>
      </section>

      <section className="container pb-14 text-center">
        <h3>
          &copy; {new Date().getFullYear()}  AUCA ES&RA System. All rights reserved. 
        </h3>
      </section>
    </footer>
  );
};

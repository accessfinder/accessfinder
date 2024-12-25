import Link from 'next/link'
import Image from 'next/image'
export default function BottomBar() {
  return (
    <footer className="border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Image
              className="h-10"
              src="/images/vercel.svg"
              alt="Company Logo"
              width="40"
              height="40"
            />
            <p >
              Discover and share accessibility
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold  tracking-wider uppercase">Social</h3>
                <ul className="mt-4 space-y-4">
                  {['Instagram', 'Github'].map((item) => (
                    <li key={item}>
                      <Link href="#">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold  tracking-wider uppercase">Support</h3>
                <ul className="mt-4 space-y-4">
                  {['Contact', 'Documentation'].map((item) => (
                    <li key={item}>
                      <Link href="#" >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold  tracking-wider uppercase">Company</h3>
                <ul className="mt-4 space-y-4">
                  {['About', 'Business Inquiry'].map((item) => (
                    <li key={item}>
                      <Link href="#" >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold tracking-wider uppercase">Legal</h3>
                <ul className="mt-4 space-y-4">
                  {['Privacy', 'Terms'].map((item) => (
                    <li key={item}>
                      <Link href="#" >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t  pt-8">
          <p className="xl:text-center">
            &copy; 2025 Access Finder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}


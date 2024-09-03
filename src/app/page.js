'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Cookies from 'js-cookie';
import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAnimation } from 'framer-motion';
import useFonts from '@/components/hooks/useFonts';
import dynamic from 'next/dynamic';
import Dashboard from '@/components/Dashboard';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';

export default function Home() {
  const [wallet, setwallet] = useState('');

  const { righteous } = useFonts();

  const { ref, inView } = useInView({ threshold: 0.3 });
  const animation = useAnimation();
  const animation2 = useAnimation();
  const animation3 = useAnimation();

  /** @typedef {string} OpenIdProvider */
  useEffect(() => {
    console.log('inView', inView);

    if (!inView) {
      animation.start({
        x: -300,
        opacity: 0,
        scale: 0,
      });
      animation2.start({
        scale: 0,
        opacity: 0,
        x: 300,
      });
      animation3.start({
        opacity: 0,
        y: 300,
      });
    } else {
      animation.start({
        x: 0,
        opacity: 1,
        scale: 1,
      });
      animation2.start({
        scale: 1,
        opacity: 1,
        x: 0,
      });
      animation3.start({
        y: 0,
        opacity: 1,
      });
    }
  }, [inView, animation, animation2]);

  useEffect(() => {
    const call = () => {
      const loggedin = Cookies.get('idea_wallet');
      setwallet(loggedin);
    };
    call();
  }, []);

  const [scrollDirection, setScrollDirection] = useState('down');
  const [prevScrollY, setPrevScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > prevScrollY) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }

      setPrevScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollY]);

  return (
    <>
      <header className={'sticky top-0'}>
        <nav
          className="bg-gradient-to-r from-[#000000] via-gray-800 to-[#000000] dark:bg-gray-800 px-4 lg:px-6 py-2.5 h-[9vh] "
          style={{
            borderBottom: '2px solid',
            borderImage: 'linear-gradient(to right, #a16821, #3596c2) 1',
          }}
        >
          <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            <Link href="/" className="flex items-center">
              {/*TODO done: Please check entire codebase for 'class' must be replaced with 'className'*/}
              <img src="/sharetos.png" className="mr-3 h-6 sm:h-9" alt="" />
            </Link>
            {/*TODO: Show tooltip when user is not logged in, show create-idea btn, don't hide it*/}
            <div className="flex gap-6">
              {
                <div className="flex items-center lg:order-1">
                  <Link href="/create">
                    <button className="p-[3px] relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#539b82] to-[#aba564] rounded-lg" />
                      <div className="px-4 py-1.5  bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent">
                        Create Idea
                      </div>
                    </button>
                  </Link>
                </div>
              }

              <div className="flex items-center lg:order-2">
                <Navbar />
              </div>
            </div>
          </div>
        </nav>
      </header>
      <BackgroundBeamsWithCollision>
        <Dashboard />
      </BackgroundBeamsWithCollision>
    </>
  );
}
